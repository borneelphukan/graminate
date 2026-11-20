# AI Integration (LLM)

## Overview

Graminate includes an AI-powered agricultural assistant powered by **OpenAI GPT-4o**. The assistant can answer agricultural questions AND query the user's own data (sales, expenses, contacts, inventory, etc.) using function calling.

## Architecture

```
Frontend ChatWindow  →  POST /api/llm (backend)  →  OpenAI GPT-4o  →  Internal API calls
                         (JWT auth, plan gating)     (with tools)      (to backend endpoints)
```

### Flow
1. User sends a message in the ChatWindow component
2. Frontend proxies to `POST /api/llm` on the backend (with JWT)
3. Backend validates plan eligibility and query limits
4. Backend calls OpenAI GPT-4o with conversation history and tool definitions
5. GPT-4o may invoke tools to fetch user data (internal HTTP calls to own API)
6. Tool results are fed back to GPT-4o for final response generation
7. Response returned to frontend and displayed in chat

## Access Control

| Plan | LLM Access | Monthly Limit |
|------|-----------|---------------|
| FREE | ❌ Blocked | 0 |
| BASIC | ✅ Available | 100 queries |
| PRO | ✅ Available | 300 queries |

- Query counter: `llm_queries_this_month` on the users table
- Reset: `llm_queries_reset_at` (30-day rolling window)
- Counter increments after each successful response (with or without tool calls)
- Reset happens automatically when `llm_queries_reset_at` is in the past

## Available Tools (Function Calling)

The LLM has access to 11 tools that query the user's data:

| Tool Name | Description | Parameters |
|-----------|-------------|------------|
| `get_contacts` | Get all CRM contacts | None |
| `get_companies` | Get all CRM companies | None |
| `get_contracts` | Get all contracts | None |
| `get_receipts` | Get all receipts/invoices | None |
| `get_sales_records` | Get all sales records | None |
| `get_expense_records` | Get all expense records | None |
| `get_poultry_egg_records` | Get egg collection records | `flock_name?` (optional filter) |
| `get_warehouses` | Get all warehouses | None |
| `get_inventory_items` | Get inventory items | `warehouse_name?` (optional filter) |
| `get_labour_records` | Get all employees | None |
| `get_labour_payments` | Get salary payments | `employee_name?` (optional filter) |

## System Prompt

```
The current date and time is {currentDate}. You are a helpful assistant for Graminate,
an agricultural platform. You are an expert in agricultural sciences, also including
Poultry, Animal Rearing and Bee Keeping. You can also help users by fetching their data,
like contacts, companies, contracts, receipts, sales, expenses, poultry, warehouses,
inventory, and employee (labour) data from the system using the provided tools. You can
calculate financial metrics like total revenue, total expenses, and profit from this data.
When asked about poultry eggs, remember that egg sizes (small, medium, large, extra-large)
are based on Indian standards. When asked to fetch data, use the tools. For any other topics,
politely decline and state your purpose. When presenting lists of data, format them clearly
and always use markdown tables.
```

## Tool Implementation

Each tool makes an internal HTTP call to the backend's own API endpoints:

```typescript
// Example: get_contacts tool
const { data } = await firstValueFrom(
  this.httpService.get(`/api/contacts/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
);
```

Key implementation details:
- Uses `@nestjs/axios` HttpService for internal calls
- Passes the original JWT token for authentication
- The `NESTJS_API_URL` env var provides the base URL for self-calls
- Tool responses are JSON-stringified for the LLM

## Conversation Management

- **History limit**: Last 15 messages sent to GPT-4o (prevents token overflow)
- **Max tokens**: 1500 per response
- **Model**: `gpt-4o`
- **Tool choice**: `auto` (GPT-4o decides when to use tools)
- **Multi-turn tool calling**: Supports sequential tool calls within a conversation

## Frontend Integration

### ChatWindow Component
- Located at `src/layout/ChatWindow.tsx` (both frontend and mobile)
- Floating widget available across all authenticated pages
- Maintains conversation history in component state
- Supports markdown rendering in responses (`react-markdown` + `remark-gfm`)
- Displays tool usage indicators

### API Proxy Routes
- **Frontend**: `src/pages/api/llm.ts` — Proxy to backend
- **Backend**: `POST /api/llm` — Direct endpoint

## LLM DTO Schema

```typescript
// From @graminate/shared
interface LlmDto {
  history: Array<{ sender: 'user' | 'bot'; text: string }>;
  userId?: string;  // Injected from JWT
  token?: string;   // JWT for internal API calls
}
```

## Error Handling

- `BadRequestException` — Invalid history, user not found
- `ForbiddenException` — Plan doesn't allow LLM or limit reached
- `InternalServerErrorException` — OpenAI API failure or downstream error

## Use Cases

1. **Agricultural Q&A**: "What's the best feed for layer hens?"
2. **Financial Analysis**: "What was my total revenue last month?"
3. **Inventory Check**: "How many bags of feed do I have in Warehouse A?"
4. **Labour Reports**: "Show me pending salary payments for Ram Kumar"
5. **Poultry Analytics**: "How many eggs did my White Leghorn flock produce this week?"
6. **Expense Tracking**: "What's my biggest expense category?"
7. **CRM Queries**: "List all my contacts in the buyer category"
