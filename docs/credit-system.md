# Higgs Boson & Credit System

## Higgs Boson (AI Architect)
Higgs Boson is the platform's automated implementing agent. Users can assign tasks directly to this AI "user" to perform tasks such as:
- Code generation
- Requirement refinement
- Automated branch management

## Assignee Logic
- **Assignee Field**: A multi-type field supporting `GitHubUser` (external) or `HiggsBoson` (internal AI).
- **Selection UI**: A dropdown in the task management view.

## Credit Addition & Management
- **Payment Method**: Users must connect a valid payment method (e.g., via Stripe) to their account profile.
- **Adding Credits**: A dedicated UI allows users to purchase credit packs or set up auto-recharge.
- **Balance Tracking**: Credits are tracked at the user account level and displayed in the global sidebar and usage dashboard.

## Credit Deduction
Assigning Higgs Boson is a premium feature. 
- **Trigger**: Deduction occurs when a task assigned to Higgs Boson is set to `IN PROGRESS`.
- **Cost**: Defined per task hour or per task complexity.
- **Enforcement**: If user credits are insufficient, Higgs Boson cannot be assigned/activated.
