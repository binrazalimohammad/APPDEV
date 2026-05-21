# Symfony (casaclick) — Google OAuth + Lexik JWT (copy into your Symfony repo)

These files are **templates** for your [`casaclick`](https://github.com/binrazalimohammad/casaclick) Symfony project.  
The React Native app calls **`POST /api/auth/google`** with `{ "idToken": "..." }` and expects `{ "token": "..." }` (Lexik JWT).

## 1) Composer

From your `casaclick` project root:

```bash
composer require hwi/oauth-bundle google/apiclient
```

If Lexik JWT is not installed yet:

```bash
composer require lexik/jwt-authentication-bundle
```

## 2) Environment (`.env` / `.env.local`)

Add (use values from **Google Cloud Console** → APIs & Services → Credentials):

```env
GOOGLE_CLIENT_ID=your-web-or-android-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

- **Web client** `client_id` is what the mobile app uses as `webClientId` and what `google/apiclient` uses to verify `idToken` (audience).
- **Client secret** is required for **HWIOAuthBundle** web redirect flow (server-side OAuth).

## 3) Routes import

In `config/routes.yaml` (or equivalent), import the HWI route file:

```yaml
hwi_google:
    resource: routes/hwi_google.yaml
```

Then copy the YAML files from `config/` in this folder into your project.

## 4) Copy PHP + YAML files

- `config/packages/hwi_oauth.yaml`
- `config/routes/hwi_google.yaml`
- `src/Controller/Api/GoogleTokenAuthController.php`
- `src/Controller/Web/GoogleOAuthCallbackController.php`

## 5) Wire services

Add a bind for the controller (example `config/services.yaml`):

```yaml
services:
    _defaults:
        bind:
            $googleClientId: '%env(GOOGLE_CLIENT_ID)%'
```

## 6) Security (`config/packages/security.yaml`)

Allow anonymous access to the mobile token exchange and (if needed) HWI paths, for example:

```yaml
access_control:
    - { path: ^/api/auth/google, roles: PUBLIC_ACCESS }
    - { path: ^/connect/, roles: PUBLIC_ACCESS }
    - { path: ^/auth/google/callback, roles: PUBLIC_ACCESS }
```

Tune firewalls to match your app (API Platform, `main`, etc.).

## 7) User entity

`GoogleTokenAuthController` assumes `App\Entity\User` with at least:

- `email`
- `password` (hashed; auto-generated for Google-only users)
- optional: `googleId` / `roles` per your schema

Adjust the controller to match your actual entity and repository.

## 8) CORS (mobile)

Ensure `nelmio_cors` allows your React Native dev origins, or use permissive dev settings.

## References

- [HWIOAuthBundle](https://github.com/hwi/HWIOAuthBundle)
- [Lexik JWT Authentication Bundle](https://github.com/lexik/LexikJWTAuthenticationBundle)
