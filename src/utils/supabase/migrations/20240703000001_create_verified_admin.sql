-- Create a verified admin account
INSERT INTO auth.users (id, email, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, last_sign_in_at, encrypted_password)
VALUES 
('00000000-0000-0000-0000-000000000000', 'verified-admin@squashacademy.com', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Verified Admin","role":"admin"}', false, now(), now(), now(), '$2a$10$Xt9Hn8QpNP8nT.9Yc.ZYAuHIVMjIBtGk.j.ixJwwwVs1xQEHtXJlK')
ON CONFLICT (id) DO NOTHING;

-- Create the user record in the public schema
INSERT INTO public.users (id, email, full_name, name, role, user_id, token_identifier, created_at)
VALUES 
('00000000-0000-0000-0000-000000000000', 'verified-admin@squashacademy.com', 'Verified Admin', 'Verified Admin', 'admin', '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000', now())
ON CONFLICT (id) DO NOTHING;
