# Subscription & Credit System

**Phase**: Phase 2 - Authentication & Subscription  
**Status**: IN PROGRESS  
**Estimated Hours**: 24  
**Parent Branch**: `feature/phase-2-auth`  
**Main Branch**: `feature/stripe-integration`

## Description

Users maintain a subscription status and a credit balance. Features an interface to connect payment methods and purchase/add credits. Credit deduction is triggered when a task is assigned to Higgs Boson (Platform AI) and activated.

## Sub-Tasks

| Task | Status | Hours | Branch | Assignee | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Stripe Account Setup | PENDING | 2 | `feature/stripe-setup` | - | Create Stripe account and API keys |
| Payment Method Integration | PENDING | 6 | `feature/payment-methods` | - | Add/remove cards, payment UI |
| Credit Purchase Flow | PENDING | 5 | `feature/credit-purchase` | - | Checkout session and confirmation |
| Credit Balance Tracking | PENDING | 3 | `feature/credit-tracking` | - | Database schema and API endpoints |
| Higgs Boson Assignment Logic | PENDING | 5 | `feature/higgs-boson-logic` | - | Credit check and deduction on task activation |
| Subscription Management UI | PENDING | 3 | `feature/subscription-ui` | - | View/cancel subscriptions |

## Issues

- [ ] Payment method integration (Stripe) for ad-hoc credit purchase
- [ ] Higgs Boson assignment credit check and deduction logic
- [ ] Handle failed payments and retry logic
- [ ] Implement credit usage history and reporting

## Documents

- [Credit & Higgs Boson System](https://github.com/henry930/ai-estimation/blob/main/docs/credit-system.md)

## AI Enquiry Prompts

- "What's the best way to implement a credit system with Stripe in Next.js?"
- "How should I handle credit deduction atomicity to prevent race conditions?"

## Progress

**Overall**: 0% (0/6 sub-tasks completed)

```
[----------] 0%
```
