# Authentication & Permission Flow

## GitHub-Only Login
The platform strictly uses GitHub for authentication.
- **Registration**: If a user does not have a GitHub account, the UI must provide a clear path/link to register on GitHub.
- **Login Flow**: Standard GitHub OAuth flow.

## Granular Repository Permissions
To ensure security and user control, we do not request access to all repositories upfront.
- **Project-Centric Access**: A "Project" in the platform is not just a repository in a list. It is a managed entity linked to a repository.
- **On-Demand Permissions**:
    1. User initiates "Create Project".
    2. User specifies the repository.
    3. The platform triggers a GitHub OAuth request/redirect specifically asking for permissions (Read/Write/Issues) for *that specific repository* if not already granted.
    4. Access tokens/permissions are stored per project/repository link.

## Implementation Notes
- Use GitHub Apps or fine-grained OAuth scopes where possible to limit exposure.
- Session management must handle multiple token states if different repositories have different permission levels.
