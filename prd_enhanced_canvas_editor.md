# PRD: Enhanced Canvas Editor - Business Plan Studio

## 1. Visão Geral
**Objetivo:** Enhance the Business Model Canvas with a suite of real-time collaboration features, enabling multiple users to co-create and edit simultaneously. This will transform the canvas from a static tool into a dynamic, interactive workspace, fostering seamless teamwork and immediate feedback.

**Usuários:**
- **Project Managers:** Oversee canvas progress and team participation.
- **Business Analysts:** Draft and refine canvas content.
- **Team Members:** Contribute ideas and collaborate on sections.

**Prioridade:** Alta - This is a foundational feature for a collaborative platform.

**Epic:** Canvas

---

## 2. Contexto Técnico

### 2.1 Arquivos Impactados
- **`src/components/CanvasEditor.tsx`**: Will be heavily refactored to integrate real-time data and user interactions.
- **`src/hooks/useRealtimeCanvas.ts`**: (New) A dedicated hook to manage WebSocket connections, event handling, and state synchronization for the canvas.
- **`supabase/functions/broadcast-canvas-update/index.ts`**: (New) An Edge Function to securely process and broadcast updates to prevent clients from sending malicious data.
- **`src/integrations/supabase/types.ts`**: Will be updated with new types for real-time events (e.g., `CanvasItemUpdate`, `UserPresence`, `CursorPosition`).

### 2.2 Dependências Técnicas
- **Tabelas Supabase:** `canvas_items`, `canvas_sections`, `user_profiles`, `business_plans`.
- **Real-time Channels:** A new channel will be established: `canvas-collaboration:{business_plan_id}`.
- **Hooks Existentes:** `useAuth` for user and business plan context.
- **Componentes Base:** Utilizes existing Shadcn/ui components like `Card`, `Textarea`, `Button`, `Badge`, `Avatar`.

---

## 3. Especificação Funcional

### 3.1 User Stories
- **As a Project Manager,** I want to see the avatars of all team members currently viewing the canvas so that I know who is present and engaged.
- **As a Business Analyst,** I want to see my colleagues' cursors moving across the canvas in real-time so that I can easily follow their focus and avoid overlapping work.
- **As a Team Member,** I want to see new items and content edits from others appear on my screen instantly without needing to refresh the page, so our brainstorming sessions are fluid and efficient.
- **As a Business Analyst,** I want a canvas item to be visually locked and disabled when another user is editing it, so we can prevent conflicting edits and data loss.

### 3.2 Fluxos Detalhados
- **Fluxo Principal (Happy Path):**
  1. User A joins the canvas. Their avatar appears in a "presence bar."
  2. User B joins; their avatar also appears. Both users see each other's cursors moving.
  3. User A clicks to edit a canvas item. The item's border highlights with User A's assigned color, and it becomes read-only for User B.
  4. User A types into the textarea. The changes are broadcasted and visible to User B in real-time.
  5. User A clicks "Save" or clicks away. The lock is released, and the final content is persisted.
- **Fluxos de Edge Case:**
  - **Offline/Connection Loss:** If a user with a lock loses their connection for more than 30 seconds, the lock is automatically released by the system to prevent items from being permanently stuck.
  - **Simultaneous Edit Attempt:** If User B attempts to click an item locked by User A, they see a tooltip indicating who is editing (`"User A is currently editing this item."`).
- **Real-time Behavior:** All interactions—presence changes (join/leave), cursor movements, item locking/unlocking, and content updates—are broadcast via the Supabase channel.

---

## 4. Especificação Técnica

### 4.1 Interface TypeScript
```typescript
// In src/integrations/supabase/types.ts
export type UserPresence = {
  user_id: string;
  name: string;
  avatar_url: string;
  cursor_position: { x: number; y: number };
};

export type CanvasEvent = {
  type: 'ITEM_UPDATE' | 'ITEM_LOCK' | 'ITEM_UNLOCK' | 'CURSOR_MOVE';
  payload: any;
};

// In src/hooks/useRealtimeCanvas.ts
export interface UseRealtimeCanvasReturn {
  items: CanvasItem[];
  presentUsers: UserPresence[];
  updateItem: (itemId: string, content: string) => void;
  acquireLock: (itemId: string) => void;
  releaseLock: (itemId: string) => void;
  realTimeStatus: 'connected' | 'connecting' | 'disconnected';
}
```

### 4.2 Supabase Schema
```sql
-- Additions to canvas_items table
ALTER TABLE public.canvas_items
ADD COLUMN locked_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN locked_at TIMESTAMPTZ;

-- RLS policy for locking
CREATE POLICY "Allow users to lock items in their own plans"
ON public.canvas_items
FOR UPDATE USING (
  (SELECT is_member_of_plan(auth.uid(), business_plan_id) FROM canvas_sections WHERE id = section_id)
) WITH CHECK (
  -- A user can only lock an item for themselves
  locked_by = auth.uid()
);
```

### 4.3 Real-time Implementation
```typescript
// In src/hooks/useRealtimeCanvas.ts
// 1. Connect to Supabase channel: `canvas-collaboration:${businessPlanId}`
// 2. Use channel.track() to send presence info (name, avatar).
// 3. Subscribe to 'presence' events to update the list of presentUsers.
// 4. Subscribe to 'broadcast' events for custom messages (ITEM_UPDATE, ITEM_LOCK, etc.).
// 5. Handle incoming events in a reducer to update the local state immutably.
// 6. Broadcast local user's cursor movements on a throttled interval (e.g., every 100ms).
```

---

## 5. Colaboração e Votação

### 5.1 Multi-user Behavior
- **Conflict Prevention:** An optimistic locking system will be used. The first user to send an `ITEM_LOCK` event for a specific item successfully claims the lock. The database `locked_by` column serves as the single source of truth.
- **Conflict Resolution:** In the rare case of a race condition, the database's row-level security and constraints will reject the second lock attempt, and the client that failed will receive an error and refresh its state.

### 5.2 Voting Integration
- When an item's status changes to `voting` or `approved`, this will be broadcast as an `ITEM_UPDATE` event, ensuring all collaborators see the status change in real-time without needing to be on the voting page.

---

## 6. Critérios de Aceitação
- [x] Avatars of all active users are displayed on the canvas page.
- [x] User cursors are visible and move in real-time.
- [x] Edits to canvas items are reflected on all collaborators' screens within 200ms.
- [x] An item being edited is visually locked and cannot be edited by others.
- [x] The lock is automatically released if the editing user disconnects.
- [x] The feature is responsive and functional on mobile devices.
- [x] All real-time communication is secure and validated by RLS policies.

---

## 7. Testes

### 7.1 Unit Tests
- Test the `useRealtimeCanvas` hook's state logic with mock Supabase events.
- Test utility functions for formatting event payloads.

### 7.2 Integration Tests
- Test the connection to the Supabase channel and the track/untrack lifecycle.
- Validate that RLS policies correctly grant or deny lock acquisitions.

### 7.3 E2E Tests (e.g., using Playwright or Cypress)
- Simulate two users joining a canvas, editing different items, and seeing each other's changes.
- Test the locking flow: User A locks an item, User B verifies it's read-only, User A unlocks, User B can now edit.
- Test the disconnect flow: User A locks an item and disconnects; verify the lock is released after the timeout.

---

## 8. Implementação Progressiva
- **Fase 1 (Core Real-time):** Implement real-time updates for item creation, content changes, and deletion. Establish the `useRealtimeCanvas` hook and the basic channel communication.
- **Fase 2 (Presence & Cursors):** Add presence indicators (avatar list) and live cursor tracking.
- **Fase 3 (Locking & Final Polish):** Implement the optimistic locking mechanism, visual feedback for locked items, and handle edge cases like user disconnects.