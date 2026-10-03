import { useState, useRef, useEffect } from 'react';
import { useTenant } from '../context/TenantContext';
import { BookingEngine } from '../lib/booking-store';
import { Sparkles, X, Send, Bot, User } from 'lucide-react';
import { Drawer } from 'vaul';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

export function AIAssistantWidget() {
  const { tenant } = useTenant();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Здравствуйте! Я ваш бьюти-ассистент. Могу рассказать о наших процедурах маникюра, подобрать мастера или найти удобное свободное окошко. Чем могу помочь?',
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

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isTyping) return;

    const userText = inputValue.trim();
    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // Call AI service or execute tool loop fallback
    try {
      const lower = userText.toLowerCase();
      let reply = '';

      // Local intelligent intent processing (Server tool execution simulation)
      if (lower.includes('цен') || lower.includes('стоим') || lower.includes('сколько')) {
        const serviceList = tenant.services
          .map((s) => `• ${s.name}: ${s.price} ₽ (${s.durationMin} мин)`)
          .join('\n');
        reply = `Вот наш актуальный прайс на услуги:\n${serviceList}\n\nВы можете выбрать любую из них прямо на странице!`;
      } else if (lower.includes('свободн') || lower.includes('окошк') || lower.includes('время') || lower.includes('запис')) {
        const todayStr = new Date().toISOString().split('T')[0];
        const s = tenant.services[0];
        const slots = await BookingEngine.getAvailableSlots(tenant.slug, s.id, [], null, todayStr);
        if (slots.length > 0) {
          const sampleTimes = slots.slice(0, 4).map((sl) => sl.time).join(', ');
          reply = `На сегодня на услугу «${s.name}» есть свободные окна: ${sampleTimes}. Нажмите «Выбрать время» на карточке услуги для брони!`;
        } else {
          reply = `На сегодня все окна заняты. Но вы можете выбрать завтрашний или последующие дни в календаре!`;
        }
      } else if (lower.includes('мастер') || lower.includes('кто') || lower.includes('стилист')) {
        const masterList = tenant.masters
          .map((m) => `• ${m.name} — ${m.title} (рейтинг: ${m.rating} ★)`)
          .join('\n');
        reply = `В нашей студии работают первоклассные специалисты:\n${masterList}`;
      } else if (lower.includes('подготов') || lower.includes('правил') || lower.includes('аллерг') || lower.includes('кофе')) {
        reply = tenant.instructions || 'Пожалуйста, приходите за 5 минут до начала. Мы угостим вас натуральным кофе или чаем!';
      } else {
        reply = `Я могу подсказать цены на услуги, информацию о мастерах или помочь записаться на удобное время. Спросите, например: «Сколько стоит маникюр?» или «Есть ли свободные окошки сегодня?»`;
      }

      setTimeout(() => {
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
      }, 700);
    } catch {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `a-err-${Date.now()}`,
          sender: 'assistant',
          text: 'Извините, произошла временная ошибка связи с ассистентом. Вы можете выбрать услугу и записаться обычным способом на странице.',
          timestamp: new Date(),
        },
      ]);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        style={{
          backgroundColor: 'var(--tenant-card)',
          borderColor: 'var(--tenant-accent)',
        }}
        className="fixed bottom-20 right-4 z-40 p-3.5 rounded-full border shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-2 group backdrop-blur-md"
        aria-label="Открыть AI-ассистент"
      >
        <Sparkles className="w-5 h-5 animate-pulse" style={{ color: 'var(--tenant-accent)' }} />
        <span className="text-xs font-semibold text-neutral-100 pr-1 hidden sm:inline">
          AI Консьерж
        </span>
      </button>

      {/* Assistant Drawer */}
      <Drawer.Root open={isOpen} onOpenChange={setIsOpen}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 transition-opacity" />
          <Drawer.Content className="bg-neutral-900 border-t border-neutral-800 fixed bottom-0 left-0 right-0 max-h-[85vh] h-[550px] rounded-t-[28px] z-50 flex flex-col focus:outline-none">
            {/* Header */}
            <div className="p-4 border-b border-neutral-800 flex items-center justify-between max-w-lg mx-auto w-full">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center border"
                  style={{
                    backgroundColor: 'var(--tenant-card)',
                    borderColor: 'var(--tenant-accent)',
                  }}
                >
                  <Bot className="w-4 h-4" style={{ color: 'var(--tenant-accent)' }} />
                </div>
                <div>
                  <div className="text-xs font-bold text-neutral-100">
                    AI-ассистент студии
                  </div>
                  <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                    <span>Онлайн • ответит на любые вопросы</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 max-w-lg mx-auto w-full">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {m.sender === 'assistant' && (
                    <div className="w-6 h-6 rounded-lg bg-neutral-800 flex items-center justify-center flex-shrink-0 mt-0.5 border border-neutral-700">
                      <Bot className="w-3.5 h-3.5 text-neutral-300" />
                    </div>
                  )}

                  <div
                    style={{
                      backgroundColor: m.sender === 'user' ? 'var(--tenant-accent)' : '#181822',
                      color: m.sender === 'user' ? '#0D0D11' : '#F3F4F6',
                    }}
                    className={`p-3 rounded-2xl text-xs max-w-[80%] whitespace-pre-wrap leading-relaxed shadow-sm ${
                      m.sender === 'user' ? 'font-medium rounded-tr-sm' : 'border border-neutral-800 rounded-tl-sm'
                    }`}
                  >
                    {m.text}
                  </div>

                  {m.sender === 'user' && (
                    <div className="w-6 h-6 rounded-lg bg-neutral-800 flex items-center justify-center flex-shrink-0 mt-0.5 border border-neutral-700">
                      <User className="w-3.5 h-3.5 text-neutral-300" />
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-1.5 text-xs text-neutral-400 pl-8">
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-500 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-500 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-500 animate-bounce [animation-delay:0.4s]" />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input bar */}
            <form
              onSubmit={handleSend}
              className="p-3 border-t border-neutral-800 bg-neutral-950/80 safe-bottom max-w-lg mx-auto w-full flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Задайте вопрос о процедурах, ценах..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-1 h-11 px-3.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-amber-400/80"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isTyping}
                style={{
                  backgroundColor: 'var(--tenant-accent)',
                  color: '#0D0D11',
                }}
                className="w-11 h-11 rounded-xl flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-md hover:brightness-105 active:scale-95 transition-all flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </>
  );
}
