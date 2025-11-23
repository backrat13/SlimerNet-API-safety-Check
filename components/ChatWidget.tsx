import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot } from 'lucide-react';
import { ChatMessage } from '../types';
import { chatWithSlimer } from '../services/geminiService';

interface ChatWidgetProps {
  contextData: string; // JSON string of current processes
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ contextData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init',
      role: 'model',
      text: "Greetings! I am Slimer, your network ghost. I see everything... suspicious or safe. Ask me anything!",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Prepare minimal history for the stateless call
    const history = messages.map(m => ({ role: m.role, text: m.text }));
    const responseText = await chatWithSlimer(history, input, contextData);

    const botMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, botMsg]);
    setIsLoading(false);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 bg-slimer-600 hover:bg-slimer-500 text-black rounded-full shadow-[0_0_20px_rgba(132,204,22,0.5)] transition-all hover:scale-110 z-50 group"
      >
        <Bot className="w-8 h-8 animate-ooze" />
        <span className="absolute -top-12 right-0 bg-slimer-900 text-slimer-100 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-slimer-500">
          Talk to Slimer Agent
        </span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[500px] flex flex-col bg-slate-900 border-2 border-slimer-600 rounded-xl shadow-2xl z-50 overflow-hidden font-mono">
      {/* Header */}
      <div className="bg-slimer-700 p-3 flex justify-between items-center border-b border-slimer-500">
        <div className="flex items-center gap-2 text-black font-bold">
          <Bot className="w-5 h-5" />
          <span>SlimerNet Agent</span>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-black hover:bg-slimer-600 rounded p-1">
          <X size={18} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/90">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] p-3 rounded-lg text-sm ${
              msg.role === 'user' 
                ? 'bg-slimer-900 border border-slimer-700 text-slimer-100' 
                : 'bg-slate-800 border border-slate-600 text-gray-200'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 p-3 rounded-lg text-xs text-slimer-400 animate-pulse">
              Analyzing ectoplasm...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 bg-slate-900 border-t border-slimer-800 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask about safe APIs..."
          className="flex-1 bg-black border border-slimer-800 rounded px-3 py-2 text-sm text-slimer-200 focus:outline-none focus:border-slimer-500"
        />
        <button 
          onClick={handleSend}
          disabled={isLoading}
          className="bg-slimer-700 hover:bg-slimer-600 text-black p-2 rounded transition-colors disabled:opacity-50"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default ChatWidget;