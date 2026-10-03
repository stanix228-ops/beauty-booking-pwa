import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';
import { TENANTS_REGISTRY } from '../src/data/tenants';

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// Rate limiting cache (IP -> { count, resetAt })
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Basic rate limiter: max 10 requests per minute per IP
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const rl = rateLimitMap.get(clientIp);

  if (rl && rl.resetAt > now) {
    if (rl.count >= 10) {
      return res.status(429).json({ error: 'Слишком много обращений. Пожалуйста, подождите минуту.' });
    }
    rl.count += 1;
  } else {
    rateLimitMap.set(clientIp, { count: 1, resetAt: now + 60 * 1000 });
  }

  const { tenantSlug, message } = req.body || {};
  if (!tenantSlug || !message) {
    return res.status(400).json({ error: 'Missing tenantSlug or message' });
  }

  const tenant = TENANTS_REGISTRY[tenantSlug];
  if (!tenant) {
    return res.status(404).json({ error: `Tenant ${tenantSlug} not found` });
  }

  // If no OpenAI key configured on server, return deterministic data
  if (!openai) {
    return res.status(200).json({
      reply: `Студия «${tenant.name}»: адрес ${tenant.address}, телефон ${tenant.phone}. Для бронирования выберите услугу в форме онлайн-записи.`,
    });
  }

  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

  const systemPrompt = `Вы — вежливый и профессиональный AI-консьерж студии красоты «${tenant.name}».
Строгие правила:
1. Вы отвечаете ТОЛЬКО по реальным данным этой студии (услуги, мастера, свободные слоты, адрес).
2. Никогда не придумывайте цены, услуги или свободные окна. Если данных недостаточно, вежливо уточните у клиента.
3. Никогда не раскрывайте базу клиентов или чужие записи.
4. Отвечайте лаконично, заботливо и доброжелательно на русском языке.

Данные студии:
- Адрес: ${tenant.address}, г. ${tenant.city}
- Телефон: ${tenant.phone}
- Часы работы: ежедневно 10:00 - 22:00
- Услуги и цены:
${tenant.services.map((s) => `  • ${s.name}: ${s.price} руб. (${s.durationMin} мин)`).join('\n')}
- Мастера:
${tenant.masters.map((m) => `  • ${m.name} (${m.title})`).join('\n')}
`;

  try {
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: String(message) },
      ],
      max_tokens: 350,
      temperature: 0.3,
    });

    const reply = completion.choices[0]?.message?.content || 'Чем могу вам помочь по услугам студии?';
    return res.status(200).json({ reply });
  } catch (err: any) {
    console.error('OpenAI Error:', err);
    return res.status(500).json({ error: 'Assistant service temporarily unavailable' });
  }
}
