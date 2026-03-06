import type { Request, Response } from "express";
import { Router } from "express";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText, tool, jsonSchema, stepCountIs } from "ai";
import multer from "multer";
import { supabase } from "./supabase";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const openai = createOpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL ?? process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1",
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY ?? process.env.OPENAI_API_KEY ?? "",
});

const DB_SCHEMA = `
You have READ-ONLY access to the TeamSync PostgreSQL database via the queryDatabase tool. ALWAYS query the database to answer data questions — never guess or give generic instructions.

## DATABASE SCHEMA (27 tables):

### Business Verticals
- verticals(id text PK, name text, short_name text, color text, tagline text, description text, is_active boolean)
  Vertical IDs: hr (LegalNations), sales (USDrop AI), faire (FaireDesk), events (GoyoTours), suprans, hub (EventHub), ets (EazyToSell), dev (Developer), admin (LBM Lifestyle), hrms, ats, crm, finance, oms, social

### Users & Teams
- users(id uuid PK, employee_code text, name text, email text, phone text, role text, department text, designation text, employment_type text, status text, location text, skills text[], avatar_initials text, salary numeric, reporting_manager_id uuid FK→users, joined_date date)
- user_verticals(user_id uuid FK→users, vertical_id text FK→verticals, vertical_role text)

### Tasks & Tickets
- tasks(id uuid PK, task_code text, vertical_id text, title text, description text, status text [todo/in-progress/review/done/blocked], priority text [critical/high/medium/low], assignee_id uuid FK→users, assignee_name text, due_date date, tags text[], created_by_name text)
- task_subtasks(id uuid PK, task_id uuid FK→tasks, title text, completed boolean, sort_order int)
- task_activity(id uuid PK, task_id text, type text, content text, author text)
- tickets(id uuid PK, ticket_code text, vertical_id text, title text, description text, status text [open/in-progress/waiting/escalated/resolved/closed], priority text [critical/high/medium/low], category text, reported_by text, assigned_to text, tags text[], resolution text, due_date date)

### Communication
- channels(id uuid PK, vertical_id text, name text, type text [channel/dm], description text, member_names text[], is_pinned boolean, last_message text, last_message_at timestamptz, unread_count int)
- channel_messages(id uuid PK, channel_id uuid FK→channels, sender_name text, content text, is_me boolean, attachments jsonb, reactions jsonb, message_type text)

### Contacts & Resources
- contacts(id uuid PK, name text, title text, organization text, category text, vertical_ids text[], phone text, whatsapp text, email text, city text, country text, priority text, notes text, tags text[])
- resources(id uuid PK, vertical_id text, title text, description text, category text, file_type text, tags text[], added_by text, url text, is_pinned boolean)
- notifications(id uuid PK, vertical_id text, type text, title text, description text, action_url text, is_read boolean)

### Finance & Banking
- bank_transactions(id uuid PK, source text, entity text, bank_name text, date date, description text, amount numeric, currency text, amount_usd numeric, type text [credit/debit], category text, is_business boolean, tags text[], reference text, faire_order_id text, reconciled boolean, notes text)
- ledger_parties(id uuid PK, name text, type text, contact_name text, email text, phone text, country text, currency text, credit_limit numeric, credit_days int, tags text[], is_active boolean)
- ledger_party_transactions(id uuid PK, party_id uuid FK→ledger_parties, type text, direction text, date date, due_date date, amount numeric, currency text, amount_usd numeric, reference text, description text, status text, paid_amount numeric, payment_date date)

### Faire / Wholesale
- faire_vendors(id uuid PK, name text, contact_name text, email text, whatsapp text, is_default boolean, country text, rating numeric, avg_lead_days int, specialties text[], completed_orders int)
- faire_product_vendors(product_id text, vendor_id uuid FK→faire_vendors, is_exclusive boolean)
- faire_seller_applications(id uuid PK, brand_name text, category text, status text [drafting/applied/pending_docs/approved/rejected], marketplace_strategy text, domain_name text, website_url text, num_products_listed int)
- faire_application_followups(id uuid PK, application_id uuid FK, followup_date date, followup_type text, note text)
- faire_application_links(id uuid PK, application_id uuid FK, label text, url text, link_type text)
- faire_transaction_attachments(id uuid PK, transaction_id text, file_name text, storage_path text)
- retailer_enrichments(retailer_id text PK, contact_name text, contact_email text, store_address text, business_type text, website text, instagram text, notes text, enriched_by text)

### AI & Images
- ai_conversations(id uuid PK, title text, vertical_id text)
- ai_messages(id uuid PK, conversation_id uuid FK, role text, content text)
- ai_attachments(id uuid PK, conversation_id uuid FK, filename text, file_size int, mime_type text)
- generated_images(id uuid PK, prompt text, style text, aspect_ratio text, status text, vertical_id text, error_message text)

## QUERY RULES:
1. ONLY use SELECT statements. Never INSERT/UPDATE/DELETE/DROP/ALTER.
2. Always LIMIT results to 50 rows max to prevent huge responses.
3. Use COUNT(*) for counting questions.
4. When filtering by vertical, use the vertical_id column.
5. For date filtering, use PostgreSQL date functions (CURRENT_DATE, interval, etc.).
6. Join tables when needed using FK relationships.
7. Return clean, readable results. Use column aliases for clarity.
8. If a query returns no results, say so clearly — don't make up data.
`;

const SYSTEM_PROMPT = `You are TeamSync AI — the intelligent co-pilot for the TeamSync business operations platform.

TeamSync is an internal operating system for a multi-brand enterprise with the following verticals:
1. **LegalNations** (id: hr) — US company formation, KYC, IRS compliance, document vault
2. **USDrop AI** (id: sales) — Dropshipping, Shopify stores, product analytics
3. **FaireDesk** (id: faire) — Wholesale marketplace on Faire, orders, retailers, vendors
4. **GoyoTours** (id: events) — China B2B travel, tour packages, bookings
5. **Suprans** (id: suprans) — Lead intake, enrichment, routing hub
6. **EventHub** (id: hub) — Networking events, venues, attendees
7. **EazyToSell** (id: ets) — Retail franchise, China-to-India market
8. **Developer** (id: dev) — Internal tools, design system
9. **LBM Lifestyle** (id: admin) — Admin operations
10. **HRMS** (id: hrms) — HR management, employees, payroll, attendance
11. **ATS** (id: ats) — Applicant tracking, recruitment
12. **Sales CRM** (id: crm) — CRM, leads, deals, pipeline
13. **Finance** (id: finance) — Accounting, ledger, transactions
14. **OMS** (id: oms) — Order management, inventory, fulfillment
15. **SMM** (id: social) — Social media management
16. **Vendor Portal** (id: vendor) — External vendor access

${DB_SCHEMA}

**Your role:**
- ALWAYS use the queryDatabase tool to answer questions about data, counts, statuses, lists, etc.
- Never give generic instructions like "go to the dashboard and check" — query the actual database instead.
- Provide real numbers, real names, real statuses from the database.
- Be concise, professional, and actionable.
- Use markdown formatting for clear presentation.
- If a query fails, explain what happened and try a different approach.
- You can make multiple queries in sequence to gather related data before answering.
- When you generate an image, always include the image ID in your response using this exact format: [GENERATED_IMAGE:imageId] so the UI can render it inline. For example: [GENERATED_IMAGE:abc-123-def]
- When asked to create, generate, draw, or design any image, use the generateImage tool.
- Users can attach files (images, CSVs, PDFs, text files) to their messages. When a file is attached, its content is included directly in the message — for images you can see and analyze them, for text/CSV/JSON files the content is embedded as text. Always acknowledge and process attached file content when present.`;

async function getOrCreateConversation(
  conversationId: string | undefined,
  verticalId: string | undefined
): Promise<string> {
  if (conversationId) {
    const { data } = await supabase
      .from("ai_conversations")
      .select("id")
      .eq("id", conversationId)
      .single();
    if (data) return conversationId;
  }

  const { data, error } = await supabase
    .from("ai_conversations")
    .insert({ title: "New Chat", vertical_id: verticalId ?? null })
    .select("id")
    .single();

  if (error || !data) throw new Error("Failed to create conversation");
  return data.id;
}

async function saveMessage(
  conversationId: string,
  role: "user" | "assistant",
  content: string
) {
  await supabase
    .from("ai_messages")
    .insert({ conversation_id: conversationId, role, content });
}

async function updateConversationTitle(conversationId: string, firstUserMessage: string) {
  const title = firstUserMessage.slice(0, 60) + (firstUserMessage.length > 60 ? "…" : "");
  await supabase
    .from("ai_conversations")
    .update({ title, updated_at: new Date().toISOString() })
    .eq("id", conversationId)
    .eq("title", "New Chat");
}

function extractMessageContent(msg: any): string {
  if (typeof msg.content === "string") return msg.content;
  if (Array.isArray(msg.parts)) {
    return msg.parts
      .filter((p: any) => p.type === "text")
      .map((p: any) => p.text)
      .join("");
  }
  return "";
}

function getDimensions(aspectRatio: string): { width: number; height: number } {
  switch (aspectRatio) {
    case "16:9": return { width: 1024, height: 576 };
    case "9:16": return { width: 576, height: 1024 };
    case "4:3": return { width: 1024, height: 768 };
    case "3:4": return { width: 768, height: 1024 };
    case "1:1":
    default: return { width: 1024, height: 1024 };
  }
}

function getOpenAISize(aspectRatio: string): string {
  switch (aspectRatio) {
    case "16:9": return "1792x1024";
    case "9:16": return "1024x1792";
    default: return "1024x1024";
  }
}

const generateImageTool = tool({
  description: "Generate an image using DALL-E 3. Use this when the user asks you to create, generate, draw, or design an image. The image will be stored in the library automatically.",
  inputSchema: jsonSchema<{ prompt: string; aspectRatio?: string }>({
    type: "object",
    properties: {
      prompt: { type: "string", description: "Detailed description of the image to generate. Be specific about style, composition, colors, and subject." },
      aspectRatio: { type: "string", description: "Aspect ratio: 1:1, 16:9, 9:16, 4:3, 3:4. Default 1:1.", enum: ["1:1", "16:9", "9:16", "4:3", "3:4"] },
    },
    required: ["prompt"],
    additionalProperties: false,
  }),
  execute: async ({ prompt, aspectRatio = "1:1" }) => {
    console.log(`[ai-chat] Generating image: ${prompt.slice(0, 100)}`);

    const dimensions = getDimensions(aspectRatio);
    const { data: record, error: insertError } = await supabase
      .from("generated_images")
      .insert({
        prompt: prompt.trim(),
        style: "auto",
        aspect_ratio: aspectRatio,
        width: dimensions.width,
        height: dimensions.height,
        status: "pending",
        source: "chat",
      })
      .select("id")
      .single();

    if (insertError || !record) {
      return { error: "Failed to create image record", imageId: null };
    }

    const apiKey = process.env.IMAGE_GEN_API_KEY
      ?? process.env.AI_INTEGRATIONS_OPENAI_API_KEY
      ?? process.env.OPENAI_API_KEY;
    const baseUrl = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL
      ?? process.env.OPENAI_BASE_URL
      ?? "https://api.openai.com/v1";

    if (!apiKey) {
      await supabase
        .from("generated_images")
        .update({ status: "failed", error_message: "API key not configured", updated_at: new Date().toISOString() })
        .eq("id", record.id);
      return { error: "Image generation API key not configured", imageId: record.id };
    }

    try {
      const response = await fetch(`${baseUrl}/images/generations`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt,
          n: 1,
          size: getOpenAISize(aspectRatio),
          response_format: "b64_json",
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        await supabase
          .from("generated_images")
          .update({ status: "failed", error_message: `API error ${response.status}: ${errText.slice(0, 300)}`, updated_at: new Date().toISOString() })
          .eq("id", record.id);
        return { error: `Image generation failed (${response.status})`, imageId: record.id };
      }

      const result = (await response.json()) as { data?: Array<{ b64_json?: string; url?: string }> };
      const imageResult = result.data?.[0];

      if (imageResult?.b64_json) {
        const imageData = `data:image/png;base64,${imageResult.b64_json}`;
        await supabase
          .from("generated_images")
          .update({ status: "completed", image_data: imageData, updated_at: new Date().toISOString() })
          .eq("id", record.id);
        return { success: true, imageId: record.id, message: "Image generated successfully" };
      } else if (imageResult?.url) {
        await supabase
          .from("generated_images")
          .update({ status: "completed", image_url: imageResult.url, updated_at: new Date().toISOString() })
          .eq("id", record.id);
        return { success: true, imageId: record.id, message: "Image generated successfully" };
      }

      await supabase
        .from("generated_images")
        .update({ status: "failed", error_message: "No image returned", updated_at: new Date().toISOString() })
        .eq("id", record.id);
      return { error: "No image returned from API", imageId: record.id };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      await supabase
        .from("generated_images")
        .update({ status: "failed", error_message: msg, updated_at: new Date().toISOString() })
        .eq("id", record.id);
      return { error: `Image generation failed: ${msg}`, imageId: record.id };
    }
  },
});

const BLOCKED_SQL = /\b(INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE|GRANT|REVOKE|EXECUTE|COPY)\b/i;

const queryDatabaseTool = tool({
  description: "Execute a read-only SQL query against the TeamSync PostgreSQL database. Use this to answer any data-related questions. Only SELECT queries are allowed. Always LIMIT to 50 rows.",
  inputSchema: jsonSchema<{ sql: string; purpose: string }>({
    type: "object",
    properties: {
      sql: { type: "string", description: "The SELECT SQL query to execute. Must be read-only. Always include LIMIT." },
      purpose: { type: "string", description: "Brief description of what this query is checking (for logging)" },
    },
    required: ["sql", "purpose"],
    additionalProperties: false,
  }),
  execute: async ({ sql: query, purpose }) => {
    console.log(`[ai-db] Query (${purpose}): ${query.slice(0, 200)}`);

    if (BLOCKED_SQL.test(query)) {
      return { error: "Only SELECT queries are allowed. Write operations are blocked.", rows: [] };
    }

    if (!query.trim().toUpperCase().startsWith("SELECT")) {
      return { error: "Query must start with SELECT.", rows: [] };
    }

    query = query.replace(/;\s*$/, "").trim();

    const limitMatch = query.match(/LIMIT\s+(\d+)/i);
    if (limitMatch) {
      const n = parseInt(limitMatch[1], 10);
      if (n > 50) {
        query = query.replace(/LIMIT\s+\d+/i, "LIMIT 50");
      }
    } else {
      query = query + " LIMIT 50";
    }

    try {
      const { data, error } = await supabase.rpc("exec_readonly_sql", { query_text: query });

      if (error) {
        console.error("[ai-db] RPC error:", error.message);
        return { error: `Query failed: ${error.message}. Try a simpler query or check table/column names.`, rows: [] };
      }

      return { rows: data ?? [], rowCount: Array.isArray(data) ? data.length : 0 };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      return { error: `Query execution failed: ${msg}`, rows: [] };
    }
  },
});

router.post("/chat", async (req: Request, res: Response) => {
  try {
    const { messages, conversationId: incomingId, verticalId, attachmentIds } = req.body as {
      messages: any[];
      conversationId?: string;
      verticalId?: string;
      attachmentIds?: string[];
    };

    if (!messages || messages.length === 0) {
      return res.status(400).json({ error: "messages required" });
    }

    const convId = await getOrCreateConversation(incomingId, verticalId);

    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
    if (lastUserMessage) {
      const content = extractMessageContent(lastUserMessage);
      await saveMessage(convId, "user", content);
      await updateConversationTitle(convId, content);
    }

    const aiMessages: Array<{ role: "user" | "assistant" | "system"; content: string | Array<any> }> = messages.map((m) => ({
      role: m.role as "user" | "assistant" | "system",
      content: extractMessageContent(m),
    }));

    if (attachmentIds && attachmentIds.length > 0) {
      const { data: attachmentRows } = await supabase
        .from("ai_attachments")
        .select("id, filename, file_data, mime_type")
        .eq("conversation_id", convId)
        .in("id", attachmentIds);

      if (attachmentRows && attachmentRows.length > 0) {
        const lastUserIdx = aiMessages.length - 1 - [...aiMessages].reverse().findIndex((m) => m.role === "user");
        if (lastUserIdx >= 0 && lastUserIdx < aiMessages.length) {
          const textContent = typeof aiMessages[lastUserIdx].content === "string"
            ? aiMessages[lastUserIdx].content as string
            : "";

          const TEXT_EMBEDDABLE_MIMES = [
            "text/", "application/json", "application/csv", "application/xml",
            "application/javascript", "application/typescript", "application/x-yaml",
            "application/octet-stream",
          ];
          const isTextEmbeddable = (mime: string) =>
            TEXT_EMBEDDABLE_MIMES.some((prefix) => mime.startsWith(prefix));

          const contentParts: Array<any> = [{ type: "text", text: textContent }];

          for (const att of attachmentRows) {
            const mimeType = att.mime_type as string;
            const fileData = att.file_data as string;
            const filename = att.filename as string;

            if (mimeType.startsWith("image/")) {
              const imgBase64Match = fileData.match(/^data:[^;]+;base64,(.+)$/);
              if (imgBase64Match) {
                const imgBuffer = Buffer.from(imgBase64Match[1], "base64");
                contentParts.push({
                  type: "image",
                  image: imgBuffer,
                  mimeType: mimeType,
                });
                console.log(`[ai-chat] Including image attachment: ${filename} (${imgBuffer.length} bytes)`);
              }
            } else if (isTextEmbeddable(mimeType)) {
              const base64Match = fileData.match(/^data:[^;]+;base64,(.+)$/);
              if (base64Match) {
                const decoded = Buffer.from(base64Match[1], "base64").toString("utf-8");
                const truncated = decoded.length > 50000 ? decoded.slice(0, 50000) + "\n\n[Content truncated at 50,000 characters]" : decoded;
                contentParts.push({
                  type: "text",
                  text: `\n\n--- Attached file: ${filename} (${mimeType}) ---\n${truncated}\n--- End of file ---`,
                });
                console.log(`[ai-chat] Including text attachment: ${filename} (${decoded.length} chars)`);
              }
            } else {
              contentParts.push({
                type: "text",
                text: `\n\n[Attached file: ${filename} (${mimeType}) — binary file type, content cannot be displayed inline]`,
              });
              console.log(`[ai-chat] Skipping binary attachment: ${filename} (${mimeType})`);
            }
          }

          aiMessages[lastUserIdx].content = contentParts;
        }
      }
    }

    const verticalContext = verticalId ? `\n\nCurrent vertical context: ${verticalId}. When querying, filter by vertical_id = '${verticalId}' when relevant.` : "";

    const result = streamText({
      model: openai.chat("gpt-4o"),
      system: SYSTEM_PROMPT + verticalContext,
      messages: aiMessages,
      tools: { queryDatabase: queryDatabaseTool, generateImage: generateImageTool },
      stopWhen: stepCountIs(5),
      maxOutputTokens: 4096,
      onFinish: async ({ text }) => {
        if (text) {
          await saveMessage(convId, "assistant", text);
          await supabase
            .from("ai_conversations")
            .update({ updated_at: new Date().toISOString() })
            .eq("id", convId);
        }
      },
    });

    res.setHeader("X-Conversation-Id", convId);
    result.pipeUIMessageStreamToResponse(res);
  } catch (err) {
    console.error("[ai-chat] chat error:", err);
    return res.status(500).json({ error: "AI chat failed" });
  }
});

router.get("/conversations/search", async (req: Request, res: Response) => {
  try {
    const q = (req.query.q as string || "").trim();
    if (!q || q.length < 2) return res.json([]);

    const pattern = `%${q}%`;

    const { data: titleMatches, error: titleErr } = await supabase
      .from("ai_conversations")
      .select("id, title, vertical_id, created_at, updated_at")
      .ilike("title", pattern)
      .order("updated_at", { ascending: false })
      .limit(20);

    if (titleErr) return res.status(500).json({ error: "Search failed" });

    const { data: messageMatches, error: msgErr } = await supabase
      .from("ai_messages")
      .select("conversation_id, content, role, created_at")
      .ilike("content", pattern)
      .order("created_at", { ascending: false })
      .limit(50);

    if (msgErr) return res.status(500).json({ error: "Search failed" });

    const messageConvIds = new Set(
      (messageMatches ?? []).map((m) => m.conversation_id)
    );
    const titleConvIds = new Set((titleMatches ?? []).map((c) => c.id));

    const missingIds = [...messageConvIds].filter((id) => !titleConvIds.has(id));
    let extraConvs: any[] = [];
    if (missingIds.length > 0) {
      const { data, error: extraErr } = await supabase
        .from("ai_conversations")
        .select("id, title, vertical_id, created_at, updated_at")
        .in("id", missingIds);
      if (extraErr) return res.status(500).json({ error: "Search failed" });
      extraConvs = data ?? [];
    }

    const allConvs = [...(titleMatches ?? []), ...extraConvs];

    const snippetsByConv = new Map<string, { content: string; role: string }[]>();
    for (const m of messageMatches ?? []) {
      if (!snippetsByConv.has(m.conversation_id)) {
        snippetsByConv.set(m.conversation_id, []);
      }
      const arr = snippetsByConv.get(m.conversation_id)!;
      if (arr.length < 3) {
        const idx = m.content.toLowerCase().indexOf(q.toLowerCase());
        const start = Math.max(0, idx - 40);
        const end = Math.min(m.content.length, idx + q.length + 40);
        const snippet =
          (start > 0 ? "…" : "") +
          m.content.slice(start, end) +
          (end < m.content.length ? "…" : "");
        arr.push({ content: snippet, role: m.role });
      }
    }

    const results = allConvs.map((conv) => ({
      ...conv,
      titleMatch: conv.title.toLowerCase().includes(q.toLowerCase()),
      messageSnippets: snippetsByConv.get(conv.id) ?? [],
    }));

    results.sort((a, b) => {
      if (a.titleMatch && !b.titleMatch) return -1;
      if (!a.titleMatch && b.titleMatch) return 1;
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });

    return res.json(results);
  } catch (err) {
    console.error("[ai-chat] search error:", err);
    return res.status(500).json({ error: "Search failed" });
  }
});

router.get("/conversations", async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from("ai_conversations")
      .select("id, title, vertical_id, created_at, updated_at")
      .order("updated_at", { ascending: false })
      .limit(50);

    if (error) return res.status(500).json({ error: error.message });
    return res.json(data ?? []);
  } catch {
    return res.status(500).json({ error: "Failed to fetch conversations" });
  }
});

router.post("/conversations", async (req: Request, res: Response) => {
  try {
    const { title = "New Chat", verticalId } = req.body as {
      title?: string;
      verticalId?: string;
    };
    const { data, error } = await supabase
      .from("ai_conversations")
      .insert({ title, vertical_id: verticalId ?? null })
      .select("id, title, vertical_id, created_at, updated_at")
      .single();

    if (error || !data) return res.status(500).json({ error: "Failed to create conversation" });
    return res.json(data);
  } catch {
    return res.status(500).json({ error: "Failed to create conversation" });
  }
});

router.get("/conversations/:id/messages", async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from("ai_messages")
      .select("id, role, content, created_at")
      .eq("conversation_id", req.params.id)
      .order("created_at", { ascending: true });

    if (error) return res.status(500).json({ error: error.message });
    return res.json(data ?? []);
  } catch {
    return res.status(500).json({ error: "Failed to fetch messages" });
  }
});

router.patch("/conversations/:id", async (req: Request, res: Response) => {
  try {
    const { title } = req.body as { title?: string };
    if (!title || !title.trim()) return res.status(400).json({ error: "title required" });

    const { data, error } = await supabase
      .from("ai_conversations")
      .update({ title: title.trim(), updated_at: new Date().toISOString() })
      .eq("id", req.params.id)
      .select("id, title, vertical_id, created_at, updated_at")
      .single();

    if (error) return res.status(500).json({ error: error.message });
    if (!data) return res.status(404).json({ error: "Conversation not found" });
    return res.json(data);
  } catch {
    return res.status(500).json({ error: "Failed to rename conversation" });
  }
});

router.delete("/conversations/:id", async (req: Request, res: Response) => {
  try {
    const { error } = await supabase
      .from("ai_conversations")
      .delete()
      .eq("id", req.params.id);

    if (error) return res.status(500).json({ error: error.message });
    return res.json({ ok: true });
  } catch {
    return res.status(500).json({ error: "Failed to delete conversation" });
  }
});

router.post("/upload", upload.single("file"), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    const conversationId = req.body.conversationId as string;

    if (!file) return res.status(400).json({ error: "No file provided" });
    if (!conversationId) return res.status(400).json({ error: "conversationId required" });

    const { data: convCheck } = await supabase
      .from("ai_conversations")
      .select("id")
      .eq("id", conversationId)
      .single();

    if (!convCheck) {
      const { error: createErr } = await supabase
        .from("ai_conversations")
        .insert({ id: conversationId, title: "New Chat" });
      if (createErr) {
        console.error("[ai-chat] Failed to create conversation for upload:", createErr.message);
        return res.status(500).json({ error: "Failed to create conversation for upload" });
      }
    }

    const base64Data = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;

    const { data, error } = await supabase
      .from("ai_attachments")
      .insert({
        conversation_id: conversationId,
        filename: file.originalname,
        file_data: base64Data,
        file_size: file.size,
        mime_type: file.mimetype,
      })
      .select("id, filename, file_size, mime_type, created_at")
      .single();

    if (error) {
      console.error("[ai-chat] Upload insert error:", error.message, error.details);
      return res.status(500).json({ error: `Failed to upload file: ${error.message}` });
    }
    if (!data) return res.status(500).json({ error: "Failed to upload file: no data returned" });

    console.log(`[ai-chat] File uploaded: ${file.originalname} (${file.size} bytes) -> ${data.id}`);
    return res.json(data);
  } catch (err) {
    console.error("[ai-chat] Upload exception:", err);
    return res.status(500).json({ error: "Failed to upload file" });
  }
});

router.get("/conversations/:id/attachments", async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from("ai_attachments")
      .select("id, filename, file_size, mime_type, created_at")
      .eq("conversation_id", req.params.id)
      .order("created_at", { ascending: true });

    if (error) return res.status(500).json({ error: error.message });
    return res.json(data ?? []);
  } catch {
    return res.status(500).json({ error: "Failed to fetch attachments" });
  }
});

router.get("/attachments/:id/download", async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from("ai_attachments")
      .select("filename, file_data, mime_type")
      .eq("id", req.params.id)
      .single();

    if (error) {
      console.error("[ai-chat] Attachment download error:", error.message);
      return res.status(404).json({ error: "Attachment not found" });
    }
    if (!data) return res.status(404).json({ error: "Attachment not found" });

    const fileData = data.file_data as string;
    if (!fileData) {
      return res.status(500).json({ error: "Attachment has no file data" });
    }

    const base64Match = fileData.match(/^data:[^;]+;base64,(.+)$/);
    if (!base64Match) return res.status(500).json({ error: "Invalid file data format" });

    const buffer = Buffer.from(base64Match[1], "base64");
    const filename = (data.filename as string).replace(/[^\w.\-]/g, "_");
    res.setHeader("Content-Type", data.mime_type as string);
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", buffer.length.toString());
    return res.send(buffer);
  } catch (err) {
    console.error("[ai-chat] Download exception:", err);
    return res.status(500).json({ error: "Failed to download attachment" });
  }
});

router.delete("/attachments/:id", async (req: Request, res: Response) => {
  try {
    const { error } = await supabase
      .from("ai_attachments")
      .delete()
      .eq("id", req.params.id);

    if (error) return res.status(500).json({ error: error.message });
    return res.json({ ok: true });
  } catch {
    return res.status(500).json({ error: "Failed to delete attachment" });
  }
});

export { router as aiChatRouter };
