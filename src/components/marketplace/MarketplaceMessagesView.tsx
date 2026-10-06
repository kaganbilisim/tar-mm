import React, { useState } from "react";
import { MessageSquare, Phone, MessageCircle, Send, ArrowLeft, CheckCheck } from "lucide-react";
import { MarketMessage } from "../../types";
import { PrimaryButton } from "./PrimaryButton";

interface MarketplaceMessagesViewProps {
  messages: MarketMessage[];
  onSendMessage: (listingId: string, text: string) => void;
  className?: string;
}

export const MarketplaceMessagesView: React.FC<MarketplaceMessagesViewProps> = ({
  messages,
  onSendMessage,
  className = "",
}) => {
  const [selectedMessage, setSelectedMessage] = useState<MarketMessage | null>(null);
  const [replyText, setReplyText] = useState("");
  const [localChatHistory, setLocalChatHistory] = useState<
    Record<string, Array<{ text: string; sender: "me" | "them"; time: string }>>
  >({
    "msg-1": [
      { text: "Kabuklu fındık için 10 çuval talep ediyorum, yerinde teslim yapabilir misiniz?", sender: "me", time: "14:10" },
      { text: "Merhaba, 10 çuval için yarın Çarşamba merkezde teslimat yapabiliriz.", sender: "them", time: "14:25" },
    ],
    "msg-2": [
      { text: "Çavuş Mehmet Bey merhaba, 5 kişilik ekibiniz 18 Eylül'de müsait midir?", sender: "me", time: "Dün" },
      { text: "Ekibimiz hazır, teleferik kontrolünü tamamladınız mı?", sender: "them", time: "Dün" },
    ],
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedMessage) return;

    const newChat = {
      text: replyText.trim(),
      sender: "me" as const,
      time: "Şimdi",
    };

    setLocalChatHistory((prev) => ({
      ...prev,
      [selectedMessage.id]: [...(prev[selectedMessage.id] || []), newChat],
    }));

    onSendMessage(selectedMessage.listingId, replyText.trim());
    setReplyText("");
  };

  // If chat thread is open
  if (selectedMessage) {
    const thread = localChatHistory[selectedMessage.id] || [
      { text: selectedMessage.lastMessage, sender: "them", time: selectedMessage.timestamp },
    ];

    const cleanPhone = selectedMessage.contactPhone.replace(/\s+/g, "");
    const waPhone = cleanPhone.replace(/[^0-9]/g, "").replace(/^0/, "");

    return (
      <div className={`flex flex-col h-[calc(100vh-140px)] max-w-xl mx-auto ${className}`}>
        {/* Thread Top Bar */}
        <div className="p-3 bg-[#10352B] border-b border-[#20C878]/25 rounded-t-[16px] flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={() => setSelectedMessage(null)}
              className="p-1.5 rounded-full hover:bg-[#164C3B] text-[#8BAF9B] hover:text-[#F5FFF8]"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h3 className="font-extrabold text-sm text-[#F5FFF8] truncate">
                {selectedMessage.contactName}
              </h3>
              <p className="text-[11px] text-[#20C878] truncate">
                {selectedMessage.listingTitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => window.open(`https://wa.me/90${waPhone}`, "_blank")}
              className="p-2 rounded-[10px] bg-[#124235] hover:bg-[#164C3B] text-[#20C878] border border-[#20C878]/30"
              title="WhatsApp ile aç"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
            </button>
            <button
              type="button"
              onClick={() => window.open(`tel:${cleanPhone}`, "_self")}
              className="p-2 rounded-[10px] bg-[#124235] hover:bg-[#164C3B] text-[#20C878] border border-[#20C878]/30"
              title="Ara"
            >
              <Phone className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Chat Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#071C17]">
          {thread.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${
                msg.sender === "me" ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-[14px] p-3 text-xs leading-relaxed ${
                  msg.sender === "me"
                    ? "bg-[#20C878] text-[#071C17] font-semibold rounded-br-none shadow-sm shadow-[#20C878]/20"
                    : "bg-[#10352B] text-[#F5FFF8] rounded-bl-none border border-[#20C878]/20"
                }`}
              >
                {msg.text}
              </div>
              <span className="text-[10px] text-[#638275] mt-1 px-1 flex items-center gap-1">
                {msg.time}
                {msg.sender === "me" && <CheckCheck className="w-3 h-3 text-[#20C878]" />}
              </span>
            </div>
          ))}
        </div>

        {/* Message Input Bottom */}
        <form
          onSubmit={handleSend}
          className="p-3 bg-[#10352B] border-t border-[#20C878]/25 rounded-b-[16px] flex items-center gap-2 shrink-0"
        >
          <input
            type="text"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Mesajınızı buraya yazın..."
            className="flex-1 bg-[#071C17] border border-[#20C878]/30 rounded-[12px] px-3.5 py-2.5 text-xs text-[#F5FFF8] placeholder-[#638275] focus:outline-hidden focus:border-[#20C878]"
          />
          <PrimaryButton
            variant="primary"
            size="sm"
            type="submit"
            disabled={!replyText.trim()}
            icon={<Send className="w-4 h-4" />}
          >
            Gönder
          </PrimaryButton>
        </form>
      </div>
    );
  }

  return (
    <div className={`space-y-3 max-w-xl mx-auto ${className}`}>
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-lg font-black text-[#F5FFF8]">Mesajlar & Görüşmeler</h2>
        <span className="text-xs text-[#8BAF9B]">
          {messages.length} Görüşme
        </span>
      </div>

      {messages.length === 0 ? (
        <div className="p-8 text-center bg-[#10352B] rounded-[16px] border border-[#20C878]/20 text-[#8BAF9B]">
          <MessageSquare className="w-10 h-10 mx-auto text-[#20C878] mb-2 opacity-60" />
          <p className="text-sm font-bold text-[#F5FFF8]">Henüz mesajınız yok</p>
          <p className="text-xs mt-1">
            İlanlar üzerinden üretici veya işverenlerle iletişim kurduğunuzda burada listelenir.
          </p>
        </div>
      ) : (
        messages.map((msg) => (
          <div
            key={msg.id}
            onClick={() => setSelectedMessage(msg)}
            className="p-3.5 rounded-[16px] bg-[#10352B] hover:bg-[#124235] border border-[#20C878]/20 hover:border-[#20C878]/40 transition-all cursor-pointer flex items-center gap-3.5"
          >
            <div className="w-11 h-11 rounded-full bg-[#164C3B] text-[#20C878] font-black text-base flex items-center justify-center shrink-0 border border-[#20C878]/30">
              {msg.contactName.charAt(0)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1 mb-0.5">
                <h4 className="font-extrabold text-sm text-[#F5FFF8] truncate">
                  {msg.contactName}
                </h4>
                <span className="text-[11px] text-[#8BAF9B] shrink-0">
                  {msg.timestamp}
                </span>
              </div>
              <div className="text-[11px] font-bold text-[#20C878] truncate mb-0.5">
                {msg.listingTitle}
              </div>
              <p className="text-xs text-[#C7DDD0] truncate">
                {msg.lastMessage}
              </p>
            </div>

            {msg.unread && (
              <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] shrink-0" />
            )}
          </div>
        ))
      )}
    </div>
  );
};
