# Identity Module Architecture

The Identity module uses feature-based handlers for application use cases while keeping the GraphQL presentation layer grouped by resolver.

Feature handlers live under `src/modules/identity/features/<feature>/<feature>.handler.ts`. Each handler owns one primary use case, such as signup, login, password reset, profile update, or session revocation.

Shared application behavior lives under `src/modules/identity/application/services`:

- `PasswordHasherService` wraps password hashing and comparison.
- `AuthTokenIssuerService` centralizes session creation, refresh token hashing, access token issuance, and refresh token rotation.
- `DomainEventDispatcherService` dispatches domain events pulled from aggregates.

`AuthResolver` and `UserResolver` remain the GraphQL entry points and call handlers directly. `AuthService` and `UserService` are thin compatibility facades for existing module consumers.

The domain layer remains framework-independent. Handlers depend on repository contracts, DTOs, small application services, and the existing token infrastructure where needed.
