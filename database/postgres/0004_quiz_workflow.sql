-- Review candidate; executed only in local tests, never on Supabase Cloud.
begin;
create function public.admin_quiz_questions() returns table(id uuid,quiz_id uuid,"position" integer,prompt text,choices jsonb,answer integer,explanation text)
language plpgsql security definer set search_path='' as $$begin
 if not private.is_admin() then raise exception 'not_authorized';end if;
 return query select q.id,q.quiz_id,q.position,q.prompt,q.choices,k.answer+1,k.explanation from public.quiz_questions q join private.quiz_answer_keys k on k.question_id=q.id order by q.quiz_id,q.position limit 100;
end;$$;
create function public.admin_save_question(p_id uuid,p_quiz uuid,p_position integer,p_prompt text,p_choices jsonb,p_answer integer,p_explanation text) returns uuid
language plpgsql security definer set search_path='' as $$declare result uuid;begin
 if not private.is_admin() then raise exception 'not_authorized';end if;
 if p_position<1 or p_position>100 or length(p_prompt) not between 1 and 1000 or jsonb_typeof(p_choices)<>'array' or jsonb_array_length(p_choices) not between 2 and 8 or p_answer<0 or p_answer>=jsonb_array_length(p_choices) then raise exception 'invalid_question';end if;
 if exists(select 1 from public.quiz_attempts where quiz_id=p_quiz) or (p_id is not null and exists(select 1 from public.quiz_attempts a join public.quiz_questions q on q.quiz_id=a.quiz_id where q.id=p_id)) then raise exception 'create_new_quiz_version';end if;
 if p_id is null then
  insert into public.quiz_questions(quiz_id,position,prompt,choices) values(p_quiz,p_position,p_prompt,p_choices) returning id into result;
 else
  update public.quiz_questions set quiz_id=p_quiz,position=p_position,prompt=p_prompt,choices=p_choices where id=p_id returning id into result;
  if not found then raise exception 'question_not_found';end if;
 end if;
 insert into private.quiz_answer_keys(question_id,answer,explanation) values(result,p_answer,p_explanation) on conflict(question_id) do update set answer=excluded.answer,explanation=excluded.explanation;
 insert into private.audit_logs(actor_id,event,entity_id) values(auth.uid(),'quiz_question_saved',result);
 return result;
end;$$;
create function public.grade_quiz(p_quiz uuid,p_event uuid,p_answers jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$declare question_row record;total integer;score integer:=0;choice integer;attempt uuid;prior jsonb;feedback jsonb:='[]';begin
 if auth.uid() is null or not private.is_active() then raise exception 'not_authorized';end if;
 if not exists(select 1 from public.quizzes where id=p_quiz and status='published') then raise exception 'quiz_not_published';end if;
 if jsonb_typeof(p_answers)<>'object' or pg_column_size(p_answers)>20000 then raise exception 'invalid_answers';end if;
 select id into attempt from public.quiz_attempts where user_id=auth.uid() and client_attempt_key=p_event;
 if found then
  select jsonb_object_agg(question_id::text,selected_choice) into prior from public.quiz_answers where attempt_id=attempt;
  if prior is distinct from p_answers then raise exception 'idempotency_conflict';end if;
  if not exists(select 1 from public.quiz_attempts a where a.id=attempt and a.quiz_id=p_quiz) then raise exception 'idempotency_conflict';end if;
  return (select jsonb_build_object('id',a.id,'score',a.score,'total',a.max_score,'saved',true) from public.quiz_attempts a where a.id=attempt);
 end if;
 select count(*) into total from public.quiz_questions where quiz_id=p_quiz;
 if total not between 1 and 100 or (select count(*) from jsonb_object_keys(p_answers))<>total then raise exception 'incomplete_answers';end if;
 if (select count(*) from public.quiz_questions q join private.quiz_answer_keys k on k.question_id=q.id where q.quiz_id=p_quiz)<>total then raise exception 'quiz_answer_key_incomplete';end if;
 for question_row in select questions.*,keys.answer,keys.explanation from public.quiz_questions questions join private.quiz_answer_keys keys on keys.question_id=questions.id where questions.quiz_id=p_quiz order by questions.position loop
  choice:=(p_answers->>question_row.id::text)::integer;
  if choice is null or choice<0 or choice>=jsonb_array_length(question_row.choices) then raise exception 'invalid_choice';end if;
  if choice=question_row.answer then score:=score+1;end if;
  feedback:=feedback||jsonb_build_array(jsonb_build_object('id',question_row.id,'correct',choice=question_row.answer,'explanation',question_row.explanation));
 end loop;
 insert into public.quiz_attempts(user_id,quiz_id,client_attempt_key,score,max_score) values(auth.uid(),p_quiz,p_event,score,total) returning id into attempt;
 insert into public.quiz_answers(attempt_id,question_id,user_id,quiz_id,selected_choice) select attempt,id,auth.uid(),p_quiz,(p_answers->>id::text)::integer from public.quiz_questions where quiz_id=p_quiz;
 return jsonb_build_object('id',attempt,'score',score,'total',total,'saved',true,'feedback',feedback);
end;$$;
revoke all on function public.admin_quiz_questions(),public.admin_save_question(uuid,uuid,integer,text,jsonb,integer,text),public.grade_quiz(uuid,uuid,jsonb) from public;
grant execute on function public.admin_quiz_questions(),public.admin_save_question(uuid,uuid,integer,text,jsonb,integer,text),public.grade_quiz(uuid,uuid,jsonb) to authenticated;
revoke insert,update on public.quiz_questions from authenticated;
commit;
