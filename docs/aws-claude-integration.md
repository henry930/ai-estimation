# AWS Claude Integration

## Model Specification
- **Model**: Claude Sonnet 4.5
- **Provider**: AWS Bedrock

## Integration Strategy
- **Backend**: Integration via AWS SDK for JavaScript (`@aws-sdk/client-bedrock-runtime`).
- **Streaming**: Implementation of Server-Sent Events (SSE) or WebSockets to provide real-time responses in the dashboard.
- **Authentication**: Usage of AWS IAM roles/credentials (access key/secret) stored securely in the environment.

## Context Management
- **Prompt Engineering**: System prompts specifically tailored for technical project management and code analysis.
- **Token Optimization**: Implementation of RAG (Retrieval-Augmented Generation) to feed relevant project files and logs into the Claude context window.

## UI/UX
- **Chat Panel**: Slide-over panel available in both the Global Management view and the Task Detail view.
- **Knowledge Indicators**: Visual feedback when the AI is "Learning" or "Updating" information based on new project data.
