UPDATE auth.email_templates
SET template = REPLACE(template, 'https://example.com/auth/callback', 'https://sharp-borg6-jy759.view-2.tempo-dev.app/auth/callback')
WHERE template_id = 'email_confirm';