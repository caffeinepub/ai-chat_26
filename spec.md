# AI Prompt Builder

## Current State
The app is a chat UI (AskAI) with canned responses. It has a sidebar for session history, a message area, and a text input. It does not actually answer questions with AI.

## Requested Changes (Diff)

### Add
- A Prompt Builder tool that replaces the chat UI as the main interface
- Category selector (e.g. Writing, Coding, Image Generation, Research, Marketing, Creative)
- Sub-options per category (tone, style, detail level, audience, format, etc.)
- A live prompt preview that assembles a full prompt string from selections
- Copy to Clipboard button
- "Open in ChatGPT" button that opens chatgpt.com with the prompt pre-filled
- "Open in Gemini" button linking to gemini.google.com
- Prompt history saved per session (list of prompts built)

### Modify
- App name changed to "PromptCraft"
- Replace the chat session/message system with prompt builder state
- Keep the sidebar but use it to show prompt history instead of chat sessions

### Remove
- Canned AI responses logic
- Typing indicator
- Chat bubble message UI

## Implementation Plan
1. Rewrite App.tsx with prompt builder UI
2. Categories: Writing, Coding, Image Generation, Research, Marketing, Creative
3. Each category has relevant fields (dropdowns/toggles) that contribute to the prompt
4. Assembled prompt shown in a large preview text area
5. Copy and Open in ChatGPT/Gemini actions
6. Use backend to save prompt history per session
