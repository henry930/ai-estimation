# Gemini Tool Calling Debug Report

**Date**: 2026-01-08  
**Issue**: AI SDK 6.0.20 fails to properly convert tool schemas for Gemini and Anthropic providers  
**Status**: ✅ RESOLVED with workaround

## Problem Summary

The application was experiencing `AI_APICallError` when attempting to use tool calling with Google Gemini models through the AI SDK:

```
Error: Unable to submit request because `test_tool` functionDeclaration parameters 
schema should be of type OBJECT.
```

## Root Cause Analysis

### Testing Results

1. **AI SDK + Gemini 2.0 Flash**: ❌ FAILED
   - Error: "functionDeclaration parameters schema should be of type OBJECT"
   - Issue: AI SDK's schema conversion is broken

2. **Official Google SDK + Gemini 2.0 Flash**: ✅ SUCCESS
   - Tool calling works perfectly with identical schema structure
   - Confirms the issue is in AI SDK, not Gemini

3. **AI SDK + Anthropic Claude**: ❌ FAILED
   - Error: "tools.0.custom.input_schema.type: Field required"
   - Same schema conversion issue affects multiple providers

4. **Direct Gemini Integration**: ✅ SUCCESS
   - Bypassing AI SDK and using Google's official SDK directly works

### Technical Details

The AI SDK (version 6.0.20) has a bug in its schema conversion layer when translating Zod schemas to provider-specific formats. The `tool()` helper from `@ai-sdk/provider-utils` is not properly setting the `type: "OBJECT"` field in the generated schema.

## Solution Implemented

Created a direct Gemini integration module (`src/lib/gemini-direct.ts`) that:
- Uses the official `@google/generative-ai` SDK directly
- Bypasses the broken AI SDK schema conversion
- Provides a clean interface for tool calling

### Files Created

1. **`src/lib/gemini-direct.ts`**: Direct Gemini integration module
2. **`scripts/test-gemini-direct.ts`**: Test script confirming the fix works
3. **`scripts/repro-gemini.ts`**: Reproduction script for the AI SDK bug
4. **`scripts/test-google-sdk.ts`**: Test using official Google SDK

## Test Results

```bash
$ npx tsx scripts/test-gemini-direct.ts
--- TESTING DIRECT GEMINI INTEGRATION ---
Response Text: 
Tool Calls: [
  {
    "name": "create_phase",
    "args": {
      "title": "Testing Phase",
      "order": 1,
      "objective": "Test the system"
    }
  }
]
✅ SUCCESS: Tool calling works!
```

## Next Steps

### Option 1: Use Direct Integration (Recommended for now)
- Migrate chat endpoints to use `callGeminiWithTools()` from `gemini-direct.ts`
- Provides immediate stability
- Full control over tool execution

### Option 2: Wait for AI SDK Fix
- Monitor AI SDK releases for schema conversion fix
- Current version: 6.0.20
- Issue affects both Gemini and Anthropic providers

### Option 3: Hybrid Approach
- Use direct integration for Gemini
- Fall back to Anthropic/Bedrock for other use cases
- Maintain flexibility

## Recommendations

1. **Immediate**: Use the direct Gemini integration for production stability
2. **Short-term**: File an issue with Vercel AI SDK team about schema conversion
3. **Long-term**: Migrate back to AI SDK once the bug is fixed (for unified interface)

## Dependencies Added

- `@google/generative-ai`: Official Google Generative AI SDK (already installed)

## Configuration

No changes to environment variables needed. The direct integration uses the same `GOOGLE_GENERATIVE_AI_API_KEY`.
