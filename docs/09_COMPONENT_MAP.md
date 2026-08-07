# 09 — Component Map

> Dependency graph of pages, components, hooks, providers, utilities, and services.

This is a source-level map of `apps/web` + the `@supercampus/*` packages it consumes.

---

## 1. Top-Level Graph

```mermaid
graph TD
    MAIN[main.tsx] --> APP[App.tsx]
    APP --> AP[AppProviders]
    APP --> AR[ApplicationRouter]
    AR --> RTR[RouterProvider -> createBrowserRouter]
    RTR --> GUARDS[guards.tsx]
    GUARDS --> LAYOUT[AppLayout]
    GUARDS --> PAGES[pages]
    RTR --> FEED[Feed feature]
```

---

## 2. Provider Graph (apps/web + supabase package)

```mermaid
graph TD
    AP[AppProviders] --> QC[QueryClientProvider]
    QC --> SUPP[SupabaseProvider]
    SUPP --> AU[AuthProvider]
    AU --> PP[ProfileProvider]
    PP --> AZ[AuthorizationProvider]
    AZ --> RRP[RoleRequestsProvider]
    RRP --> APP2[ApplicationProvider]
    APP2 --> NP[NavigationProvider]
    NP --> DP[DashboardProvider]
    DP --> PLAT[PlatformProvider]
    PLAT --> THEME[ThemeProvider]
    THEME --> CH[Children]

    AP --> PLATBUILD[build platform: env, supabase, apiClient, eventBus]
    SUPP --> CREATE[createBrowserSupabaseClient]
```

---

## 3. Package Dependency (source graph)

```mermaid
graph TD
    subgraph pkgs
        C[contracts]
        CORE[core]
        SH[shared]
        AC[api-client]
        SB[supabase]
    end
    CORE --> C
    SH --> CORE
    AC --> C
    AC --> CORE
    SB --> C
    WEB[apps/web] --> SB
    WEB --> SH
    WEB --> CORE
    WEB --> AC
    WEB --> C
```

---

## 4. Feed Feature Dependency Graph

```mermaid
graph TD
    ROUTES[appRouter] --> FP[FeedPage]
    FP --> FPROV[FeedProvider]
    FP --> CPC[CreatePostCard]
    FP --> FL[FeedList]
    FPROV --> FCTX[FeedContext]
    FPROV --> FSVC[createFeedService]
    FSVC --> CLIENT[Supabase client]
    FL --> FC[FeedCard]
    FL --> EF[EmptyFeed]
    FL --> ERR[ErrorState]
    FL --> SK[LoadingSkeleton]
    FC --> CT[CommentThread]
    CT --> CC2[CommentComposer]
    FC --> PCR[PostComposer via CreatePostCard]
    FC --> TIME[time.ts formatRelativeTimestamp]
    CT --> TIME
```

Exports/hooks: `FeedContext` exports `useFeed`; `FeedCard` is `memo`ized.

---

## 5. Pages → Hooks/Services Map

| Page | Hooks / services used |
|------|-----------------------|
| `LoginPage` / `SignUpPage` / `ResetPasswordPage` | `useAuth` (signIn/signUp/resetPassword) |
| `OnboardingPage` | `useUserApplicationState`, `useSupabase`, `useProfile`, `useRoleRequests`, `useAuth` |
| `PendingApprovalPage` | `useUserApplicationState`, `useAuthorization`, `useProfile`, `useRoleRequests` |
| `AdminRequestsPage` | `useUserApplicationState`, `useRoleRequests` |
| `AdminRequestDetailPage` | `useUserApplicationState`, `useRoleRequests`, `useAuthorization` |
| `NotFoundPage` | `Link`/`ROUTES` |
| `PlaceholderPage` | `EmptyState` |
| `ApplicationState` | `useApplication` |
| `FeedPage` | `useFeed` (via children) |
| `DashboardPage` | `useProfile`, `useRoles`, `useDashboard` |

---

## 6. Providers & Their Services

```mermaid
graph TD
    AU[AuthProvider] --> a[createAuthService]
    PP[ProfileProvider] --> p[createProfileService]
    AZ[AuthorizationProvider] --> z[createAuthorizationService]
    RRP[RoleRequestsProvider] --> r[createRoleRequestService]
    FPROV[FeedProvider] --> f[createFeedService]
    THEME[ThemeProvider] --> core[THEME_STORAGE_KEY from core]
    NPROV[NavigationProvider] --> build[builder: buildNavigation]
    DP[DashboardProvider] --> dbuild[buildDashboard]
```

---

## 7. Utilities & Shared Modules

| Module | Used by |
|--------|---------|
| `@supercampus/shared`: `Button`, `Input`, `Card`, `Spinner`, `EmptyState`, `cn`, `ThemeProvider`/`useTheme` | All pages/components |
| `@supercampus/core`: `ROUTES`, `BOTTOM_NAV_ITEMS`, `createPlatformEventBus`, `loadClientEnv`, `getAccessToken`, `THEME_STORAGE_KEY`, `AppError`, `RouteMetadata` | routes, providers, theme, api-client |
| `@supercampus/contracts`: `ErrorCode`, `ApiEnvelope`, `PlatformEventMap`, permissions | core, api-client |
| `feed/time.ts` | FeedCard, CommentThread |

---

## 8. Service → Table Map

| Service | Tables |
|---------|--------|
| `createAuthService` | (Supabase `auth.*`) |
| `createProfileService` | `profiles` |
| `createAuthorizationService` | `user_roles`, `role_permissions`, `role_features`, `feature_registry` |
| `createFeedService` | `posts`, `post_media`, `post_likes`, `post_comments`, `profiles` |
| `createRoleRequestService` | `role_requests`, `user_roles`, `roles`, `campuses` |
| `createStorage` | Storage buckets (private) |
| `createRealtime` | Realtime channels |
