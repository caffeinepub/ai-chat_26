# AI Chat Website

## Current State
New project, no existing code.

## Requested Changes (Diff)

### Add
- A full-page AI chat UI with a modern, sleek design
- Chat message list showing user and assistant messages with avatars/labels
- Input bar at the bottom with send button and keyboard support
- Example prompt suggestions on the empty state
- Simulated bot responses (echo or pre-canned replies) since no real LLM backend exists
- App header with branding (logo/name)

### Modify
N/A

### Remove
N/A

## Implementation Plan
1. Backend: Minimal Motoko backend (store chat messages or just use frontend state)
2. Frontend: Full-page chat layout with sidebar (chat history), main chat area, and input bar
3. Simulated AI responses with a short typing delay for realism
4. Suggested prompts on empty state
5. Responsive design
