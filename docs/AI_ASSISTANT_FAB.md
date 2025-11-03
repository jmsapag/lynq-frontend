# AI Assistant FAB Component

## Overview

This component implements a **Floating Action Button (FAB)** with an **AI assistant chat widget** that allows users to ask questions about LYNQ platform features including installation, configuration, payments, metrics, and more.

**Important**: The chat is displayed as a **floating widget** (similar to Intercom, Drift, etc.) that does **NOT block** the rest of the interface, allowing users to continue interacting with the platform while chatting.

## Features

- **Floating Action Button**: A prominent, fixed-position button in the bottom-right corner
- **Non-blocking Chat Widget**: Floating chat window that doesn't block the interface
- **Toggle Behavior**: FAB changes icon (sparkles ↔ X) when chat is open/closed
- **Real-time Communication**: Connects to `/assistant` endpoint for AI-powered responses
- **Internationalization**: Fully translated in English and Spanish
- **Responsive Design**: Adapts to desktop, tablet, and mobile
- **Smooth Animations**: Fade and slide transitions when opening/closing
- **Visual Feedback**: Loading states, tooltips, and status indicators

## Components

### `AIAssistantFAB`

The main floating action button component that toggles the chat widget.

**Location**: `src/components/ai/AIAssistantFAB.tsx`

**Features**:

- Fixed position (bottom-right, z-index 50)
- Toggle state with icon change (SparklesIcon → XMarkIcon)
- Tooltip changes based on state
- Badge indicator when chat is open
- Smooth rotation animation on toggle

### `AIAssistantChat`

The floating chat widget component.

**Location**: `src/components/ai/AIAssistantChat.tsx`

**Features**:

- **Non-blocking**: Floats above content without blocking interaction
- **Position**:
  - Desktop: Bottom-right corner (400px width)
  - Mobile: Full width at bottom
- **Auto-scroll** to latest messages
- **Clear chat** functionality in header
- **Close button** (X) in header
- **Loading indicators**
- **Timestamp display** for messages
- **Differentiated styling** for user/assistant messages
- **Welcome message** on first open

## Hook: `useAIAssistant`

Custom hook that manages the assistant's state and communication.

**Location**: `src/hooks/ai/useAIAssistant.ts`

**Returns**:

- `messages`: Array of chat messages
- `isLoading`: Loading state indicator
- `error`: Error message if any
- `sendMessage(query: string)`: Function to send a query
- `clearMessages()`: Function to clear chat history

## Service: `aiAssistantService`

Handles API communication with the backend assistant endpoint.

**Location**: `src/services/aiAssistantService.ts`

**Endpoint**: `POST /assistant`

**Request**:

```typescript
{
  query: string;
}
```

**Response**:

```typescript
{
  response: string,
  timestamp: string
}
```

## Types

**Location**: `src/types/aiAssistant.ts`

```typescript
interface AIAssistantMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}
```

## Translations

All text is internationalized using i18next.

**Keys** (in `src/i18n/en.json` and `src/i18n/es.json`):

- `assistant.title`: Chat header title
- `assistant.subtitle`: Chat header subtitle
- `assistant.placeholder`: Input placeholder
- `assistant.send`: Send button label
- `assistant.clear`: Clear chat button tooltip
- `assistant.thinking`: Loading message
- `assistant.welcomeMessage`: Initial welcome message
- `assistant.errorMessage`: Error message template
- `assistant.closeModal`: Close button label
- `assistant.closeChat`: Close chat tooltip
- `assistant.fabLabel`: FAB tooltip (open state)
- `assistant.poweredBy`: Footer "Powered by" text

## Integration

The FAB is integrated in `App.tsx` within the `AppLayoutWithState` component, making it available on all authenticated views.

```tsx
<AIAssistantFAB />
```

**Important**: The chat widget floats above the content and does NOT block user interaction with the rest of the interface.

## Styling & Layout

The component uses:

- **Hero UI** components for consistent design
- **Tailwind CSS** for styling and responsive behavior
- **Hero Icons** for icons (SparklesIcon, XMarkIcon, PaperAirplaneIcon, TrashIcon)

### Layout Specifications

#### Desktop (≥768px)

- **FAB Position**: `bottom: 24px, right: 24px`
- **Chat Position**: `bottom: 96px, right: 24px` (when open)
- **Chat Width**: `400px`
- **Chat Max Height**: `calc(100vh - 200px)`

#### Mobile (<768px)

- **FAB Position**: Same as desktop
- **Chat Position**: `bottom: 80px, left: 0, right: 0` (full width)
- **Chat Width**: `100%`
- **Chat Border Radius**: Top corners rounded, bottom square

## Positioning & Z-Index

- **FAB**: `z-index: 50`
- **Chat Widget**: `z-index: 40`
- **Does NOT block**: Content remains interactive behind the chat
- **Smooth transitions**: 300ms ease-in-out animations

## Accessibility

- ARIA labels on interactive elements
- Keyboard navigation support (Enter to send)
- Screen reader friendly
- Clear focus states

## Testing Checklist

- [ ] FAB is visible on all authenticated pages
- [ ] FAB opens modal when clicked
- [ ] Can send messages and receive responses
- [ ] Messages display correctly (user vs assistant)
- [ ] Auto-scroll works when new messages arrive
- [ ] Clear chat functionality works
- [ ] Loading states display correctly
- [ ] Error handling works
- [ ] Translations work in both languages
- [ ] Modal closes properly
- [ ] FAB doesn't interfere with other UI elements
- [ ] Works on mobile and desktop screen sizes

## Future Enhancements

- [ ] Add message persistence (localStorage)
- [ ] Add typing indicator animation
- [ ] Add support for rich text/markdown in responses
- [ ] Add message reactions or feedback
- [ ] Add conversation history management
- [ ] Add suggested questions/prompts
- [ ] Add voice input support
