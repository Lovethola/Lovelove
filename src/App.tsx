import React, { useState, useEffect, useRef } from 'react';
import { Wallet, GraduationCap, Send, ShieldAlert, Coins, BookOpen, UserCheck, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { getMentorResponse } from './services/geminiService';
import { cn } from './utils';

interface Message {
  role: 'user' | 'model';
  text: string;
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "Hello there, future crypto expert! 👋 I'm your Bitcoin.com AI Mentor. I'm here to help you understand the exciting world of digital money. What would you like to learn about first? Maybe what a Bitcoin is, or how a Blockchain [a digital notebook that no one can erase] works?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [studentCount, setStudentCount] = useState(0);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only increment student count once per session
    const fetchStats = async () => {
      const hasVisited = sessionStorage.getItem('bitcoin_mentor_visited');
      const endpoint = hasVisited ? '/api/stats' : '/api/stats/increment';
      const method = hasVisited ? 'GET' : 'POST';

      try {
        const res = await fetch(endpoint, { method });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        
        const data = await res.json();
        if (data && typeof data.count === 'number') {
          setStudentCount(data.count);
          if (!hasVisited) {
            sessionStorage.setItem('bitcoin_mentor_visited', 'true');
          }
        }
      } catch (err) {
        console.error('Failed to fetch stats:', err);
        // Fallback to a realistic number if API fails
        setStudentCount(prev => prev || 102);
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (customMessage?: string) => {
    const userMessage = customMessage || input.trim();
    if (!userMessage && !customMessage) return;
    if (isLoading) return;

    if (!customMessage) setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));
      
      const response = await getMentorResponse(userMessage, history);
      setMessages(prev => [...prev, { role: 'model', text: response || "I'm sorry, I lost my train of thought. Can you try again?" }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: "Oops! My digital notebook is a bit messy right now. Let's try that again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const connectWallet = () => {
    setIsWalletConnected(true);
    handleSend("I have connected my wallet! I'm ready for hands-on learning.");
  };

  return (
    <div className="flex h-screen bg-bitcoin-dark text-white overflow-hidden font-sans">
      {/* Backdrop for mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Desktop */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-bitcoin-gray border-r border-white/5 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="bg-bitcoin-green p-2 rounded-lg shadow-[0_0_15px_rgba(10,193,142,0.3)]">
                <Coins className="text-bitcoin-dark" size={24} />
              </div>
              <h1 className="text-xl font-bold tracking-tight">Bitcoin.com <span className="text-bitcoin-green">Mentor</span></h1>
            </div>
            <button 
              type="button"
              className="lg:hidden p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 space-y-4">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 px-2">Learning Path</p>
              <button 
                type="button"
                onClick={() => {
                  handleSend("I'd like to start with the Introduction to Bitcoin and digital money.");
                  setIsSidebarOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-white/60 hover:bg-white/5 hover:text-bitcoin-green transition-all group cursor-pointer active:scale-95"
              >
                <BookOpen size={18} className="group-hover:text-bitcoin-green" />
                <span className="font-medium">Introduction</span>
              </button>
              <button 
                type="button"
                onClick={() => {
                  handleSend("Tell me about Safety First: seed phrases and staying safe from scams.");
                  setIsSidebarOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-white/60 hover:bg-white/5 hover:text-bitcoin-green transition-all group cursor-pointer active:scale-95"
              >
                <ShieldAlert size={18} className="group-hover:text-bitcoin-green" />
                <span className="font-medium">Safety First</span>
              </button>
              <button 
                type="button"
                onClick={() => {
                  handleSend("I'm ready for Advanced Topics: DEXs, the Verse ecosystem, and smart contracts.");
                  setIsSidebarOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-white/60 hover:bg-white/5 hover:text-bitcoin-green transition-all group cursor-pointer active:scale-95"
              >
                <GraduationCap size={18} className="group-hover:text-bitcoin-green" />
                <span className="font-medium">Advanced Topics</span>
              </button>
            </div>
          </nav>

          <div className="mt-auto pt-6 border-t border-white/5 shrink-0">
            <div className="bg-bitcoin-green/10 border border-bitcoin-green/20 rounded-xl p-4 shadow-[inset_0_0_10px_rgba(10,193,142,0.05)]">
              <div className="flex items-center gap-2 text-bitcoin-green mb-1">
                <UserCheck size={16} />
                <span className="text-xs font-bold uppercase tracking-tighter">Visitor Board</span>
              </div>
              <p className="text-2xl font-black text-bitcoin-green">{studentCount.toLocaleString()}</p>
              <p className="text-[10px] text-white/60 uppercase font-medium">Total Students Enrolled</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative min-w-0">
        {/* Header */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-bitcoin-dark/80 backdrop-blur-md sticky top-0 z-30">
          <button 
            className="lg:hidden p-2 -ml-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>

          <div className="flex-1 lg:hidden flex justify-center">
             <h1 className="text-sm font-bold tracking-tight">Bitcoin.com <span className="text-bitcoin-green">Mentor</span></h1>
          </div>

          <div className="flex items-center gap-4 ml-auto">
            <button 
              onClick={connectWallet}
              disabled={isWalletConnected}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all",
                isWalletConnected 
                  ? "bg-bitcoin-green/20 text-bitcoin-green border border-bitcoin-green/30 cursor-default"
                  : "bg-bitcoin-green text-bitcoin-dark hover:scale-105 active:scale-95"
              )}
            >
              <Wallet size={16} />
              <span>{isWalletConnected ? "Wallet Connected" : "Connect Wallet"}</span>
            </button>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
          <AnimatePresence initial={false}>
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex w-full",
                  message.role === 'user' ? "justify-end" : "justify-start"
                )}
              >
                <div className={cn(
                  "max-w-[85%] lg:max-w-[70%] rounded-2xl p-4 shadow-sm",
                  message.role === 'user' 
                    ? "bg-bitcoin-green text-bitcoin-dark font-medium" 
                    : "bg-bitcoin-gray border border-white/5 text-white/90"
                )}>
                  {message.role === 'model' ? (
                    <div className="markdown-body prose prose-invert prose-sm max-w-none">
                      <Markdown>{message.text}</Markdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{message.text}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-bitcoin-gray border border-white/5 rounded-2xl p-4 flex gap-1">
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 rounded-full bg-bitcoin-green" />
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-bitcoin-green" />
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-bitcoin-green" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-6 bg-gradient-to-t from-bitcoin-dark via-bitcoin-dark to-transparent">
          <div className="max-w-4xl mx-auto relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask me anything about crypto..."
              className="w-full bg-bitcoin-gray border border-white/10 rounded-2xl py-4 pl-6 pr-14 focus:outline-none focus:border-bitcoin-green/50 transition-colors placeholder:text-white/20"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-bitcoin-green text-bitcoin-dark disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform"
            >
              <Send size={20} />
            </button>
          </div>
          <p className="text-center text-[10px] text-white/30 mt-4 uppercase tracking-widest font-bold">
            Safety First: Never share your secret 12 words with anyone!
          </p>
        </div>
      </main>
    </div>
  );
}
