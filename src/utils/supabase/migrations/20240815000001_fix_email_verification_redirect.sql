-- Update the site URL for email verification redirects
UPDATE auth.config
SET site_url = COALESCE(current_setting('site_url', true), 'https://sharp-borg6-jy759.view-2.tempo-dev.app');
