-- Prepared and tested locally only. No cloud execution is authorized.
begin;
alter table public.ai_predictions add column result_snapshot jsonb;
create function public.save_scan(p_result jsonb) returns uuid language plpgsql security definer set search_path='' as $$
declare prediction uuid; existing public.ai_predictions%rowtype; detection jsonb; model uuid;
begin
 if auth.uid() is null or not private.is_active() then raise exception 'not_authorized';end if;
 if p_result->>'schemaVersion'<>'1.1' or jsonb_typeof(p_result->'detections')<>'array' or jsonb_array_length(p_result->'detections')>100 or pg_column_size(p_result)>150000 then raise exception 'invalid_result';end if;
 if p_result ? 'image' or p_result ? 'imageBase64' then raise exception 'raw_images_not_allowed';end if;
 prediction:=(p_result->>'predictionId')::uuid;
 select * into existing from public.ai_predictions where user_id=auth.uid() and request_key=prediction;
 if found then
  if existing.result_snapshot is distinct from p_result then raise exception 'idempotency_conflict';end if;
  return existing.id;
 end if;
 select id into model from public.model_versions where version=p_result->>'modelVersion' and artifact_sha256=p_result->>'artifactSha256';
 insert into public.ai_predictions(id,user_id,request_key,model_version_id,mode,provenance,quality,status,result_snapshot) values(prediction,auth.uid(),prediction,model,p_result->>'mode','client_reported',p_result->>'quality',p_result->>'sceneDecision',p_result);
 for detection in select value from jsonb_array_elements(p_result->'detections') loop
  insert into public.ai_detections(id,prediction_id,user_id,class_key,label,confidence,decision,x_min,y_min,x_max,y_max) values((detection->>'detectionId')::uuid,prediction,auth.uid(),detection->>'classId',detection->>'label',(detection->>'confidence')::double precision,detection->>'decision',(detection->'box'->>'xMin')::double precision,(detection->'box'->>'yMin')::double precision,(detection->'box'->>'xMax')::double precision,(detection->'box'->>'yMax')::double precision);
 end loop;
 return prediction;
end;$$;
revoke all on function public.save_scan(jsonb) from public;
grant execute on function public.save_scan(jsonb) to authenticated;
create function public.member_summary() returns jsonb language sql stable security invoker set search_path='' as $$
 select jsonb_build_object('scans',(select count(*) from public.ai_predictions where user_id=auth.uid()),'disposals',(select count(*) from public.confirmed_disposals where user_id=auth.uid()),'items',(select coalesce(sum(quantity),0) from public.confirmed_disposals where user_id=auth.uid()));
$$;
revoke all on function public.member_summary() from public;
grant execute on function public.member_summary() to authenticated;
commit;
