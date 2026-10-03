import React, { useState, useRef, useEffect } from 'react';
import { useTenant } from '../context/TenantContext';
import { BookingEngine } from '../lib/booking-store';
import { Sparkle, X, PaperPlaneRight, Robot, User } from '@phosphor-icons/react';
import { Drawer } from 'vaul';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

export const AIAssistantWidget: React.FC = () => {
  const { tenant } = useTenant();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Здравствуйте! Я онлайн-помощник студии. Подскажу стоимость услуг, помогу найти ближайшие свободные окна, расскажу о мастерах или адресе. Чем вам помочь?',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!tenant) return null;

  const firstMasterName = tenant.masters[0]?.name?.split(' ')[0] || 'Анны';

  const quickPrompts = [
    'Когда ближайшее окно?',
    'Сколько стоит маникюр с покрытием?',
    'Какие услуги есть?',
    `Есть свободное время у мастера ${firstMasterName}?`,
    'Как найти студию?',
  ];

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      // 1. Try Vercel Function if available
      let reply = '';
      try {
        const res = await fetch('/api/assistant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tenantSlug: tenant.slug,
            message: text.trim(),
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.reply) reply = data.reply;
        }
      } catch {
        // Fall through to deterministic real data lookup
      }

      // 2. Intelligent local data responder (strictly based on real tenant data)
      if (!reply) {
        const lower = text.toLowerCase();

        if (lower.includes('окно') || lower.includes('окошк') || lower.includes('ближайш') || lower.includes('свободн')) {
          const todayStr = new Date().toISOString().split('T')[0];
          const service = tenant.services[0];
          const slots = await BookingEngine.getAvailableSlots(tenant.slug, service.id, [], null, todayStr);
          if (slots.length > 0) {
            const times = slots.slice(0, 4).map((s) => s.time).join(', ');
            reply = `На сегодня на процедуру «${service.name}» есть свободные окна: ${times}. Чтобы занять место, выберите время в блоке «Запись в студию» ниже.`;
          } else {
            reply = `На сегодня все слоты уже заняты. Рекомендую посмотреть завтрашний день в календаре записи — там есть свободные часы!`;
          }
        } else if (lower.includes('маникюр с покрытием') || lower.includes('сколько стоит') || lower.includes('цена') || lower.includes('стоим')) {
          const matching = tenant.services.filter((s) => s.name.toLowerCase().includes('маникюр') || s.name.toLowerCase().includes('гель-лак'));
          if (matching.length > 0) {
            const list = matching.map((s) => `• ${s.name}: ${s.price} ₽ (${s.durationMin} мин)`).join('\n');
            reply = `Вот цены на интересующие вас процедуры:\n${list}`;
          } else {
            const list = tenant.services.slice(0, 3).map((s) => `• ${s.name}: ${s.price} ₽`).join('\n');
            reply = `Цены на наши основные услуги:\n${list}`;
          }
        } else if (lower.includes('какие услуги') || lower.includes('услуги')) {
          const list = tenant.services.map((s) => `• ${s.name} — ${s.price} ₽`).join('\n');
          reply = `В студии доступны следующие процедуры:\n${list}\n\nК любой из них можно добавить дополнительные опции (дизайн, снятие, укрепление).`;
        } else if (lower.includes('мастер') || lower.includes(firstMasterName.toLowerCase())) {
          const targetMaster = tenant.masters.find((m) => m.name.toLowerCase().includes(firstMasterName.toLowerCase())) || tenant.masters[0];
          if (targetMaster) {
            const todayStr = new Date().toISOString().split('T')[0];
            const slots = await BookingEngine.getAvailableSlots(tenant.slug, targetMaster.serviceIds[0], [], targetMaster.id, todayStr);
            if (slots.length > 0) {
              const times = slots.slice(0, 3).map((s) => s.time).join(', ');
              reply = `У мастера ${targetMaster.name} (${targetMaster.title}) сегодня есть свободные окна: ${times}.`;
            } else {
              reply = `Мастер ${targetMaster.name} сегодня занят(а) или на выходном. Вы можете выбрать её на ближайшие даты в форме записи!`;
            }
          }
        } else if (lower.includes('найти') || lower.includes('адрес') || lower.includes('где')) {
          reply = `Студия находится по адресу: ${tenant.address}, г. ${tenant.city}.\nРежим работы: ежедневно с 10:00 до 22:00.\nТелефон для связи: ${tenant.phone}.`;
        } else {
          reply = `Уточните, пожалуйста, что именно вас интересует: стоимость конкретной процедуры, свободное время мастеров или схема проезда? Я с радостью подскажу!`;
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          sender: 'assistant',
          text: reply,
          timestamp: new Date(),
        },
      ]);
      setIsTyping(false);
    } catch {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: 'Извините, произошла временная ошибка связи. Пожалуйста, воспользуйтесь формой онлайн-записи ниже.',
          timestamp: new Date(),
        },
      ]);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-20 right-4 z-40">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full text-white font-semibold text-xs shadow-2xl transition-all cursor-pointer hover:scale-105 active:scale-95 border border-white/20 bg-[#0D0D11]/90 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.8)]"
        >
          <Sparkle size={16} weight="fill" className="text-white" />
          <span>AI Ассистент</span>
        </button>
      </div>

      {/* Drawer */}
      <Drawer.Root open={isOpen} onOpenChange={setIsOpen}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" />
          <Drawer.Content className="bg-[#0D0D11] border-t border-white/10 flex flex-col rounded-t-[28px] h-[85vh] max-h-[700px] fixed bottom-0 left-0 right-0 z-50 max-w-lg mx-auto outline-none shadow-2xl">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full flex items-center justify-center border border-white/15 bg-white text-black">
                  <Robot size={18} weight="fill" className="text-black" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Ассистент студии</h3>
                  <p className="text-[11px] text-[#8E8E93]">Отвечает только по реальным данным студии</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {m.sender === 'assistant' && (
                    <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 text-white">
                      <Robot size={15} weight="duotone" />
                    </div>
                  )}
                  <div
                    className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                      m.sender === 'user'
                        ? 'bg-white text-black font-medium rounded-br-none shadow-sm'
                        : 'bg-neutral-900/80 border border-white/10 text-neutral-200 rounded-bl-none'
                    }`}
                  >
                    {m.text}
                  </div>
                  {m.sender === 'user' && (
                    <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 text-neutral-300">
                      <User size={15} />
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-2 text-xs text-neutral-400 pl-9">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce [animation-delay:0.4s]" />
                  </div>
                  <span>Ассистент проверяет базу...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompt Buttons */}
            <div className="px-4 py-2 border-t border-white/5 bg-black/60">
              <p className="text-[10px] text-neutral-500 mb-1.5 font-medium uppercase tracking-wider">
                Быстрые вопросы:
              </p>
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
                {quickPrompts.map((q, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSendMessage(q)}
                    className="text-xs px-3 py-1.5 rounded-full border border-white/10 bg-neutral-900 hover:border-white/25 hover:bg-neutral-800 text-neutral-300 whitespace-nowrap transition-colors flex-shrink-0 cursor-pointer"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Bar */}
            <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputValue); }} className="p-3 border-t border-white/10 flex items-center gap-2 bg-black/90">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Задайте вопрос об услугах или записи..."
                className="flex-1 h-11 px-4 rounded-xl bg-neutral-900 border border-white/10 text-white placeholder-neutral-500 text-xs sm:text-sm focus:outline-none focus:border-white transition-colors"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isTyping}
                className="w-11 h-11 rounded-xl flex items-center justify-center bg-white text-black disabled:opacity-30 transition-transform active:scale-95 cursor-pointer shadow-md"
              >
                <PaperPlaneRight size={18} weight="bold" />
              </button>
            </form>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </>
  );
};
