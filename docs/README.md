# 📚 API Documentation

Complete API documentation for the AI Estimation Platform.

## 📖 Documentation Files

### 1. [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
**Comprehensive API Reference**
- All 38 endpoints documented
- Request/response examples
- Authentication details
- Error codes
- Organized by category

### 2. [API_QUICK_REFERENCE.md](./API_QUICK_REFERENCE.md)
**Quick Reference Guide**
- Most common endpoints
- cURL examples
- Quick start guide
- Command examples

### 3. [openapi.yaml](./openapi.yaml)
**OpenAPI 3.0 Specification**
- Machine-readable API spec
- Import into Postman, Swagger UI, Insomnia
- Auto-generate client SDKs
- API testing tools

## 🚀 Quick Start

### 1. Authentication
```bash
# Login via browser
open http://localhost:3000/api/auth/signin

# Or use GitHub OAuth
open http://localhost:3000/api/auth/signin/github
```

### 2. Create a Project
```bash
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"name": "My Project"}'
```

### 3. Chat with AI
```bash
curl -X POST http://localhost:3000/api/projects/PROJECT_ID/chat \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "messages": [
      {"role": "user", "content": "Create a new phase called Testing"}
    ]
  }'
```

## 📊 API Statistics

- **Total Endpoints**: 38
- **Authentication**: Session-based (NextAuth.js)
- **Response Format**: JSON (except streaming endpoints)
- **AI Models**: Google Gemini 2.0 Flash Exp

## 🔑 Key Features

### AI-Powered Chat
- **Project Agent**: Manages entire project lifecycle
- **Task Assistant**: Helps with individual tasks
- **Tool Calling**: Automatic database updates
- **Streaming Responses**: Real-time text generation

### GitHub Integration
- Repository management
- Issue tracking
- Branch management
- File access
- OAuth authentication

### Project Management
- Hierarchical task structure (Phases → Tasks → Subtasks)
- Hour estimation
- Status tracking
- Document linking
- S3 storage for artifacts

## 🛠️ Tools & Integrations

### Development Tools
- **Postman**: Import `openapi.yaml`
- **Swagger UI**: View interactive docs
- **Insomnia**: REST client testing
- **cURL**: Command-line testing

### SDKs
Generate client SDKs from `openapi.yaml`:
```bash
# JavaScript/TypeScript
npx @openapitools/openapi-generator-cli generate \
  -i docs/openapi.yaml \
  -g typescript-fetch \
  -o sdk/typescript

# Python
openapi-generator-cli generate \
  -i docs/openapi.yaml \
  -g python \
  -o sdk/python
```

## 📝 API Categories

1. **Authentication** (1 endpoint)
   - NextAuth.js handlers

2. **Projects** (8 endpoints)
   - CRUD operations
   - Task management
   - GitHub sync

3. **Tasks** (6 endpoints)
   - Task details
   - Subtask creation
   - Status updates

4. **AI Chat** (3 endpoints)
   - Project-level chat
   - Task-level chat
   - General chat

5. **GitHub** (9 endpoints)
   - Repository management
   - Issue tracking
   - File access

6. **Estimates** (2 endpoints)
   - Create estimations
   - View estimates

7. **Subscriptions** (4 endpoints)
   - Stripe integration
   - Plan management

8. **Health** (4 endpoints)
   - System health
   - Database status
   - Diagnostics

## 🔒 Security

- **Authentication**: Required for most endpoints
- **Session Management**: NextAuth.js cookies
- **OAuth**: GitHub integration
- **API Keys**: Stripe webhooks
- **CORS**: Configured for production

## 📈 Response Formats

### Standard JSON Response
```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2026-01-08T10:00:00.000Z"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "timestamp": "2026-01-08T10:00:00.000Z"
}
```

### Streaming Response
```
Content-Type: text/plain; charset=utf-8

Word by word streaming...
```

## 🧪 Testing

### Using Postman
1. Import `openapi.yaml`
2. Set up environment variables
3. Configure session cookies
4. Run requests

### Using cURL
```bash
# Save session cookie
curl -c cookies.txt http://localhost:3000/api/auth/session

# Use cookie in requests
curl -b cookies.txt http://localhost:3000/api/projects
```

## 📞 Support

For issues or questions:
- Check the full documentation in `API_DOCUMENTATION.md`
- Review examples in `API_QUICK_REFERENCE.md`
- Test with `openapi.yaml` in Postman/Swagger

## 🔄 Updates

**Last Updated**: 2026-01-08  
**Version**: 1.0.0  
**Changes**:
- Initial comprehensive documentation
- All 38 endpoints documented
- OpenAPI specification added
- Quick reference guide created

---

**Note**: This documentation was automatically generated and manually enhanced to ensure accuracy and completeness.
