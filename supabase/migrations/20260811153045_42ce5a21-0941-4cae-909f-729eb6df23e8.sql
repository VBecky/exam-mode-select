DELETE FROM public.exam_questions WHERE subject_id IN (3,4,5) AND year = '2017 E.C.';
UPDATE public.exam_questions SET year = '2017 E.C.' WHERE subject_id IN (3,4,5) AND year = '2017';