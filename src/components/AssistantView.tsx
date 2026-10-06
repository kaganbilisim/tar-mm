import React, { useState, useRef, useEffect } from "react";
import { ChatMessage, HarvestRecord, PaymentRecord } from "../types";
import {
  Sparkles,
  Send,
  Bot,
  User,
  Coins,
  RefreshCw,
  HelpCircle,
  Leaf,
  ShieldAlert,
  Calendar,
  CheckCircle,
} from "lucide-react";

interface AssistantViewProps {
  harvests: HarvestRecord[];
  payments: PaymentRecord[];
  isDark: boolean;
}

export const AssistantView: React.FC<AssistantViewProps> = ({
  harvests,
  payments,
  isDark,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "m-welcome",
      sender: "assistant",
      text: "Selamlar! Ben **Tarım Cepte AI**. Karadeniz çay ve fındık tarımında şeffaf işgücü eşleştirme, budama/gübreleme takvimi ve hastalık mücadelesinde (**Belirti-Zaman Çizelgesi-Uygulama**) uzman rehberinizim.\n\nİşe alımlarda belirsizlikleri ortadan kaldırmak için ilanlarınızda *'ücret görüşülür'* ifadesi kesinlikle yasaktır; net rakamlarla doğrudan Çavuş ve işçilere ulaşabilirsiniz.\n\nAşağıdaki hazır konulardan birini seçebilir veya sorunuzu doğrudan yazabilirsiniz.",
      timestamp: "Şimdi",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [credits, setCredits] = useState(50);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const quickPrompts = [
    "Yeni iş ilanı oluşturmak istiyorum (Çavuş/İşçi arıyorum).",
    "Külleme ve fındık kurdu mücadelesi (Belirti-Zaman-Uygulama).",
    "Dal kanseri ve kök çürüklüğü belirtileri ve tedavisi.",
    "Düzenli budama hasat işçiliği maliyetini nasıl kalıcı düşürür?",
    "Azot (N), Fosfor (P), Potasyum (K) ve mikro besleme protokolü.",
    "Verilerim nasıl işleniyor ve gizliliğim nasıl korunuyor?",
  ];

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    if (credits <= 0) {
      alert("Yapay zekâ krediniz tükendi. 'Kredi Yükle' butonundan kredinizi yenileyebilirsiniz.");
      return;
    }

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend.trim(),
          history: messages.map((m) => ({
            role: m.sender === "user" ? "user" : "model",
            parts: [{ text: m.text }],
          })),
          harvestContext: {
            totalHarvestsCount: harvests.length,
            totalKg: harvests.reduce((acc, h) => acc + h.quantityKg, 0),
            totalNetReceivable: harvests.reduce((acc, h) => acc + h.netReceivable, 0),
            totalCollected: payments.reduce((acc, p) => acc + p.amount, 0),
            recentHarvests: harvests.slice(-3).map((h) => ({
              date: h.date,
              buyer: h.buyerName,
              kg: h.quantityKg,
              net: h.netReceivable,
            })),
          },
        }),
      });

      const data = await response.json();
      const replyText =
        data.reply ||
        "Talebiniz değerlendirildi. Karadeniz tarım takvimine göre kontrollerinizi aksatmayınız.";

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: "assistant",
        text: replyText,
        timestamp: new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, aiMsg]);
      setCredits((prev) => Math.max(0, prev - (data.creditCost || 1)));
    } catch (err) {
      // Fallback
      const fallbackMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: "assistant",
        text: "Bağlantıda kısa bir aksaklık oldu ancak yerel ziraat motorumuz devrede: Yaş çayda 1/7 budama kuralı sürgün verimini artırıp işçilik maliyetini düşürür. İlkbaharda taban gübresi (25-5-10) ocak izdüşümüne verilmelidir.",
        timestamp: "Şimdi",
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      setCredits((prev) => Math.max(0, prev - 1));
    } finally {
      setIsLoading(false);
    }
  };

  const renderFormattedText = (text: string) => {
    // Process markdown-like formatting (bolding, lists, bullets)
    return text.split("\n").map((line, idx) => {
      if (!line.trim()) {
        return <div key={idx} className="h-2" />;
      }

      // Check if it's a bullet point
      const isBullet = line.trim().startsWith("•") || line.trim().startsWith("-");
      const cleanLine = isBullet ? line.replace(/^[•\-]\s*/, "") : line;

      // Simple regex for **bold** text
      const parts = cleanLine.split(/(\*\*.*?\*\*)/g);

      return (
        <div
          key={idx}
          className={`${
            isBullet ? "flex items-start gap-1.5 pl-2 my-0.5" : "my-0.5"
          }`}
        >
          {isBullet && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
          )}
          <span className="leading-relaxed">
            {parts.map((part, pIdx) => {
              if (part.startsWith("**") && part.endsWith("**")) {
                return (
                  <strong key={pIdx} className={`font-bold ${isDark ? "text-emerald-300" : "text-emerald-950 font-black"}`}>
                    {part.slice(2, -2)}
                  </strong>
                );
              }
              return part;
            })}
          </span>
        </div>
      );
    });
  };

  return (
    <div id="assistant-view-container" className="space-y-4 pb-12 animate-in fade-in duration-300">
      {/* Top Banner Tagline */}
      <div className="text-center py-1">
        <h2 className={`text-base md:text-lg font-bold tracking-tight ${isDark ? "text-emerald-300" : "text-emerald-950 font-black"}`}>
          Çayınızla ilgili sorun, birlikte çözelim
        </h2>
        <p className={`text-xs ${isDark ? "text-emerald-400/70" : "text-emerald-950 font-bold"}`}>
          Ziraat Mühendisi Destekli Yapay Zekâ Rehberi
        </p>
      </div>

      {/* Header Bar with Credit Meter (Screens 2 & 3) */}
      <div
        className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
          isDark
            ? "bg-[#10241c] border-emerald-900/60 text-emerald-50"
            : "bg-white border-emerald-200 text-gray-900 shadow-xs"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm md:text-base">Çaylık Asistan</h3>
            <p className="text-[11px] opacity-75">
              Çay üretimi ve kendi kayıtlarınız hakkında yardım alın.
            </p>
          </div>
        </div>

        {/* Credit Badge */}
        <div className="flex items-center gap-1.5">
          <div
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 text-xs font-bold ${
              isDark
                ? "bg-emerald-950 border-emerald-700/80 text-emerald-300"
                : "bg-emerald-50 border-emerald-300 text-emerald-950 font-black"
            }`}
          >
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>{credits} Kredi</span>
          </div>

          <button
            onClick={() => setCredits(50)}
            title="Krediyi Yenile (50 Kredi)"
            className={`p-1.5 rounded-xl border text-xs transition-colors ${
              isDark
                ? "bg-emerald-900/40 border-emerald-800 text-emerald-300 hover:bg-emerald-900"
                : "bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Instruction Note (Screens 2 & 3) */}
      <p className="text-xs opacity-75 leading-relaxed px-1">
        Size nasıl yardımcı olabilirim? Bir konu seçin veya sorunuzu aşağıya yazın.
        Yanıtın uzunluğuna ve kullanılan yapay zekâ modeline göre kredi düşer.
      </p>

      {/* Quick Prompt Chips (Screens 2 & 3) */}
      <div className="space-y-1.5">
        <span className={`text-[11px] font-bold uppercase tracking-wider block px-1 ${isDark ? "text-emerald-400" : "text-emerald-950 font-black"}`}>
          Hızlı Konu Seçenekleri:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              disabled={isLoading}
              className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all flex items-center gap-2 group ${
                isDark
                  ? "bg-[#11241c] hover:bg-[#163327] border-emerald-900/70 text-emerald-200 hover:border-emerald-700"
                  : "bg-white hover:bg-emerald-50/60 border-emerald-300 text-emerald-950 font-semibold hover:border-emerald-500 shadow-xs"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 group-hover:scale-125 transition-transform shrink-0" />
              <span className="line-clamp-2">{prompt}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Log */}
      <div
        id="chat-messages-container"
        className={`p-4 rounded-2xl border min-h-[300px] max-h-[500px] overflow-y-auto space-y-3.5 ${
          isDark ? "bg-[#091610] border-emerald-900/50" : "bg-gray-50/80 border-gray-200"
        }`}
      >
        {messages.map((msg) => {
          const isAi = msg.sender === "assistant";
          return (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${isAi ? "justify-start" : "justify-end"}`}
            >
              {isAi && (
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs shadow-xs transition-all ${
                  isAi
                    ? isDark
                      ? "bg-[#12281e] text-emerald-50 border border-emerald-800/60"
                      : "bg-white text-gray-950 font-medium border border-emerald-200 shadow-xs"
                    : "bg-emerald-600 text-white rounded-br-none font-medium"
                }`}
              >
                {renderFormattedText(msg.text)}
                <div
                  className={`text-[9px] mt-1.5 text-right ${
                    isAi ? (isDark ? "text-emerald-400/80 opacity-60" : "text-emerald-950 font-bold opacity-80") : "text-white/80 opacity-60"
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>

              {!isAi && (
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-2.5 items-center">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div
              className={`p-3 rounded-2xl text-xs rounded-bl-none border flex items-center gap-2 ${
                isDark
                  ? "bg-[#12281e] border-emerald-800 text-emerald-300"
                  : "bg-white border-emerald-300 text-emerald-950 font-bold"
              }`}
            >
              <Sparkles className={`w-3.5 h-3.5 animate-pulse ${isDark ? "text-emerald-400" : "text-emerald-800"}`} />
              <span>Ziraat uzmanı yanıtı hazırlıyor...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(inputValue);
        }}
        className="relative flex items-center gap-2"
      >
        <input
          id="input-ai-chat"
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Çay veya fındık sorunuzu buraya yazın..."
          className={`flex-1 rounded-2xl px-4 py-3 text-xs md:text-sm border transition-colors focus:outline-hidden focus:ring-2 focus:ring-emerald-500 pr-12 ${
            isDark
              ? "bg-[#12261d] border-emerald-800/80 text-white placeholder-emerald-800/90"
              : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 shadow-xs"
          }`}
        />
        <button
          id="btn-send-ai-chat"
          type="submit"
          disabled={!inputValue.trim() || isLoading}
          className="absolute right-2 top-2 p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white transition-all cursor-pointer"
          title="Gönder"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
