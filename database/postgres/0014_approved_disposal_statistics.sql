begin;
create or replace function public.member_summary() returns jsonb language sql stable security invoker set search_path='' as $$
 select jsonb_build_object(
  'scans',(select count(*) from public.ai_predictions where user_id=auth.uid()),
  'disposals',(select count(*) from public.disposal_evidence where user_id=auth.uid() and status='approved'),
  'items',(select coalesce(sum(quantity),0) from public.disposal_evidence where user_id=auth.uid() and status='approved'),
  'quizAttempts',(select count(*) from public.quiz_attempts where user_id=auth.uid()),
  'quizCorrect',(select coalesce(sum(score),0) from public.quiz_attempts where user_id=auth.uid()),
  'quizPossible',(select coalesce(sum(max_score),0) from public.quiz_attempts where user_id=auth.uid()),
  'series',(select jsonb_agg(jsonb_build_object('day',d.day::date,'count',(select coalesce(sum(quantity),0) from public.disposal_evidence where user_id=auth.uid() and status='approved' and (reviewed_at at time zone 'Asia/Bangkok')::date=d.day::date)) order by d.day) from generate_series(((now() at time zone 'Asia/Bangkok')::date-6)::timestamp,(now() at time zone 'Asia/Bangkok')::date::timestamp,interval '1 day') d(day))
 );
$$;
commit;
