# Mockup Design Plan

## Overview
All pages and major UI components must be drafted and approved before final coding begins. Mockups can be static images or early HTML/CSS prototypes used for navigation testing.

## Required Mockup Screens

### 1. Public Pages & Auth
- **Landing Page**: Branding, value proposition, and access points.
- **Login/Register Popup**: Modal interface for GitHub OAuth and account creation.

### 2. User & Account
- **User Profile**: Management of user details, GitHub connection status, and preferences.
- **Credit / Subscription Page**: Interface to view balance, purchase credits via Stripe, and manage plans.

### 3. Layout Framework
- **Left Sidebar**: Global navigation containing:
    - Overview
    - My Projects
    - Settings
    - User Info (Name, Avatar)
    - Sign Out
    - State: Collapsible (Show/Hide).
- **Right Sidebar**: Dedicated AI interaction zone:
    - AI Prompt / Chat history
    - State: Hidden by default.

### 4. Content Components
- **My Projects View**: The primary dashboard showing all user projects.
- **Project Management / Task Page**: The workspace for a specific project/task including:
    - Tabbed navigation (Description, Issues, Documents, To-Do list).
    - Nested task hierarchy (recursive table).

## Delivery Format
Each requirement above will be prototyped as:
- **Pictures**: High-fidelity design mockups.
- **HTML/CSS Pages**: Simple functional prototypes for layout verification.
