import React, { useState, useEffect, useRef } from "react";
import { ChatMessage, Project, UserProfile, DEFAULT_AVATAR } from "../types";
import { 
  MessageSquare, 
  Send, 
  Bot, 
  Sparkles, 
  Smile, 
  Activity, 
  PlusCircle, 
  HelpCircle,
  Hash,
  Globe
} from "lucide-react";

interface CollaborationChatViewProps {
  messages: ChatMessage[];
  projects: Project[];
  users: UserProfile[];
  currentUser: UserProfile;
  onSendMessage: (channelId: string, content: string) => void;
  onToggleReaction: (messageId: string, emoji: string) => void;
}

export default function CollaborationChatView({
  messages,
  projects,
  users,
  currentUser,
  onSendMessage,
  onToggleReaction
}: CollaborationChatViewProps) {
  const [selectedChannel, setSelectedChannel] = useState<string>("global");
  const [typedMessage, setTypedMessage] = useState("");

  const [aiChatMessages, setAiChatMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([
    { role: "assistant", content: "Hello! I am your AI Scrum Master Coach. Ask me anything about Sprint grooming, story point estimation, or burndown metrics!" }
  ]);
  const [aiInput, setAiInput] = useState("");
  const [submittingAi, setSubmittingAi] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const aiMessagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedChannel]);

  useEffect(() => {
    aiMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [aiChatMessages]);

  const handleSendChannelMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim()) return;
    onSendMessage(selectedChannel, typedMessage);
    setTypedMessage("");
  };

  const handleSendAiMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim() || submittingAi) return;

    const userMsg = aiInput;
    setAiChatMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setAiInput("");
    setSubmittingAi(true);

    try {
      const response = await fetch("/api/ai/sprint-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...aiChatMessages, { role: "user", content: userMsg }],
          currentContext: {
            activeUser: currentUser.displayName,
            activeRole: currentUser.role,
            projectsCount: projects.length,
          }
        })
      });
      const data = await response.json();
      setAiChatMessages(prev => [...prev, { role: "assistant", content: data.response }]);
    } catch (err) {
      console.error(err);
      setAiChatMessages(prev => [...prev, { role: "assistant", content: "I encountered an issue connecting to the Gemini engine. Please check API key logs." }]);
    } finally {
      setSubmittingAi(false);
    }
  };

  const channelMessages = messages.filter(m => m.channelId === selectedChannel);

  const availableEmojis = ["👍", "❤️", "🚀", "🎉", "🔥", "👀"];

  return (
    <div id="collaboration-chat-root" className="grid grid-cols-1 lg:grid-cols-4 gap-3 h-[78vh]">
      
      <div className="bg-white rounded border border-slate-200 shadow-2xs p-2 flex flex-col h-full">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 px-2 py-1.5 border-b border-slate-150 mb-2 font-sans">
          Channels & Rooms
        </h3>

        <div className="space-y-1 flex-1 overflow-y-auto">
          <button
            onClick={() => setSelectedChannel("global")}
            className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-xs font-medium font-sans ${
              selectedChannel === "global"
                ? "bg-blue-600 text-white"
                : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>global-town-hall</span>
          </button>

          {projects.map(proj => {
            const chanId = proj.id;
            const shortName = proj.name.toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 20);
            
            return (
              <button
                key={proj.id}
                onClick={() => setSelectedChannel(chanId)}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-xs font-medium font-sans truncate ${
                  selectedChannel === chanId
                    ? "bg-blue-600 text-white"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <Hash className="w-3.5 h-3.5" />
                <span className="truncate">{shortName}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="lg:col-span-2 bg-white rounded border border-slate-200 shadow-2xs flex flex-col h-full overflow-hidden">
        <div className="p-3 border-b border-slate-150 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-blue-600" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-sans">
              #{selectedChannel === "global" ? "global-town-hall" : projects.find(p => p.id === selectedChannel)?.name.split(":")[0].toLowerCase().replace(/[^a-z0-9]/g, "-")}
            </h4>
          </div>
          <span className="text-[10px] text-slate-400 font-mono font-medium">Realtime streaming</span>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-3.5 bg-slate-50/50">
          {channelMessages.map((msg) => {
            const author = users.find(u => u.id === msg.userId);
            return (
              <div key={msg.id} className="flex gap-2.5 items-start">
                <img
                  src={author?.photoURL || DEFAULT_AVATAR}
                  alt={author?.displayName}
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                />
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xs font-bold text-slate-900 font-sans">{author?.displayName}</span>
                    <span className="text-[9px] text-blue-600 font-mono font-medium">{author?.role}</span>
                    <span className="text-[9px] text-slate-400 font-mono font-medium ml-1">
                      {msg.createdAt.includes("T") ? msg.createdAt.split("T")[1].slice(0, 5) : msg.createdAt}
                    </span>
                  </div>
                  <p className="text-xs text-slate-800 leading-normal font-sans bg-white p-2 rounded border border-slate-200 shadow-3xs inline-block max-w-full break-words">
                    {msg.content}
                  </p>

                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    {availableEmojis.map(emoji => {
                      const reactList = msg.reactions?.[emoji] || [];
                      const hasReacted = reactList.includes(currentUser.id);
                      
                      return (
                        <button
                          key={emoji}
                          onClick={() => onToggleReaction(msg.id, emoji)}
                          className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded border text-[10px] font-mono font-bold transition-all ${
                            hasReacted 
                              ? "bg-blue-50 text-blue-700 border-blue-200" 
                              : "bg-white text-slate-400 hover:text-slate-600 border-slate-150"
                          }`}
                        >
                          <span>{emoji}</span>
                          {reactList.length > 0 && <span>{reactList.length}</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendChannelMessage} className="p-2 border-t border-slate-200 bg-white flex gap-1.5">
          <input
            type="text"
            value={typedMessage}
            onChange={(e) => setTypedMessage(e.target.value)}
            placeholder={`Message ${selectedChannel === "global" ? "#global-town-hall" : "project channel"}...`}
            className="flex-1 bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs outline-none focus:border-blue-500 focus:bg-white"
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium flex items-center justify-center"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      <div className="bg-slate-900 text-slate-100 rounded border border-slate-850 shadow-md flex flex-col h-full overflow-hidden">
        <div className="p-3 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Bot className="w-4 h-4 text-blue-400 animate-pulse" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-sans">
              Agile Scrum Master AI
            </h4>
          </div>
          <span className="inline-flex items-center gap-0.5 text-[8px] font-mono bg-blue-500/15 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/10">
            <Sparkles className="w-2.5 h-2.5" /> 2.5 FLASH
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-2.5 space-y-3 bg-slate-950/40 scrollbar-thin">
          {aiChatMessages.map((msg, i) => (
            <div 
              key={i} 
              className={`flex flex-col space-y-0.5 ${
                msg.role === "user" ? "items-end" : "items-start"
              }`}
            >
              <div className="flex items-center gap-1 text-[9px] text-slate-400 font-mono">
                {msg.role === "assistant" && <Bot className="w-3 h-3 text-blue-400" />}
                <span>{msg.role === "user" ? "You" : "Scrum Coach AI"}</span>
              </div>
              <div 
                className={`p-2 rounded text-[11px] leading-relaxed max-w-[90%] font-sans border ${
                  msg.role === "user" 
                    ? "bg-blue-600 text-white border-blue-700 rounded-tr-none" 
                    : "bg-slate-850 text-slate-200 border-slate-800 rounded-tl-none"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {submittingAi && (
            <div className="flex items-center gap-1 text-[10px] text-blue-400 font-mono">
              <Activity className="w-3 h-3 animate-spin" /> Scrum Coach is writing response...
            </div>
          )}
          <div ref={aiMessagesEndRef} />
        </div>

        <form onSubmit={handleSendAiMessage} className="p-2 border-t border-slate-800 bg-slate-950 flex gap-1">
          <input
            type="text"
            value={aiInput}
            onChange={(e) => setAiInput(e.target.value)}
            placeholder="Ask Scrum Master Coach..."
            className="flex-1 bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-100 outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={submittingAi}
            className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:bg-slate-850 flex items-center justify-center shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

    </div>
  );
}
