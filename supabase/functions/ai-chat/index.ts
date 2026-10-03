// Supabase Edge Function: ai-chat
// Secure LLM Tool Loop with Tenant Isolation and Budget Rate Limiting

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.48.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LLM_BASE_URL = Deno.env.get('LLM_BASE_URL') || 'https://api.openai.com/v1';
const LLM_API_KEY = Deno.env.get('LLM_API_KEY') || '';
const LLM_MODEL = Deno.env.get('LLM_MODEL') || 'gpt-4o-mini';

const CLIENT_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'search_services',
      description: 'Find services in the nail studio catalog by keyword or category',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search keyword (e.g. manicure, pedicure, gel polish, design)' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'check_available_slots',
      description: 'Check available appointment slots for a service on a given date',
      parameters: {
        type: 'object',
        properties: {
          service_id: { type: 'string', description: 'Service UUID' },
          date: { type: 'string', description: 'Target date in YYYY-MM-DD format' },
          master_id: { type: 'string', description: 'Optional master UUID' },
        },
        required: ['service_id', 'date'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_studio_info',
      description: 'Get studio working hours, address, phone number and amenities',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { tenant_slug, message, history = [], is_owner = false } = await req.json();

    if (!tenant_slug || !message) {
      return new Response(JSON.stringify({ error: 'Missing tenant_slug or message' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Fetch Tenant
    const { data: tenant, error: tErr } = await supabase
      .from('tenants')
      .select('*')
      .eq('slug', tenant_slug)
      .eq('is_active', true)
      .single();

    if (tErr || !tenant) {
      return new Response(JSON.stringify({ error: 'Tenant not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2. Budget Counter check in rate_limit_usage
    const monthKey = `llm_budget_${new Date().toISOString().slice(0, 7)}`;
    const { data: usageData } = await supabase
      .from('rate_limit_usage')
      .select('counter')
      .eq('tenant_id', tenant.id)
      .eq('key', monthKey)
      .maybeSingle();

    if (usageData && usageData.counter > 500000) {
      // Monthly token budget limit reached
      return new Response(
        JSON.stringify({
          reply: 'Месячный лимит запросов к ассистенту исчерпан. Пожалуйста, используйте обычную форму записи на странице.',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Fallback if LLM API Key is not set
    if (!LLM_API_KEY) {
      return new Response(
        JSON.stringify({
          reply: `Добро пожаловать в ${tenant.name}! Наш AI-шлюз работает в автономном режиме. Вы можете выбрать услугу из каталога и оформить запись на странице студии.`,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4. Build System Prompt with explicit instructions
    const systemPrompt = `You are an elegant, polite, and helpful AI concierge for ${tenant.name}.
Address: ${tenant.address}. Phone: ${tenant.phone}.
Instructions: ${tenant.instructions || 'Complimentary coffee & tea available.'}
Rules:
1. Only recommend services and masters that actually belong to this studio.
2. When answering about available times or prices, call the appropriate tool.
3. Be concise, friendly, and speak Russian.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-6),
      { role: 'user', content: message },
    ];

    // 5. Tool Loop (max 3 steps)
    let stepCount = 0;
    let finalReply = '';

    while (stepCount < 3) {
      stepCount++;

      const llmRes = await fetch(`${LLM_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${LLM_API_KEY}`,
        },
        body: JSON.stringify({
          model: LLM_MODEL,
          messages,
          tools: CLIENT_TOOLS,
          temperature: 0.3,
        }),
      });

      if (!llmRes.ok) {
        throw new Error(`LLM provider error: ${llmRes.statusText}`);
      }

      const llmJson = await llmRes.json();
      const choice = llmJson.choices?.[0];
      const assistantMessage = choice?.message;

      if (!assistantMessage) break;
      messages.push(assistantMessage);

      if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
        // Execute tool calls on server
        for (const toolCall of assistantMessage.tool_calls) {
          const fnName = toolCall.function.name;
          const args = JSON.parse(toolCall.function.arguments || '{}');
          let toolResult = {};

          if (fnName === 'search_services') {
            const { data: services } = await supabase
              .from('services')
              .select('id, name, price, duration_min, description')
              .eq('tenant_id', tenant.id)
              .eq('is_active', true);
            toolResult = { services: services || [] };
          } else if (fnName === 'check_available_slots') {
            const { data: slots } = await supabase.rpc('get_available_slots', {
              p_tenant_slug: tenant.slug,
              p_service_id: args.service_id,
              p_option_ids: [],
              p_master_id: args.master_id || null,
              p_date: args.date,
            });
            toolResult = { available_slots: slots || [] };
          } else if (fnName === 'get_studio_info') {
            toolResult = {
              name: tenant.name,
              address: tenant.address,
              phone: tenant.phone,
              instructions: tenant.instructions,
            };
          }

          messages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify(toolResult),
          });
        }
      } else {
        finalReply = assistantMessage.content || '';
        break;
      }
    }

    // Increment budget counter
    await supabase.rpc('increment_rate_limit', {
      p_tenant_id: tenant.id,
      p_key: monthKey,
      p_amount: 1,
    }).catch(() => null);

    return new Response(JSON.stringify({ reply: finalReply }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
