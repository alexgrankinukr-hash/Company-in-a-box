# Research: Web UI for AI Company-in-a-Box

## Executive Summary

**Recommended Stack (TL;DR):**
- **Framework:** Next.js 15 (App Router) with TypeScript
- **UI Library:** shadcn/ui + Radix UI + Tailwind CSS
- **Real-time:** WebSockets (Socket.IO) for chat, Server-Sent Events for dashboard updates
- **Charts/KPIs:** Tremor (built on Recharts + Radix) for dashboard, Recharts for custom charts
- **Org Chart:** React Flow (xyflow) for interactive hierarchy visualization
- **Chat UI:** Custom-built on chatscope/chat-ui-kit-react or hand-rolled with shadcn primitives
- **Backend:** Node.js (Express or Fastify) with TypeScript, or Python FastAPI if tight AI integration needed
- **Database:** PostgreSQL + Redis (for pub/sub and caching)
- **Starting Point:** TailAdmin Next.js template (open-source, 500+ components)

**Estimated MVP Timeline (single developer):** 6-8 weeks for a usable chat + basic dashboard

---

## 1. Frontend Framework Comparison

### Next.js 15 (RECOMMENDED)

**Why Next.js wins for this project:**
- **Largest ecosystem:** 119k+ GitHub stars, 3,175+ active contributors, massive library compatibility
- **Server Components & Server Actions:** Reduce client-side JS bundle, simplify data mutations for settings/config forms
- **API Routes:** Built-in backend endpoints for WebSocket upgrade, SSE streams, REST APIs
- **App Router:** File-based routing with layouts, loading states, error boundaries out of the box
- **Incremental Static Regeneration:** Dashboard pages that need periodic refresh without full SSR
- **Vercel deployment:** One-click deploy for MVP; can self-host later with Docker
- **Hiring pool:** Any React developer can contribute; largest talent pool of any framework

**Weaknesses:**
- Heavier bundle sizes vs. SvelteKit (75 vs. 90 Lighthouse score out of the box)
- Vercel-optimized patterns sometimes awkward for self-hosting
- App Router has a learning curve (React Server Components mental model)

### SvelteKit

**Pros:** 50% smaller bundles, excellent DX, 90/100 Lighthouse out of the box, simpler mental model
**Cons:** Much smaller ecosystem, fewer libraries, smaller hiring pool, Svelte 5 is relatively new. For a startup needing to move fast and hire, the ecosystem gap is the killer. Not recommended for a project that needs a large library ecosystem (chat components, chart libraries, org chart widgets).

### Remix (now React Router v7)

**Pros:** Web-standards-first, excellent for form-heavy UIs (settings/config), great progressive enhancement
**Cons:** Smaller ecosystem than Next.js, merging with React Router created confusion, less community momentum. Could be a strong choice for the settings/config pages but not worth the trade-off for the overall project.

### Astro

**Pros:** Content-focused, island architecture, excellent for marketing/docs
**Cons:** Not designed for real-time interactive applications. Wrong tool for a chat + dashboard app.

**Verdict: Next.js 15 with App Router.** The ecosystem, community, and library compatibility are decisive for a single developer needing to ship fast.

---

## 2. UI Component Libraries

### shadcn/ui (RECOMMENDED)

**Why shadcn/ui wins:**
- **Copy-paste model:** You own every line of code, full customization without fighting a library's API
- **Built on Radix UI:** Accessible primitives (ARIA, keyboard navigation) for free
- **Tailwind CSS native:** No CSS-in-JS runtime overhead, consistent with Tremor and other Tailwind libraries
- **66k+ GitHub stars:** Fastest-growing UI library, massive community, regular updates
- **Design quality:** Modern, minimal, polished out of the box (Linear/Notion aesthetic)
- **CLI installer:** `npx shadcn@latest add button` installs components directly into your project

**What shadcn/ui gives you out of the box:**
- Dialogs, sheets, dropdowns, command palette (Cmd+K), data tables, forms with validation (react-hook-form + zod), tabs, toasts, tooltips, sidebar navigation, and more
- Dark mode support built in
- Perfect for building a Slack-like sidebar, settings forms, task board cards

### Mantine (Strong Alternative)

**Pros:** 100+ components, excellent documentation, interactive examples, 28k+ stars, includes date pickers, rich text editors, notifications, and hooks that shadcn/ui lacks
**Cons:** Less modern aesthetic, CSS modules approach (not Tailwind-native), harder to deeply customize. Better for enterprise admin tools than modern SaaS products.

**When to consider Mantine:** If you need a rich text editor, advanced date/time pickers, or complex form components that shadcn/ui doesn't have. You could use Mantine components selectively alongside shadcn/ui.

### Chakra UI, Ant Design, MUI

- **Chakra UI:** Good DX but CSS-in-JS (runtime overhead), less momentum in 2026
- **Ant Design:** Massive component library but heavy, enterprise-focused, design feels dated
- **MUI (Material UI):** Largest library, but Material Design aesthetic is polarizing and opinionated

**Verdict: shadcn/ui + Radix UI as the foundation.** Supplement with specific Mantine components (rich text editor, date pickers) if needed.

---

## 3. Real-Time Communication

### Recommended Approach: Hybrid (WebSockets + SSE)

**For Chat (WebSockets):**
- Chat requires bidirectional communication (user sends messages, receives messages)
- WebSockets are the industry standard (Slack, Discord, and all major chat platforms use them)
- **Socket.IO** is the pragmatic choice for MVP: handles reconnection, fallbacks, rooms/namespaces out of the box
- Later, can migrate to raw WebSockets or a service like Ably/Pusher if scale demands it

**For Dashboard Updates (Server-Sent Events):**
- Dashboard KPIs, activity feeds, and task board updates are server-to-client only
- SSE is simpler, runs over standard HTTP, benefits from HTTP/2 multiplexing
- Automatic reconnection built into the browser's EventSource API
- Lower overhead than WebSockets for one-directional data

### Implementation Architecture

```
Browser
  |
  |-- WebSocket (Socket.IO) --> Chat messages, typing indicators, presence
  |-- SSE (EventSource)     --> Dashboard KPI updates, task board changes, activity feed
  |-- REST (fetch/axios)    --> CRUD operations, settings, file uploads
```

### Alternatives Considered

| Option | Pros | Cons | When to Use |
|--------|------|------|-------------|
| **Socket.IO** | Easy setup, reconnection, rooms | Larger bundle, custom protocol | MVP chat (recommended) |
| **Raw WebSockets** | Lightweight, standard | No reconnection, no rooms | Production optimization later |
| **Ably/Pusher** | Managed infrastructure, global | Cost at scale, vendor lock-in | If you don't want to manage infra |
| **Liveblocks** | Collaborative features | Expensive, overkill for chat | If you need real-time collaboration |
| **Supabase Realtime** | Postgres-native, easy setup | Tied to Supabase ecosystem | If using Supabase as your backend |

**Verdict: Socket.IO for chat, native EventSource for dashboard updates.** Simple, proven, no vendor lock-in.

---

## 4. Chat UI Libraries

### Option A: Build Custom on chatscope/chat-ui-kit-react

**chatscope** provides:
- Message list with grouping, avatars, timestamps
- Typing indicators
- Message input with attachments
- Conversation list (channel sidebar)
- Status indicators

**Pros:** Purpose-built for chat UIs, handles scroll behavior, message grouping, and layout
**Cons:** Styling may need overriding to match your design system

### Option B: Build from Scratch with shadcn/ui Primitives (RECOMMENDED)

For a Slack-like experience, you need:
1. **Sidebar:** Channel list, DMs, thread navigation (shadcn/ui Sidebar component)
2. **Message list:** Virtualized scrolling list (use `@tanstack/react-virtual` for performance)
3. **Message input:** Rich text with markdown, mentions, file attachments
4. **Thread panel:** Slide-out panel for thread replies (shadcn/ui Sheet component)

**Why build custom:** The chat interface is the core product experience. Using a generic chat widget will feel generic. Building on shadcn/ui primitives gives you a Slack/Linear-quality chat that's fully branded and customizable.

**Key Libraries for Custom Chat:**
- `@tanstack/react-virtual` -- Virtualized scrolling for message lists (handle 10k+ messages)
- `tiptap` or `@uiw/react-md-editor` -- Rich text / markdown input
- `date-fns` -- Relative timestamps ("2 minutes ago")
- `react-dropzone` -- File attachment drag-and-drop

### Option C: Embedded Open-Source Chat (Matrix/Rocket.Chat)

- **Matrix (Element):** Full-featured, decentralized chat protocol. Overkill for this use case; adds enormous complexity.
- **Rocket.Chat:** Self-hosted Slack alternative. Could embed via iframe, but feels disconnected from your UI.
- **Mattermost:** Similar to Rocket.Chat, enterprise-focused.

**Verdict:** These are full chat products, not component libraries. Embedding them creates a Frankenstein UI. Not recommended.

**Final Recommendation: Build custom chat UI using shadcn/ui primitives + @tanstack/react-virtual.** It's more work upfront (2-3 weeks) but gives you full control over the core user experience.

---

## 5. Dashboard / Analytics Libraries

### Tremor (RECOMMENDED for KPI Dashboard)

**What Tremor provides:**
- 35+ dashboard-specific React components
- Pre-built KPI cards, sparklines, progress bars, metric displays
- Area charts, bar charts, line charts, donut charts (built on Recharts)
- Data tables with sorting, filtering, pagination
- Built on Tailwind CSS + Radix UI (same foundation as shadcn/ui -- seamless integration)
- Copy-paste model (same philosophy as shadcn/ui)

**Perfect for:**
- Revenue/spending KPI cards
- Agent activity charts (tasks completed over time)
- Department performance metrics
- Budget utilization gauges

### Recharts (For Custom Charts)

- 24.8k+ GitHub stars, most popular React chart library
- Built on D3, declarative API, easy to customize
- Tremor uses Recharts under the hood, so you get both

### Dashboard Layout

Use a combination of:
- **CSS Grid / Tailwind Grid** for the main dashboard layout
- **Tremor components** for KPI cards and charts
- **shadcn/ui DataTable** for tabular data (recent activity, task lists)
- **react-grid-layout** if you want user-customizable dashboard widget positions (drag to rearrange)

### Alternatives Considered

| Library | Strengths | Weaknesses |
|---------|-----------|------------|
| **Tremor** | Dashboard-purpose-built, Tailwind-native | Smaller component set than general UI libs |
| **Recharts** | Popular, flexible, good docs | Requires more custom work for KPI cards |
| **Nivo** | Beautiful defaults, many chart types | Heavier, less Tailwind-native |
| **Chart.js (react-chartjs-2)** | Lightweight, simple | Canvas-based (less accessible), less React-native |
| **Visx** | Low-level D3+React, maximum control | Too low-level for MVP speed |
| **Apache ECharts** | Extremely powerful, huge chart variety | Heavy, complex API, not React-native |

**Verdict: Tremor for the KPI dashboard layer, with Recharts available for any custom charts Tremor doesn't cover.**

---

## 6. Org Chart / Hierarchy Visualization

### React Flow (xyflow) (RECOMMENDED)

**Why React Flow:**
- 25k+ GitHub stars, MIT licensed, actively maintained
- Built for node-based UIs: org charts, workflows, diagrams
- Interactive: zoom, pan, drag nodes, connect edges
- Custom node components: render any React component as a node (agent cards with avatars, status indicators, role info)
- Layout algorithms: integrates with dagre or elkjs for automatic tree layout
- Used by Stripe, Typeform, and thousands of production apps

**For your org chart specifically:**
```
CEO Agent
  ├── CTO Agent
  │   ├── Frontend Dev Agent
  │   └── Backend Dev Agent
  ├── CFO Agent
  │   └── Accountant Agent
  └── CMO Agent
      ├── Content Writer Agent
      └── Social Media Agent
```

React Flow can render this as an interactive tree where:
- Each node shows agent name, role, status (active/idle/error), task count
- Click a node to see agent details, recent activity, configuration
- Drag to reorganize the hierarchy
- Zoom and pan for large org structures
- Animate connections to show real-time message flow between agents

### Implementation with React Flow + dagre

```tsx
import ReactFlow, { Controls, MiniMap } from 'reactflow';
import dagre from 'dagre';

// dagre handles automatic tree layout
// ReactFlow renders interactive nodes and edges
// Custom AgentNode component shows avatar, name, status, metrics
```

### Alternatives Considered

| Library | Pros | Cons |
|---------|------|------|
| **React Flow** | Most flexible, huge community, custom nodes | Requires layout library for tree structure |
| **react-organizational-chart** | Purpose-built for org charts | Less flexible, smaller community |
| **PrimeReact OrganizationChart** | Part of PrimeReact suite | Tied to PrimeReact ecosystem |
| **D3.js (custom)** | Maximum control | Enormous effort, not React-native |
| **yFiles** | Enterprise-grade, beautiful | Commercial license, expensive |
| **GoJS** | Feature-rich diagramming | Commercial license |

**Verdict: React Flow with dagre for automatic layout.** The combination gives you a beautiful, interactive org chart with custom agent cards, and the same library can later power workflow visualization (showing how agents collaborate on tasks).

---

## 7. Design Inspiration & Architectural Patterns

### Linear's Approach (Issue Tracking)

**Tech stack:** TypeScript everywhere, React frontend, Node.js backend, PostgreSQL, Redis, GraphQL API
**Key pattern:** Proprietary sync engine that replicates data across clients, enabling offline support and instant UI. Engineers can solo-build features from start to finish.
**Design philosophy:** Fast, keyboard-driven, minimal chrome. Every interaction feels instant because of optimistic updates + sync engine.

**What to borrow:**
- Keyboard shortcuts (Cmd+K command palette, single-key shortcuts)
- Optimistic UI updates (update the UI before the server confirms)
- Minimal, clean design with information density
- Left sidebar navigation pattern

### Slack's Approach (Chat)

**Key patterns:**
- Channel-based messaging with threads
- Real-time presence indicators
- Rich message formatting (markdown, code blocks, reactions)
- Sidebar: channels, DMs, apps organized in sections
- Message input with slash commands, mentions, emoji picker

**What to borrow:**
- Channel/thread architecture for organizing agent communications
- Presence indicators adapted for agent status (active, idle, processing, error)
- Slash commands for interacting with agents from chat

### Notion's Approach (Knowledge/Dashboard)

**Key patterns:**
- Block-based content system
- Flexible page layouts
- Database views (table, board, gallery, calendar)
- Sidebar with nested page hierarchy

**What to borrow:**
- Multiple view types for the same data (Kanban board vs. list vs. table for tasks)
- Clean, spacious layout with good typography
- Sidebar with collapsible sections

### Recommended Design System

```
Layout:
  ┌─────────────────────────────────────────────┐
  │ Top Bar: Breadcrumbs, Search (Cmd+K), User  │
  ├──────┬──────────────────────────────────────┤
  │      │                                       │
  │ Side │    Main Content Area                  │
  │ bar  │    (Chat / Dashboard / Tasks /        │
  │      │     Settings / Org Chart)             │
  │ Nav  │                                       │
  │      │                                       │
  ├──────┴──────────────────────────────────────┤
  │ (Optional) Bottom: Status bar / notifications│
  └─────────────────────────────────────────────┘
```

**Color palette:** Dark mode primary (like Linear/Slack), light mode secondary. Neutral grays with a single accent color.

**Typography:** Inter or Geist (both free, both used by modern SaaS products).

---

## 8. Open-Source Admin Dashboard Templates

### TailAdmin Next.js (RECOMMENDED as Starting Point)

**Why TailAdmin:**
- Free and open-source (MIT license)
- Built with Next.js 15, React 19, Tailwind CSS v4
- 500+ dashboard UI components
- Pre-built pages: analytics dashboard, CRM, user profiles, settings, tables, forms, auth pages
- 6 dashboard variations (SaaS, analytics, CRM, etc.)
- Active development, regular updates

**How to use it:** Don't adopt the entire template. Cherry-pick:
1. The layout structure (sidebar + top bar + main content)
2. Form components for settings/config pages
3. Table components for task lists
4. Auth pages (login, signup)
5. Dashboard card patterns for KPIs

Then replace the charts with Tremor, build custom chat, and add React Flow for org chart.

### Other Options

| Template | Stack | Components | License |
|----------|-------|------------|---------|
| **TailAdmin Next.js** | Next.js 15, Tailwind v4 | 500+ | MIT |
| **NextAdmin** | Next.js 15, Tailwind | 200+ | MIT |
| **CoreUI React** | React 19, Bootstrap 5 | 100+ | MIT |
| **Materio** | Next.js, MUI | 100+ | Free tier |
| **Horizon UI** | Next.js 15, Chakra UI | 70+ | MIT |

**Verdict: Start with TailAdmin Next.js for layout and scaffolding, then layer in shadcn/ui, Tremor, and React Flow for the specialized components.**

---

## 9. Mobile Responsiveness

### Approach: Responsive Web First, Not Native

For an MVP, a responsive web app is the right call. No native mobile app needed yet.

**Strategy:**
1. **Sidebar:** Collapsible on mobile, hamburger menu or bottom tab navigation
2. **Chat:** Full-width on mobile, thread panel becomes full-screen overlay
3. **Dashboard:** Stack KPI cards vertically, charts become scrollable
4. **Task board:** Switch from Kanban (horizontal scroll) to list view on mobile
5. **Org chart:** Pinch-to-zoom, simplified node cards on small screens

**Implementation:**
- Tailwind CSS responsive utilities (`sm:`, `md:`, `lg:` breakpoints)
- shadcn/ui components are responsive by default
- Use `useMediaQuery` hook to switch layouts (Kanban -> List) on mobile
- Test with Chrome DevTools device emulation

**Defer to later:**
- Native mobile app (React Native or Expo)
- Push notifications (use web push notifications via service workers for now)
- Offline support (Progressive Web App can come later)

---

## 10. Backend Recommendations

### Node.js with TypeScript (RECOMMENDED for MVP)

**Why Node.js:**
- **TypeScript everywhere:** Same language frontend and backend, shared types, shared validation schemas (Zod)
- **WebSocket native:** Socket.IO and ws are first-class citizens
- **Largest real-time ecosystem:** Every chat/real-time library targets Node.js first
- **Concurrent connections:** Event-driven model handles thousands of simultaneous WebSocket connections
- **npm ecosystem:** Packages for everything you need

**Specific framework: Fastify or Express**
- **Fastify:** Faster, better TypeScript support, schema-based validation, plugin system
- **Express:** More tutorials, more middleware, lower learning curve
- For MVP speed, Express is fine. Migrate to Fastify later if needed.

### Python FastAPI (Strong Alternative)

**When to choose FastAPI:**
- Your AI/ML pipeline is in Python (LangChain, LlamaIndex, etc.)
- You want automatic OpenAPI documentation
- Your team is stronger in Python than TypeScript

**Architecture if using FastAPI:**
```
Browser <---> Next.js (frontend + BFF) <---> FastAPI (AI orchestration + API)
                                         <---> PostgreSQL + Redis
```

The Next.js app acts as a Backend-for-Frontend (BFF), handling auth, sessions, and proxying to FastAPI for AI operations.

### Recommended Backend Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Browser    │────▶│   Next.js    │────▶│  PostgreSQL  │
│  (React UI)  │     │  App Router  │     │  (primary DB)│
└─────────────┘     │  + API Routes│     └─────────────┘
       │            └──────┬───────┘            │
       │                   │                    │
       │ WebSocket    ┌────▼────┐         ┌────▼────┐
       └─────────────▶│ Socket  │         │  Redis   │
                      │  .IO    │─────────│ (pub/sub │
                      │ Server  │         │  + cache)│
                      └─────────┘         └─────────┘
                           │
                      ┌────▼────┐
                      │   AI    │
                      │ Engine  │
                      │(Python) │
                      └─────────┘
```

**Key architectural decisions:**
- Next.js API Routes handle REST endpoints and SSE streams
- Socket.IO runs as a separate process (or attached to the Next.js custom server) for WebSocket chat
- Redis pub/sub for scaling WebSocket across multiple server instances
- PostgreSQL for all persistent data (users, messages, tasks, settings, org structure)
- AI engine communicates via message queue (Redis/BullMQ) or direct API calls

### Database Schema (High-Level)

```
users, organizations, departments
agents (config, role, department, autonomy_level)
channels (name, type, department)
messages (channel_id, author_id/agent_id, content, thread_id, timestamps)
tasks (title, status, assignee_agent_id, department, priority)
activities (type, actor, description, metadata, timestamp)
settings (org-level config, agent configs, budget rules)
```

### Auth

- **NextAuth.js (Auth.js):** Built for Next.js, supports OAuth, email/password, magic links
- Or **Clerk/Supabase Auth** for faster MVP (managed auth)

---

## 11. MVP Phasing & Effort Estimates

### Phase 1: MVP (Weeks 1-8) -- Single Developer

**Goal:** Working chat + basic dashboard that demonstrates the core value proposition.

| Component | Effort | Priority |
|-----------|--------|----------|
| Project setup (Next.js, shadcn/ui, Tailwind, auth) | 3-4 days | P0 |
| Layout shell (sidebar, top bar, routing) | 2-3 days | P0 |
| Chat interface (channels, messages, real-time) | 10-12 days | P0 |
| Basic dashboard (4-6 KPI cards, activity feed) | 4-5 days | P0 |
| Agent configuration (basic settings forms) | 3-4 days | P0 |
| Simple org chart (static tree visualization) | 2-3 days | P1 |
| Basic task list (table view, not Kanban yet) | 3-4 days | P1 |
| Auth (login, signup, basic roles) | 2-3 days | P0 |
| Backend API (CRUD, WebSocket server) | 5-7 days | P0 |
| Polish, bug fixes, mobile basic responsiveness | 3-5 days | P0 |
| **Total** | **~37-50 days (7-10 weeks)** | |

**Realistic estimate: 8 weeks for a functional MVP** with a single experienced developer using AI-assisted coding (Cursor, Claude Code, etc.), which can cut 15-25% of development time.

### Phase 2: Enhanced (Weeks 9-14)

| Component | Effort |
|-----------|--------|
| Kanban board view for tasks | 5-7 days |
| Interactive org chart (React Flow, drag-and-drop) | 5-7 days |
| Thread support in chat | 3-4 days |
| Charts and analytics (Tremor integration) | 4-5 days |
| Advanced settings (autonomy rules, budget config) | 5-7 days |
| Search (Cmd+K command palette) | 2-3 days |
| Notifications system | 3-4 days |
| Mobile responsiveness polish | 3-4 days |

### Phase 3: Polish (Weeks 15-20)

| Component | Effort |
|-----------|--------|
| Dark mode | 2-3 days |
| Keyboard shortcuts | 2-3 days |
| File attachments in chat | 3-4 days |
| Dashboard customization (drag widgets) | 5-7 days |
| Agent workflow visualization | 5-7 days |
| Performance optimization (virtualization, lazy loading) | 3-5 days |
| Comprehensive mobile support | 5-7 days |

### What to Defer to v2+

- Native mobile app
- Video/voice calls between users and agents
- Real-time collaborative editing (Notion-like)
- AI-powered search across all content
- Custom dashboard widget builder
- Audit logs and compliance features
- SSO/SAML enterprise auth
- Multi-tenancy
- Internationalization (i18n)

---

## 12. Minimum Viable UI Definition

**The absolute minimum to demo the product (4-5 weeks):**

1. **Chat page** -- A single-channel chat where you can talk to AI agents and see their responses in real-time. No threads, no channels sidebar (just one default channel). Basic message list + input.

2. **Dashboard page** -- 4 static KPI cards (tasks completed, active agents, messages today, budget spent) + a simple activity feed (last 20 events as a list).

3. **Settings page** -- A form to configure 1-2 agents (name, role, model, autonomy level). Basic validation.

4. **Auth** -- Login/signup page. Email + password.

5. **Navigation** -- Sidebar with 3 links: Chat, Dashboard, Settings.

**What this proves:** That AI agents can work as a team, communicate via chat, and be monitored through a dashboard. Everything else is enhancement.

---

## 13. Complete Recommended Tech Stack

### Frontend
| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | Next.js 15 (App Router) | Ecosystem, SSR, API routes |
| Language | TypeScript | Type safety, shared with backend |
| UI Components | shadcn/ui + Radix UI | Modern design, accessible, customizable |
| Styling | Tailwind CSS v4 | Utility-first, consistent with shadcn + Tremor |
| Dashboard | Tremor + Recharts | Purpose-built KPI cards and charts |
| Org Chart | React Flow + dagre | Interactive node-based visualization |
| Forms | react-hook-form + Zod | Performant forms with schema validation |
| Tables | @tanstack/react-table | Headless, powerful data tables |
| Virtual Scrolling | @tanstack/react-virtual | Chat message list performance |
| State Management | Zustand or Jotai | Lightweight, no boilerplate |
| Data Fetching | TanStack Query (React Query) | Caching, refetching, optimistic updates |

### Backend
| Layer | Technology | Why |
|-------|-----------|-----|
| Runtime | Node.js 22+ | Same language as frontend |
| Framework | Express (MVP) or Fastify (later) | Simplicity for MVP |
| Language | TypeScript | Shared types with frontend |
| Real-time | Socket.IO | WebSocket with reconnection, rooms |
| Database | PostgreSQL | Relational data, JSON support |
| Cache/Pub-Sub | Redis | WebSocket scaling, caching, queues |
| ORM | Drizzle ORM or Prisma | Type-safe database queries |
| Auth | NextAuth.js (Auth.js) | Built for Next.js |
| Validation | Zod | Shared schemas frontend + backend |
| Job Queue | BullMQ (Redis-based) | Background jobs, AI task processing |

### DevOps (MVP)
| Layer | Technology | Why |
|-------|-----------|-----|
| Hosting | Vercel (frontend) + Railway/Render (backend) | Fast deploy, free tiers |
| Database | Supabase or Neon (managed Postgres) | Free tier, easy setup |
| Redis | Upstash (serverless Redis) | Free tier, Redis pub/sub |
| Monitoring | Vercel Analytics + Sentry | Error tracking, performance |
| CI/CD | GitHub Actions | Automated tests and deploy |

---

## 14. Key Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Chat UI takes too long to build | Delays MVP by 2+ weeks | Start with minimal chat (no threads, no rich text), iterate |
| Real-time scaling issues | WebSocket server crashes under load | Use Redis pub/sub from day 1, even with single server |
| shadcn/ui missing needed components | Time spent building from scratch | Have Mantine as fallback for complex components |
| Next.js App Router complexity | Developer productivity loss | Use Pages Router for complex dynamic pages if needed |
| Single developer burnout | Project stalls | Phase ruthlessly, ship ugly-but-functional MVP first |
| Mobile responsiveness | Broken mobile experience | Defer mobile polish to Phase 2, test only desktop for MVP |

---

## Sources

### Framework Comparisons
- [Next.js vs Remix vs SvelteKit 2026 Comparison (NxCode)](https://www.nxcode.io/resources/news/nextjs-vs-remix-vs-sveltekit-2025-comparison)
- [SvelteKit vs Next.js in 2026 (Prismic)](https://prismic.io/blog/sveltekit-vs-nextjs)
- [Top 10 Full Stack Frameworks 2026 (Nucamp)](https://www.nucamp.co/blog/top-10-full-stack-frameworks-in-2026-next.js-remix-nuxt-sveltekit-and-more)
- [Best Next.js Alternatives 2026 (Naturaily)](https://naturaily.com/blog/best-nextjs-alternatives)

### UI Component Libraries
- [React UI Libraries 2025 Comparison (Makers' Den)](https://makersden.io/blog/react-ui-libs-2025-comparing-shadcn-radix-mantine-mui-chakra)
- [Mantine vs shadcn/ui Comparison (SaaSIndie)](https://saasindie.com/blog/mantine-vs-shadcn-ui-comparison)
- [14 Best React UI Libraries 2026 (Untitled UI)](https://www.untitledui.com/blog/react-component-libraries)
- [Best React UI Libraries 2026 (Builder.io)](https://www.builder.io/blog/react-component-libraries-2026)

### Real-Time Communication
- [SSE vs WebSockets 2026 Guide (Nimbleway)](https://www.nimbleway.com/blog/server-sent-events-vs-websockets-what-is-the-difference-2026-guide)
- [WebSockets vs SSE (Ably)](https://ably.com/blog/websockets-vs-sse)
- [Why SSE Beats WebSockets for 95% of Apps (Medium)](https://medium.com/codetodeploy/why-server-sent-events-beat-websockets-for-95-of-real-time-cloud-applications-830eff5a1d7c)

### Chart & Dashboard Libraries
- [Tremor Dashboard Components](https://www.tremor.so/)
- [Top 5 React Chart Libraries 2026 (Syncfusion)](https://www.syncfusion.com/blogs/post/top-5-react-chart-libraries)
- [Best React Chart Libraries 2025 (LogRocket)](https://blog.logrocket.com/best-react-chart-libraries-2025/)

### Chat UI
- [chatscope Chat UI Kit (GitHub)](https://github.com/chatscope/chat-ui-kit-react)
- [LlamaIndex Chat UI Components (GitHub)](https://github.com/run-llama/chat-ui)

### Org Chart / Visualization
- [React Flow (xyflow)](https://reactflow.dev)
- [React Org Chart Visualization with ReactFlow (GitHub)](https://github.com/hongjs/poc-reactflow)

### Admin Dashboard Templates
- [TailAdmin Next.js (GitHub)](https://github.com/TailAdmin/free-nextjs-admin-dashboard)
- [Free Next.js Admin Dashboard Templates 2026 (TailAdmin)](https://tailadmin.com/blog/free-nextjs-admin-dashboard)

### Architecture Inspiration
- [Linear's Tech Stack & Story (Pragmatic Engineer)](https://newsletter.pragmaticengineer.com/p/linear)
- [What Slack, Notion, and Linear Have in Common (Medium)](https://matsbauer.medium.com/what-slack-notion-and-linear-have-in-common-and-why-they-keep-winning-348f654622b7)
- [Breaking Down Notion's Tech Stack (SlashDev)](https://slashdev.io/-breaking-down-notions-tech-stack)

### Backend
- [FastAPI vs Express 2025 (Slincom)](https://www.slincom.com/blog/programming/fastapi-vs-express-backend-comparison-2025)
- [FastAPI vs Node.js 2026 (Second Talent)](https://www.secondtalent.com/resources/fastapi-vs-node-js-usage-speed-and-popularity/)

### MVP Timelines
- [How Long Does It Take to Build an MVP (Netguru)](https://www.netguru.com/blog/mvp-timeline)
- [MVP Development Cost 2026 (Ideas2IT)](https://www.ideas2it.com/blogs/mvp-development-cost)
