# Central Auth Integration Guide

This auth service is queue-driven. Apps do not trigger Microsoft login directly. Instead, an app backend publishes a BullMQ login-request job, polls central auth for status, and redirects the browser only after the auth worker has prepared the Microsoft URL.

## What central auth owns

- Microsoft Entra SSO
- Access JWT creation
- Refresh-token rotation
- Shared auth cookies
- Central auth-only tables with `auth_` prefixes

## What app backends own

- Their own business tables
- Local authorization rules
- Local user rows needed for foreign keys
- Optional app-specific role assignment logic

## BullMQ contract

Queue name:
`central-auth-login`

Job payload:

```json
{
  "requestId": "uuid-generated-by-your-app",
  "appCode": "hr-portal",
  "successRedirectUrl": "http://localhost:3001",
  "failureRedirectUrl": "http://localhost:3001/login",
  "logoutRedirectUrl": "http://localhost:3001/login",
  "syncUserUrl": "http://localhost:3000/api/auth/sso/sync",
  "returnTo": "/",
  "requestedBy": "user@company.com",
  "requestedFromIp": "127.0.0.1",
  "requestedUserAgent": "Mozilla/5.0"
}
```

## Recommended sync flow

After Microsoft login succeeds, central auth should call the app backend's sync endpoint before issuing the final JWT for that app.

Why:

- the app can create its local user row immediately
- the app can preserve or resolve its real local role
- the JWT role claim can reflect the app's actual role instead of a generic default

Sync endpoint example:
`POST /api/auth/sso/sync`

Required header:
`x-auth-sync-secret: <AUTH_SYNC_SECRET>`

Request body example:

```json
{
  "email": "user@company.com",
  "firstName": "Ava",
  "lastName": "Shah",
  "role": "user",
  "tenantId": "entra-tenant-id",
  "appCode": "hr-portal"
}
```

Response example:

```json
{
  "data": {
    "id": "local-user-id",
    "email": "user@company.com",
    "role": "admin",
    "roles": ["admin", "employee"],
    "created": true
  }
}
```

Central auth will then sign the access JWT with the returned app role.

## Minimal integration steps for another web app

1. Add BullMQ and ioredis to the app backend.
2. Configure these env vars in that app backend:
   - `AUTH_SERVICE_BASE_URL`
   - `AUTH_REQUEST_QUEUE_NAME`
   - `AUTH_SYNC_SECRET`
   - `REDIS_HOST`
   - `REDIS_PORT`
   - `REDIS_PASSWORD` if needed
   - `JWT_SECRET`
   - `JWT_ISSUER`
   - `JWT_AUDIENCE`
   - `AUTH_COOKIE_NAME`
3. Expose a sync endpoint such as `POST /api/auth/sso/sync`.
4. Generate a `requestId` in the app backend.
5. Publish a BullMQ job with the payload shown above.
6. Poll `GET {AUTH_SERVICE_BASE_URL}/api/auth/requests/:requestId`.
7. When response status becomes `ready`, redirect the browser to `authUrl`.
8. After Microsoft login finishes, central auth sets `authcookie1` and `refreshcookie1`.
9. Verify the JWT in the app backend.
10. If the access token expires, call `POST {AUTH_SERVICE_BASE_URL}/api/auth/refresh` with cookies included.
11. For logout, call `POST {AUTH_SERVICE_BASE_URL}/api/auth/logout`.

## Poll response shape

```json
{
  "data": {
    "requestId": "...",
    "appCode": "hr-portal",
    "status": "queued|ready|authenticated|failed|expired",
    "authUrl": "https://login.microsoftonline.com/...",
    "errorMessage": null,
    "expiresAt": "2026-01-01T00:00:00.000Z"
  }
}
```

## JWT verification contract

Verify using:

- secret: `JWT_SECRET`
- issuer: `JWT_ISSUER`
- audience: `JWT_AUDIENCE`

Expected claims:

```json
{
  "sub": "central-auth-user-id",
  "email": "user@company.com",
  "role": "admin",
  "firstName": "Ava",
  "lastName": "Shah",
  "tenantId": "entra-tenant-id",
  "appCode": "hr-portal"
}
```

## Why there are no repeated tables

The central auth DB uses these prefixed tables:

- `auth_users`
- `auth_organizations`
- `auth_access_roles`
- `auth_login_requests`
- `auth_refresh_tokens`

That keeps auth persistence separate from business databases like `main_db4`.

## Recommended app pattern

If an app needs a local `User` row for foreign keys, create or update that row in the sync endpoint. Keep role resolution local to the app if role meaning differs by product.