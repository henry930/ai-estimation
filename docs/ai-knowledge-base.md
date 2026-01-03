# AI Project Knowledge Base

## Overview
Each project in the platform is associated with a dedicated AI context/model instance that evolves over time.

## Learning Sources
The AI continuously updates its understanding of the project from the following inputs:

### 1. User Interactions
- All **Enquiries** made through the AI chat panel.
- All refinement requests and AI prompt history.

### 2. Project Files & Codebase
- **Full Source Code**: Constant ingestion of the repository file tree.
- **Documentation**: All `.md` files, READMEs, and technical specs.
- **Configuration**: Credentials (managed securely), environment variables, and build configurations.

### 3. Runtime Logs & Monitoring
- **Error Tracking**: Ingestion of application error logs and issues.
- **Issue Analysis**: Mapping GitHub issues to specific code segments and logs.

## Autonomous Updates
The AI is not just a passive responder. When its knowledge base is updated, it has the authority to:
- **Update Descriptions**: Refine project/task requirements based on new code or user input.
- **Generate Issues**: Create new GitHub or internal issues based on detected log errors.
- **Refine Task Lists**: Adjust time estimates or add/reorder sub-tasks as technical complexity becomes clearer.
- **Manage Documents**: Link new relevant files or update existing documentation.

## Technical Requirements
- **Vector Store**: A project-specific vector database (e.g., Pinecone or pgvector) to store and retrieve contextual chunks.
- **Context Ingestion Pipeline**: Automated triggers on Git push or log entry to update the embeddings.
