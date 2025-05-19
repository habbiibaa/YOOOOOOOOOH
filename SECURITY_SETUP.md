# Security Setup Guide for Squash Academy Platform

This guide explains how to properly configure security features in your Supabase project to protect your application and user data.

## 1. Row Level Security (RLS) Policies

Row Level Security policies are crucial for protecting your data even if your API keys are exposed. Follow these steps to set up RLS:

1. Go to your Supabase dashboard → SQL Editor
2. Create a new query and paste the SQL code from `src/utils/supabase/rls-policies.ts`
3. Execute the SQL statements to enable RLS and create policies for all tables

These policies ensure:
- Players can only see available sessions and their own bookings
- Coaches can only see and modify their own sessions
- Admins have full access to all sessions
- Only authenticated users can book sessions

## 2. Authentication Security

### Enable CAPTCHA Protection

1. Go to Supabase Dashboard → Authentication → Settings
2. Scroll down to "Security and Protection"
3. Toggle ON "Enable CAPTCHA Protection"
4. Enter your reCAPTCHA site keys (v2):
   - Get keys from [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
   - Add the site key to your environment variables as `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
   - Add the secret key to your environment variables as `CAPTCHA_SECRET_KEY`

### Configure Connection Limits

1. Go to Supabase Dashboard → Authentication → Settings
2. Set "Max Direct Auth Connections" to a reasonable value (e.g., 10-20)
3. This helps prevent brute force attacks

## 3. Database Security

### Limit Connection Pool

1. Go to Supabase Dashboard → Database → Settings
2. Set appropriate Pool Settings:
   - Pool Mode: Transaction
   - Pool Size: 10 (or appropriate for your application size)
   - Connection Timeout: 30s
   - Idle Timeout: 300s
   - Statement Timeout: 10000ms (10 seconds)

### Apply Rate Limiting

1. Go to Supabase Dashboard → API → Settings
2. Configure appropriate rate limits for your API requests

## 4. Attack Protection

### Enable Gateway Security Features

1. Go to Supabase Dashboard → Settings → API
2. Enable the following:
   - JWT Verification
   - DDoS Protection
   - API Gateway Request Throttling

## 5. Environment Variables

Ensure these environment variables are set in your `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
CAPTCHA_SECRET_KEY=your_recaptcha_secret_key
```

## 6. Security Best Practices

1. **Never** expose your service role key in client-side code
2. Implement proper validation for all user inputs
3. Use the enhanced client with CAPTCHA protection for authentication
4. Set up monitoring and logging for suspicious activities
5. Regularly update dependencies to patch security vulnerabilities
6. Review RLS policies when schema changes to ensure they remain effective

## 7. Testing Security

After implementing these security measures, test the following:

1. A player can only book available sessions
2. A player cannot view or modify other players' bookings
3. A coach can only view and update their own schedule
4. CAPTCHA protection prevents automated login attempts
5. Rate limiting prevents excessive API requests
6. Admin operations require proper authentication and authorization

## Resources

- [Supabase Security Documentation](https://supabase.com/docs/guides/auth/managing-user-data)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Google reCAPTCHA Documentation](https://developers.google.com/recaptcha/docs/display)
- [OWASP Top 10 Web Application Security Risks](https://owasp.org/www-project-top-ten/) 