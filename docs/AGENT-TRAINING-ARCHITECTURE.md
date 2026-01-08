# AI Strategic Agent - Training & Architecture Guide

This document outlines how the AI Agent in this platform is "trained" to handle holistic project management, requirement analysis, and multi-layer updates (RDS & S3).

## 1. The "Training" Methodology: In-Context Instruction
Unlike traditional machine learning which requires updating model weights (fine-tuning), this agent is trained using **Advanced In-Context Instruction**. This makes the agent highly flexible, steerable, and cost-effective.

### A. System Persona (The Identity)
The agent is "trained" via its `systemPrompt` (found in `src/app/api/projects/[id]/chat/route.ts`). This prompt defines:
- **Role**: "Strategic Lead and Chief Architect".
- **Rules**: "Always look holistically", "Use technical PM terminology", "Proactively manage artifacts".
- **Mission**: Transform vague instructions into structured RDS tasks and S3 documents.

### B. Capability Schema (The Tools)
The agent is "trained" on what it *can* do through Zod schemas. Each tool defines:
- **Parameters**: Exact data needed (e.g., `phases` array for `restructurePlan`).
- **Description**: Technical instructions for the AI on *when* and *why* to use the tool.

### C. Context Memory (The Dataset)
Every time the agent is invoked, we "train" it on the current project state by fetching:
1. All Project Phases (level 0).
2. All Tasks (level 1).
3. All Sub-tasks (level 2).
4. All connected Documents.
This creates a "Latest Snapshot" that provides the AI with the complete mental model of the project.

---

## 2. Advanced Training: How to Evolve the Agent

### Step 1: Modifying the "Master Prompt"
To change the agent's behavior globally, update the `systemPrompt` in `src/app/api/projects/[id]/chat/route.ts`. 

**Example**: To make the agent prioritize security:
> "You must perform a security audit on every new task structure and document any potential vulnerabilities in a dedicated 'Security Risk' report on S3."

### Step 2: Adding New Domain Knowledge (Few-Shot Prompting)
You can "train" the agent with specific examples of "User Input -> Perfect Action". Add these to the `messages` array passed to the AI as "system-level" examples.

### Step 3: Domain-Specific Tools
If you want the AI to handle "Infrastructure as Code" (IaC), you would:
1. Define a tool `generateTerraformScript`.
2. Provide the AWS/S3 logic in the `execute` function.
3. The AI will "learn" to use this tool when the user mentions "Deployment" or "Cloud Setup".

---

## 3. The Multi-Layer Execution Flow (How it works)

When you say: *"Restructure for SaaS and create a report."*

1. **Analysis**: The AI compares your request against the "Latest Snapshot" in its context.
2. **Strategy**: It identifies that `restructurePlan` is needed for RDS and `generateReport` for S3.
3. **RDS Update**: It calls `restructurePlan` with a new array of phases, tasks, and hours.
4. **S3 Persist**: It calls `generateReport` with deep technical content.
5. **Linking**: It calls `updateTask` to link the new S3 URL back to the RDS database records.

---

## 4. Future "Training" Features
- **User-Defined Rules**: A UI section where you can type "Always use Next.js for web tasks" – this gets injected into the system prompt.
- **RAG (Long-term Memory)**: Ingesting your corporate coding standards or past project successes into a vector database for the agent to reference.

---

**Source of Truth**: The logic of this "Strategic Lead" primarily lives in:
- `src/app/api/projects/[id]/chat/route.ts` (Strategic Core)
- `src/app/api/admin/tasks/refine/route.ts` (Task-level refinement)
- `src/lib/ai-provider.ts` (Provider & Model Selection)
