insert into public.campuses(code,name,timezone) values ('supercampus-main','SUPERCAMPUS Main Campus','Asia/Kolkata') on conflict(code) do update set name=excluded.name,timezone=excluded.timezone;
