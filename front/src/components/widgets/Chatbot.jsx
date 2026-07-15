import { useEffect, useRef, useState } from 'react';
import { Bot, MessageSquare, ShieldCheck, X } from 'lucide-react';
import { chatFlows } from '../../data/chatFlows.js';
import { useModal } from '../../context/ModalContext.jsx';
import { fetchSettings } from '../../services/api.js';

// Convertit **texte** en <strong>texte</strong>.
const formatBold = (text) => text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

export default function Chatbot() {
  const { openSoftware, openExpert } = useModal();
  const [open, setOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [messages, setMessages] = useState([]); // { type: 'bot'|'user', content }
  const [options, setOptions] = useState([]);
  const [typing, setTyping] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    fetchSettings().then(setSettings).catch(() => {});
  }, []);

  const messagesRef = useRef(null);
  const timers = useRef([]);

  // Nettoie les timers au demontage.
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // Bulle d'accroche apres 3s si le chat n'a pas ete ouvert.
  useEffect(() => {
    const t1 = setTimeout(() => {
      if (!initialized && !open) {
        setShowTooltip(true);
        const t2 = setTimeout(() => setShowTooltip(false), 8000);
        timers.current.push(t2);
      }
    }, 3000);
    timers.current.push(t1);
    return () => clearTimeout(t1);
  }, [initialized, open]);

  // Auto-scroll vers le bas.
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages, options, typing]);

  const renderStep = (stepKey) => {
    const step = chatFlows[stepKey];
    if (!step) return;

    setOptions([]);
    setTyping(true);
    const t = setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, { type: 'bot', content: step.msg }]);
      setOptions(step.options || []);
    }, 800);
    timers.current.push(t);
  };

  const startChat = () => {
    setMessages([]);
    setOptions([]);
    // Use DB welcome message if available, else start with the flow's start message
    if (settings?.chatbot_welcome_msg) {
      setMessages([{ type: 'bot', content: settings.chatbot_welcome_msg }]);
      // We can then render the start options after a small delay
      setTimeout(() => {
        setOptions(chatFlows['start']?.options || []);
      }, 500);
    } else {
      renderStep('start');
    }
  };

  const executeAction = (opt) => {
    setOpen(false);
    if (opt.action === 'open_expert') {
      openExpert();
    } else if (opt.action === 'open_modal' && opt.target) {
      openSoftware(opt.target);
    }
  };

  const handleOption = (opt) => {
    setMessages((m) => [...m, { type: 'user', content: opt.text }]);
    setOptions([]);

    if (opt.next) {
      renderStep(opt.next);
    } else if (opt.action) {
      const t1 = setTimeout(() => {
        setMessages((m) => [
          ...m,
          {
            type: 'bot',
            content:
              "Ouverture en cours... N'hésitez pas à me solliciter de nouveau si vous avez d'autres questions !",
          },
        ]);
        const t2 = setTimeout(() => executeAction(opt), 1800);
        timers.current.push(t2);
      }, 600);
      timers.current.push(t1);
    }
  };

  const toggleChat = () => {
    setShowTooltip(false);
    setOpen((prev) => {
      const next = !prev;
      if (next && !initialized) {
        setInitialized(true);
        startChat();
      }
      return next;
    });
  };

  if (settings && !settings.chatbot_is_active) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {showTooltip && (
        <button
          type="button"
          onClick={toggleChat}
          className="absolute bottom-20 right-0 bg-white text-ziv-navy text-sm p-4 rounded-2xl shadow-2xl border border-gray-100 mb-2 w-64 text-left cursor-pointer"
        >
          <div className="flex items-start">
            <div className="w-10 h-10 rounded-full bg-ziv-cyan flex items-center justify-center mr-3 flex-shrink-0 animate-pulse shadow-md">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm mb-0.5">Besoin d'aide ?</p>
              <p className="text-xs text-gray-500 leading-tight">
                {settings?.chatbot_tooltip_msg || 'Laissez-moi vous guider vers le bon logiciel immobilier.'}
              </p>
            </div>
          </div>
          <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white transform rotate-45 border-b border-r border-gray-100" />
        </button>
      )}

      {open && (
        <div className="w-80 sm:w-[24rem] bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden mb-4 flex flex-col h-[32rem]">
          <div className="bg-gradient-to-r from-ziv-navy to-ziv-blue text-white p-4 flex justify-between items-center flex-shrink-0 z-10 shadow-sm">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mr-3 backdrop-blur-sm border border-white/30 relative">
                <Bot className="h-6 w-6 text-white" />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-ziv-navy rounded-full" />
              </div>
              <div>
                <h4 className="font-bold text-sm">ZIV Guide Interactif</h4>
                <p className="text-xs text-cyan-200">Expertise B2B</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-white/70 hover:text-white transition-colors bg-white/10 rounded-full p-1.5"
              aria-label="Fermer le chat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div ref={messagesRef} className="p-4 flex-grow overflow-y-auto bg-gray-50 flex flex-col pb-6">
            {messages.map((msg, i) =>
              msg.type === 'bot' ? (
                <div key={i} className="flex items-start mt-4">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-ziv-cyan to-blue-500 flex items-center justify-center mr-3 flex-shrink-0 shadow-md">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div
                    className="bg-white p-3.5 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm text-[13px] sm:text-sm text-gray-700 leading-relaxed max-w-[80%]"
                    dangerouslySetInnerHTML={{ __html: formatBold(msg.content) }}
                  />
                </div>
              ) : (
                <div key={i} className="flex items-start justify-end mt-4 mb-2">
                  <div className="bg-ziv-navy text-white p-3 rounded-2xl rounded-tr-none shadow-md text-[13px] sm:text-sm leading-relaxed max-w-[80%]">
                    {msg.content}
                  </div>
                </div>
              )
            )}

            {typing && (
              <div className="flex items-start mt-4">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-ziv-cyan to-blue-500 flex items-center justify-center mr-3 flex-shrink-0 shadow-md">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="bg-white p-3.5 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm">
                  <div className="flex space-x-1.5 items-center h-4 px-1">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            )}

            {options.length > 0 && (
              <div className="flex flex-col space-y-2.5 mt-3 ml-12 max-w-[85%] pb-2">
                {options.map((opt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleOption(opt)}
                    className="text-left px-4 py-2.5 bg-white border border-ziv-cyan text-ziv-cyan text-sm font-medium rounded-xl hover:bg-ziv-cyan hover:text-white transition-all shadow-sm transform hover:-translate-y-0.5"
                  >
                    {opt.text}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="p-3 bg-white border-t border-gray-100 flex items-center justify-center flex-shrink-0 text-center">
            <p className="text-[11px] text-gray-400 flex items-center font-medium">
              <ShieldCheck className="h-3 w-3 mr-1" /> Réponses générées par votre assistant B2B
            </p>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={toggleChat}
        className="bg-ziv-navy text-white p-4 rounded-full shadow-2xl hover:bg-ziv-blue transition-transform transform hover:scale-110 flex items-center justify-center relative border border-white/10"
        aria-label="Ouvrir le chat"
      >
        <MessageSquare className="h-6 w-6" />
        <span className="absolute top-0 right-0 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ziv-cyan opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-ziv-cyan border-2 border-ziv-navy" />
        </span>
      </button>
    </div>
  );
}
