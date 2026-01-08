# GitHub Integration - Manual Test Guide

This guide explains how to manually test the GitHub integration features (issue status sync, comments) using a real GitHub repository and `ngrok`.

## Prerequisites

1.  **ngrok** installed ([Download](https://ngrok.com/download)) to expose your localhost to the internet.
2.  A **GitHub Account**.
3.  Admin access to a **Project** in AI Estimation Platform (running locally).

---

## Step 1: Expose Localhost

Start your Next.js app in one terminal:
```bash
npm run dev
```

In a *separate* terminal, start ngrok to tunnel port 3000:
```bash
ngrok http 3000
```
*Wait for the session to start. Copy the `Forwarding` URL (e.g., `https://a1b2-c3d4.ngrok-free.app`).*

---

## Step 2: Configure Environment

1.  Open your `.env` file.
2.  Add/Update the `GITHUB_WEBHOOK_SECRET`:
    ```env
    GITHUB_WEBHOOK_SECRET=my_secure_secret
    ```
3.  **Restart** your Next.js server (`npm run dev`) to apply the change.

---

## Step 3: Setup GitHub Webhook

1.  Go to your GitHub Repository -> **Settings** -> **Webhooks**.
2.  Click **Add webhook**.
3.  **Payload URL**: Paste your ngrok URL appended with `/api/webhooks/github`  
    *Example: `https://a1b2-c3d4.ngrok-free.app/api/webhooks/github`*
4.  **Content type**: Select `application/json`.
5.  **Secret**: Enter the exact secret from your `.env` (`my_secure_secret`).
6.  **Which events would you like to trigger this webhook?**
    *   Select **Let me select individual events**.
    *   Check **Issues**.
    *   Check **Issue comments**.
7.  Click **Add webhook**.

---

## Step 4: Link Project & Task

For the integration to work, the system needs to match the GitHub Repo ID and Issue Number.

1.  **Get Repo ID**:
    *   You can find this via GitHub API `https://api.github.com/repos/OWNER/REPO` -> look for `"id"`.
    *   *Or assume you created the project via the app which sets this automatically.*
2.  **Manually Link (if needed)**:
    *   If testing with an existing project, update your database to set `githubRepoId` on the Project and `githubIssueNumber` on a specific Task you want to test.
    *   *You can use a seed script or Prisma Studio (`npx prisma studio`) to edit these values.*

---

## Step 5: Execute Test Scenarios

### Scenario A: Comments Sync
1.  Go to a GitHub Issue linked to your task.
2.  Add a **comment**: "Testing from GitHub UI".
3.  Check your **Database** (or App UI):
    *   Look at the `TaskComment` table.
    *   You should see the new comment appears.

### Scenario B: Status Update
1.  **Close** the GitHub Issue.
2.  Check your **Database**:
    *   The linked Task's `status` should change to `DONE`.
3.  **Reopen** the Issue.
4.  Check your **Database**:
    *   The linked Task's `status` should change to `IN_PROGRESS` (or `TODO`).

---

## Troubleshooting

-   **401 Unauthorized**: Your `GITHUB_WEBHOOK_SECRET` in `.env` doesn't match the one in GitHub settings.
-   **Nothing happens**: Check the ngrok terminal. Do you see `POST /api/webhooks/github 200 OK`?
    *   If not, GitHub isn't sending events (check Webhook settings/deliveries).
    *   If yes, but DB doesn't update, check the `npm run dev` console logs. Is it saying "Project not found" or "Task not found"? Ensure IDs match.
