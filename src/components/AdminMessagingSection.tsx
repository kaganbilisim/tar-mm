import React, { useState, useMemo } from "react";
import { UserAccount, AdminUserMessage } from "../types";
import { INITIAL_USERS } from "../mockData";
import {
  MessageSquare,
  Send,
  Megaphone,
  ShieldCheck,
  User,
  Users,
  Trash2,
  Reply,
  CheckCircle2,
  Clock,
  Plus,
  X,
  Search,
  Filter,
} from "lucide-react";

interface AdminMessagingSectionProps {
  currentUser?: UserAccount | null;
  users?: UserAccount[];
  messages: AdminUserMessage[];
  onSendMessage: (msg: Omit<AdminUserMessage, "id" | "createdAt">) => void;
  onDeleteMessage?: (id: string) => void;
  isDark: boolean;
}

export const AdminMessagingSection: React.FC<AdminMessagingSectionProps> = ({
  currentUser,
  users = [],
  messages = [],
  onSendMessage,
  onDeleteMessage,
  isDark,
}) => {
  const isAdmin = currentUser?.role === "admin";

  // Compute all available registered users (merging prop users with INITIAL_USERS to ensure all members are always available)
  const allAvailableUsers = useMemo(() => {
    const list = Array.isArray(users) && users.length > 0 ? users : INITIAL_USERS;
    const existingIds = new Set(list.map((u) => u.id));
    const missing = INITIAL_USERS.filter((u) => !existingIds.has(u.id));
    return [...list, ...missing];
  }, [users]);

  // Selectable members for private message (exclude current admin)
  const selectableUsers = useMemo(() => {
    const filtered = allAvailableUsers.filter((u) => u.id !== currentUser?.id);
    const nonAdmins = filtered.filter((u) => u.role !== "admin");
    return nonAdmins.length > 0 ? nonAdmins : filtered;
  }, [allAvailableUsers, currentUser?.id]);

  // Standard User States
  const [userSubject, setUserSubject] = useState("");
  const [userContent, setUserContent] = useState("");
  const [userFeedback, setUserFeedback] = useState<string | null>(null);
  const [userFilter, setUserFilter] = useState<"all" | "replies" | "broadcasts" | "sent">("all");

  // Admin States
  const [adminTab, setAdminTab] = useState<"threads" | "broadcast">("threads");
  const [selectedUserId, setSelectedUserId] = useState<string | "all">("all");
  const [adminReplyText, setAdminReplyText] = useState("");
  const [adminReplySubject, setAdminReplySubject] = useState("");
  const [replyingToUserId, setReplyingToUserId] = useState<string | null>(null);

  // Admin Direct Message Composer
  const [isDirectModalOpen, setIsDirectModalOpen] = useState(false);
  const [directRecipientId, setDirectRecipientId] = useState<string>("");
  const [directSubject, setDirectSubject] = useState("");
  const [directContent, setDirectContent] = useState("");

  // Admin Broadcast Composer
  const [broadcastSubject, setBroadcastSubject] = useState("");
  const [broadcastContent, setBroadcastContent] = useState("");
  const [broadcastFeedback, setBroadcastFeedback] = useState<string | null>(null);

  // Search filter
  const [searchQuery, setSearchQuery] = useState("");

  const showUserToast = (msg: string) => {
    setUserFeedback(msg);
    setTimeout(() => setUserFeedback(null), 4000);
  };

  const showBroadcastToast = (msg: string) => {
    setBroadcastFeedback(msg);
    setTimeout(() => setBroadcastFeedback(null), 4000);
  };

  // Normal User: Handle Send to Admin
  const handleUserSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userContent.trim()) return;

    const senderName = currentUser?.fullName || currentUser?.username || "Değerli Üretici";
    const senderId = currentUser?.id || "user-mehmet-employer";

    onSendMessage({
      senderId,
      senderName,
      senderRole: "user",
      recipientId: "user-kagan-admin",
      recipientName: "Kağan (Sistem Tek Yöneticisi)",
      subject: userSubject.trim() || "Genel Soru & Talep",
      content: userContent.trim(),
      timestamp: new Intl.DateTimeFormat("tr-TR", {
        day: "numeric",
        month: "long",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date()),
      read: false,
      isBroadcast: false,
    });

    setUserSubject("");
    setUserContent("");
    showUserToast("Mesajınız Sistem Yöneticisi Kağan'a başarıyla iletildi. Yanıt geldiğinde burada görebilirsiniz.");
  };

  // Admin: Handle Send Broadcast
  const handleAdminBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastSubject.trim() || !broadcastContent.trim()) return;

    onSendMessage({
      senderId: currentUser?.id || "user-kagan-admin",
      senderName: currentUser?.fullName || "Kağan (Sistem Tek Yöneticisi)",
      senderRole: "admin",
      recipientId: "all",
      recipientName: "Tüm Kullanıcılar (Toplu Duyuru)",
      subject: broadcastSubject.trim(),
      content: broadcastContent.trim(),
      timestamp: new Intl.DateTimeFormat("tr-TR", {
        day: "numeric",
        month: "long",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date()),
      read: true,
      isBroadcast: true,
    });

    setBroadcastSubject("");
    setBroadcastContent("");
    showBroadcastToast(`Toplu mesaj sisteme kayıtlı tüm kullanıcılara (${allAvailableUsers.length} üye) başarıyla ulaştırıldı!`);
  };

  // Admin: Handle Direct Message to Specific User
  const handleAdminDirectSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!directRecipientId || !directContent.trim()) return;

    const targetUser = allAvailableUsers.find((u) => u.id === directRecipientId);
    const targetName = targetUser?.fullName || targetUser?.username || "Kullanıcı";

    onSendMessage({
      senderId: currentUser?.id || "user-kagan-admin",
      senderName: currentUser?.fullName || "Kağan (Sistem Tek Yöneticisi)",
      senderRole: "admin",
      recipientId: directRecipientId,
      recipientName: targetName,
      subject: directSubject.trim() || "Yönetici Özel Mesajı",
      content: directContent.trim(),
      timestamp: new Intl.DateTimeFormat("tr-TR", {
        day: "numeric",
        month: "long",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date()),
      read: false,
      isBroadcast: false,
    });

    setDirectSubject("");
    setDirectContent("");
    setDirectRecipientId("");
    setIsDirectModalOpen(false);
    showBroadcastToast(`"${targetName}" kullanıcısına özel mesaj başarıyla iletildi.`);
  };

  // Admin: Quick Reply to specific user from thread
  const handleAdminQuickReply = (targetUserId: string, targetUserName: string) => {
    if (!adminReplyText.trim()) return;

    onSendMessage({
      senderId: currentUser?.id || "user-kagan-admin",
      senderName: currentUser?.fullName || "Kağan (Sistem Tek Yöneticisi)",
      senderRole: "admin",
      recipientId: targetUserId,
      recipientName: targetUserName,
      subject: adminReplySubject.trim() || "Yönetici Yanıtı",
      content: adminReplyText.trim(),
      timestamp: new Intl.DateTimeFormat("tr-TR", {
        day: "numeric",
        month: "long",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date()),
      read: false,
      isBroadcast: false,
    });

    setAdminReplyText("");
    setAdminReplySubject("");
    setReplyingToUserId(null);
    showBroadcastToast(`"${targetUserName}" kullanıcısına yanıtınız başarıyla gönderildi.`);
  };

  // NORMAL USER MESSAGES: User's conversation with admin + Broadcast announcements
  const userVisibleMessages = useMemo(() => {
    if (isAdmin) return [];
    const myId = currentUser?.id;
    return messages.filter((m) => {
      // 1. Broadcast messages from Admin
      if (m.isBroadcast || m.recipientId === "all") return true;
      // 2. Sent by me to Admin
      if (myId && m.senderId === myId) return true;
      // 3. Sent to me by Admin
      if (myId && m.recipientId === myId) return true;
      // 4. Default demo messages matching user
      if (m.recipientId === "user-mehmet-employer" || m.senderId === "user-mehmet-employer") {
        if (currentUser?.username === "mehmet53" || !myId) return true;
      }
      return false;
    });
  }, [messages, currentUser?.id, currentUser?.username, isAdmin]);

  // Filtered User Messages
  const filteredUserMessages = useMemo(() => {
    let list = userVisibleMessages;
    if (userFilter === "replies") {
      list = list.filter((m) => m.senderRole === "admin" && !m.isBroadcast);
    } else if (userFilter === "broadcasts") {
      list = list.filter((m) => m.isBroadcast || m.recipientId === "all");
    } else if (userFilter === "sent") {
      list = list.filter((m) => m.senderId === currentUser?.id);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (m) =>
          m.subject?.toLowerCase().includes(q) ||
          m.content.toLowerCase().includes(q) ||
          m.senderName.toLowerCase().includes(q)
      );
    }
    return list;
  }, [userVisibleMessages, userFilter, searchQuery, currentUser?.id]);

  // ADMIN: Unique user threads
  const userThreads = useMemo(() => {
    if (!isAdmin) return [];
    // Gather all messages that are user-admin direct conversations
    const nonBroadcasts = messages.filter((m) => !m.isBroadcast && m.recipientId !== "all");

    // Map by the user's ID (the other party)
    const threadMap = new Map<
      string,
      {
        userId: string;
        userName: string;
        userPhone?: string;
        messages: AdminUserMessage[];
        lastMessage: AdminUserMessage;
        unreadCount: number;
      }
    >();

    nonBroadcasts.forEach((m) => {
      const otherId = m.senderRole === "admin" ? m.recipientId : m.senderId;
      const matchedUser = allAvailableUsers.find((u) => u.id === otherId);
      const otherName =
        m.senderRole === "admin"
          ? m.recipientName || matchedUser?.fullName || matchedUser?.username || "Kullanıcı"
          : m.senderName || matchedUser?.fullName || matchedUser?.username || "Kullanıcı";

      if (!threadMap.has(otherId)) {
        threadMap.set(otherId, {
          userId: otherId,
          userName: otherName,
          userPhone: matchedUser?.phone,
          messages: [],
          lastMessage: m,
          unreadCount: 0,
        });
      }

      const t = threadMap.get(otherId)!;
      t.messages.push(m);
      if (m.senderRole === "user" && !m.read) {
        t.unreadCount += 1;
      }
      const mTime = m.createdAt || 0;
      const lastTime = t.lastMessage.createdAt || 0;
      if (mTime >= lastTime) {
        t.lastMessage = m;
        if (m.senderRole === "user" && m.senderName) {
          t.userName = m.senderName;
        }
      }
    });

    return Array.from(threadMap.values()).sort(
      (a, b) => (b.lastMessage.createdAt || 0) - (a.lastMessage.createdAt || 0)
    );
  }, [messages, allAvailableUsers, isAdmin]);

  // Admin Broadcast messages list
  const broadcastMessages = useMemo(() => {
    return messages.filter((m) => m.isBroadcast || m.recipientId === "all");
  }, [messages]);

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-emerald-900/30">
        <div>
          <h3 className="font-extrabold text-base md:text-lg flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-amber-400" />
            <span>
              {isAdmin ? "👑 Yönetici Mesajlaşma & Toplu Duyuru Merkezi" : "Yönetici (Kağan) ile İletişim & Mesajlaşma"}
            </span>
          </h3>
          <p className="text-xs opacity-75 mt-0.5">
            {isAdmin
              ? "Kullanıcıların taleplerine özel yanıt yazın veya tüm kullanıcılara toplu mesaj yayınlayın."
              : "Sistem yöneticisine doğrudan mesaj yazın, karşılıklı yanıtlaşın ve yönetici duyurularını takip edin."}
          </p>
        </div>

        {isAdmin ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsDirectModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Kullanıcıya Özel Mesaj Yaz</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Admin Destek Hattı Aktif</span>
            </span>
          </div>
        )}
      </div>

      {/* =========================================================================
          VIEW A: NORMAL USER VIEW (KULLANICI -> ADMİN'E MESAJ GÖNDER & YANITLARI GÖR)
         ========================================================================= */}
      {!isAdmin && (
        <div className="space-y-4">
          {userFeedback && (
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{userFeedback}</span>
            </div>
          )}

          {/* 1. Admin'e Yeni Mesaj Gönderme Formu */}
          <form
            onSubmit={handleUserSend}
            className={`p-4 rounded-2xl border space-y-3 shadow-md ${
              isDark ? "bg-[#10241c] border-emerald-700/60 text-emerald-100" : "bg-white border-emerald-300"
            }`}
          >
            <div className="flex items-center justify-between pb-1 border-b border-emerald-900/30">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                  ✍️
                </div>
                <span className="font-extrabold text-xs text-amber-300">
                  Yönetici Kağan'a Yeni Mesaj Gönder
                </span>
              </div>
              <span className="text-[10px] opacity-75">Özel & Güvenli İletişim</span>
            </div>

            <div>
              <label className="block text-[11px] font-bold mb-1 opacity-90">
                Konu / Başlık (İsteğe Bağlı)
              </label>
              <input
                type="text"
                value={userSubject}
                onChange={(e) => setUserSubject(e.target.value)}
                placeholder="Örn: Fabrika alım şartları, çay hasat yevmiyesi veya önerim var..."
                className={`w-full px-3 py-2 rounded-xl text-xs border ${
                  isDark ? "bg-[#142920] border-emerald-800 text-white placeholder:text-gray-500" : "bg-white border-gray-300"
                }`}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold mb-1 opacity-90">
                Mesajınız *
              </label>
              <textarea
                required
                rows={3}
                value={userContent}
                onChange={(e) => setUserContent(e.target.value)}
                placeholder="Yöneticiye iletmek istediğiniz detaylı sorunuzu, talebinizi veya bildirmek istediğiniz konuyu buraya yazın..."
                className={`w-full px-3 py-2 rounded-xl text-xs border ${
                  isDark ? "bg-[#142920] border-emerald-800 text-white placeholder:text-gray-500" : "bg-white border-gray-300"
                }`}
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="text-[10px] opacity-75">
                Gönderen: <strong>{currentUser?.fullName || currentUser?.username}</strong>
              </div>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-transform hover:scale-102"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Admin'e Mesaj Gönder</span>
              </button>
            </div>
          </form>

          {/* 2. Mesaj Listesi Filtreleri & Arama */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                type="button"
                onClick={() => setUserFilter("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                  userFilter === "all"
                    ? "bg-emerald-600 text-white"
                    : isDark
                    ? "bg-black/25 text-emerald-300 hover:bg-white/10"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Tümü ({userVisibleMessages.length})
              </button>
              <button
                type="button"
                onClick={() => setUserFilter("replies")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                  userFilter === "replies"
                    ? "bg-emerald-600 text-white"
                    : isDark
                    ? "bg-black/25 text-emerald-300 hover:bg-white/10"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                👑 Admin Yanıtları
              </button>
              <button
                type="button"
                onClick={() => setUserFilter("broadcasts")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                  userFilter === "broadcasts"
                    ? "bg-amber-600 text-white"
                    : isDark
                    ? "bg-black/25 text-amber-300 hover:bg-white/10"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                📢 Toplu Duyurular
              </button>
              <button
                type="button"
                onClick={() => setUserFilter("sent")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                  userFilter === "sent"
                    ? "bg-teal-600 text-white"
                    : isDark
                    ? "bg-black/25 text-teal-300 hover:bg-white/10"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Giden Mesajlarım
              </button>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Mesajlarda ara..."
                className={`w-full sm:w-44 pl-8 pr-3 py-1 rounded-xl text-xs border ${
                  isDark ? "bg-[#142920] border-emerald-900 text-white" : "bg-white border-gray-300"
                }`}
              />
            </div>
          </div>

          {/* 3. Mesajlar Akışı */}
          <div className="space-y-3">
            {filteredUserMessages.length === 0 ? (
              <div
                className={`p-6 rounded-2xl border text-center space-y-2 ${
                  isDark ? "bg-[#0b1d16] border-emerald-900/60 text-emerald-300" : "bg-gray-50 border-gray-200 text-gray-600"
                }`}
              >
                <MessageSquare className="w-8 h-8 mx-auto opacity-50 text-amber-400" />
                <p className="text-xs font-bold">Bu filtrede henüz mesaj bulunmuyor.</p>
                <p className="text-[11px] opacity-75">
                  Yukarıdaki formu kullanarak Yönetici Kağan'a soru veya önerilerinizi yazabilirsiniz.
                </p>
              </div>
            ) : (
              filteredUserMessages.map((msg) => {
                const isBroadcast = msg.isBroadcast || msg.recipientId === "all";
                const isFromAdmin = msg.senderRole === "admin";
                const isFromMe = msg.senderId === currentUser?.id;

                return (
                  <div
                    key={msg.id}
                    className={`p-4 rounded-2xl border transition-all text-xs space-y-2 shadow-sm ${
                      isBroadcast
                        ? isDark
                          ? "bg-gradient-to-r from-amber-950/40 to-[#1e1708] border-amber-500/50 text-amber-100"
                          : "bg-amber-50/80 border-amber-300 text-amber-950"
                        : isFromAdmin
                        ? isDark
                          ? "bg-gradient-to-r from-emerald-950/60 to-[#0e271c] border-emerald-500/60 text-emerald-100"
                          : "bg-emerald-50 border-emerald-300 text-emerald-950"
                        : isDark
                        ? "bg-[#10241c] border-emerald-900/70 text-emerald-200"
                        : "bg-white border-gray-200 text-gray-800"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {isBroadcast ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-black flex items-center gap-1 shadow-2xs">
                            <Megaphone className="w-3 h-3" />
                            <span>Yönetici Toplu Duyurusu</span>
                          </span>
                        ) : isFromAdmin ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white flex items-center gap-1 shadow-2xs">
                            <ShieldCheck className="w-3 h-3" />
                            <span>Yönetici Yanıtı</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                            Sizin Mesajınız
                          </span>
                        )}

                        <span className="font-extrabold text-xs">
                          {isFromMe ? "Siz" : msg.senderName}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 text-[10px] opacity-75">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{msg.timestamp}</span>
                        </span>
                        {isFromMe && onDeleteMessage && (
                          <button
                            type="button"
                            onClick={() => onDeleteMessage(msg.id)}
                            className="text-red-400 hover:text-red-300 p-1"
                            title="Mesajı Sil"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {msg.subject && (
                      <h4 className="font-bold text-xs sm:text-sm text-current">
                        {msg.subject}
                      </h4>
                    )}

                    <p className="text-xs opacity-90 leading-relaxed whitespace-pre-wrap">
                      {msg.content}
                    </p>

                    {isFromAdmin && (
                      <div className="pt-2 border-t border-current/15 flex items-center justify-between text-[11px]">
                        <span className="italic opacity-80">
                          {isBroadcast ? "Tüm sisteme yayınlanan resmi duyurudur." : "Yönetici Kağan tarafından size özel olarak yanıtlanmıştır."}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW B: ADMIN VIEW (KAĞAN -> GELEN KULLANICI MESAJLARI & TOPLU MESAJ GÖNDER)
         ========================================================================= */}
      {isAdmin && (
        <div className="space-y-4">
          {broadcastFeedback && (
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{broadcastFeedback}</span>
            </div>
          )}

          {/* Admin Subtabs: 1. Kullanıcı Mesajları & Karşılıklı Yanıtlama | 2. Toplu Mesaj Gönder */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-black/30 border border-emerald-900/60">
            <button
              type="button"
              onClick={() => setAdminTab("threads")}
              className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                adminTab === "threads"
                  ? "bg-emerald-600 text-white shadow-md"
                  : "text-emerald-300 hover:bg-white/10"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Gelen Kullanıcı Talepleri & Yanıtlama ({userThreads.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setAdminTab("broadcast")}
              className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                adminTab === "broadcast"
                  ? "bg-amber-600 text-white shadow-md"
                  : "text-amber-300 hover:bg-white/10"
              }`}
            >
              <Megaphone className="w-4 h-4" />
              <span>Tüm Kullanıcılara Toplu Mesaj Yaz ({users.length} Üye)</span>
            </button>
          </div>

          {/* TAB 1: USER CONVERSATIONS & MUTUAL REPLIES */}
          {adminTab === "threads" && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-xs font-bold text-emerald-400">
                  Kullanıcı Mesajlaşma Çizelgesi ({userThreads.length} aktif kullanıcı)
                </span>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
                      isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-white border-gray-300"
                    }`}
                  >
                    <option value="all">Tüm Kullanıcıların Mesajları</option>
                    {userThreads.map((t) => (
                      <option key={t.userId} value={t.userId}>
                        {t.userName} ({t.messages.length} mesaj)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {userThreads.length === 0 ? (
                <div
                  className={`p-6 rounded-2xl border text-center space-y-2 ${
                    isDark ? "bg-[#0b1d16] border-emerald-900/60 text-emerald-300" : "bg-gray-50 border-gray-200 text-gray-600"
                  }`}
                >
                  <MessageSquare className="w-8 h-8 mx-auto opacity-50 text-emerald-400" />
                  <p className="text-xs font-bold">Henüz kullanıcı mesajı bulunmuyor.</p>
                  <p className="text-[11px] opacity-75">
                    Sağ üstteki "Kullanıcıya Özel Mesaj Yaz" butonundan dilediğiniz üyeye ilk mesajı siz de gönderebilirsiniz.
                  </p>
                </div>
              ) : (
                userThreads
                  .filter((t) => selectedUserId === "all" || t.userId === selectedUserId)
                  .map((thread) => {
                    const sortedThreadMsgs = [...thread.messages].sort((a, b) => a.createdAt - b.createdAt);
                    const isReplying = replyingToUserId === thread.userId;

                    return (
                      <div
                        key={thread.userId}
                        className={`p-4 rounded-2xl border space-y-3 ${
                          isDark ? "bg-[#10241c] border-emerald-800 text-emerald-100" : "bg-white border-emerald-300 shadow-sm"
                        }`}
                      >
                        {/* Thread User Header */}
                        <div className="flex items-center justify-between pb-2 border-b border-emerald-900/40">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold text-xs">
                              <User className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-extrabold text-sm flex items-center gap-2 flex-wrap">
                                <span>{thread.userName}</span>
                                {thread.userPhone && (
                                  <span className="text-[11px] opacity-75 font-semibold">({thread.userPhone})</span>
                                )}
                                {thread.unreadCount > 0 && (
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500 text-black font-extrabold animate-pulse">
                                    {thread.unreadCount} Yeni Kullanıcı Talebi
                                  </span>
                                )}
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-semibold border border-teal-500/30">
                                  {thread.messages.length} Karşılıklı Mesaj
                                </span>
                              </div>
                              <span className="text-[10px] opacity-70">
                                Son Hareket: {thread.lastMessage.timestamp}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              if (isReplying) {
                                setReplyingToUserId(null);
                              } else {
                                setReplyingToUserId(thread.userId);
                                setAdminReplySubject(
                                  thread.lastMessage.subject?.startsWith("Yanıt:")
                                    ? thread.lastMessage.subject
                                    : `Yanıt: ${thread.lastMessage.subject || "Kullanıcı Talebi"}`
                                );
                              }
                            }}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <Reply className="w-3.5 h-3.5" />
                            <span>{isReplying ? "Kapat" : "Bu Kullanıcıya Yanıt Yaz"}</span>
                          </button>
                        </div>

                        {/* Thread Message History */}
                        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                          {sortedThreadMsgs.map((m) => {
                            const isMeAdmin = m.senderRole === "admin";
                            return (
                              <div
                                key={m.id}
                                className={`p-3 rounded-xl border text-xs space-y-1 ${
                                  isMeAdmin
                                    ? isDark
                                      ? "bg-emerald-950/50 border-emerald-600/40 ml-4 sm:ml-8"
                                      : "bg-emerald-50 border-emerald-300 ml-4 sm:ml-8"
                                    : isDark
                                    ? "bg-black/30 border-gray-800 mr-4 sm:mr-8"
                                    : "bg-gray-100 border-gray-300 mr-4 sm:mr-8"
                                }`}
                              >
                                <div className="flex items-center justify-between text-[10px] opacity-75">
                                  <span className="font-bold">
                                    {isMeAdmin ? "👑 Siz (Kağan - Yönetici)" : m.senderName}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <span>{m.timestamp}</span>
                                    {onDeleteMessage && (
                                      <button
                                        type="button"
                                        onClick={() => onDeleteMessage(m.id)}
                                        className="text-red-400 hover:text-red-300 cursor-pointer"
                                        title="Mesajı Sil"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                                {m.subject && (
                                  <div className="font-bold text-xs text-current">{m.subject}</div>
                                )}
                                <div className="text-xs opacity-90 leading-relaxed whitespace-pre-wrap">
                                  {m.content}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Quick Inline Reply Form */}
                        {isReplying && (
                          <div className={`p-3 rounded-xl border space-y-2.5 pt-2 ${
                            isDark ? "bg-black/30 border-emerald-700/60" : "bg-emerald-50/70 border-emerald-300"
                          }`}>
                            <span className="text-[11px] font-extrabold text-emerald-400 flex items-center gap-1.5">
                              <Reply className="w-3.5 h-3.5" />
                              <span>"{thread.userName}" kullanıcısına yanıt yazın:</span>
                            </span>

                            <input
                              type="text"
                              value={adminReplySubject}
                              onChange={(e) => setAdminReplySubject(e.target.value)}
                              placeholder="Yanıt Konusu (İsteğe Bağlı, Örn: Yanıt: Fabrika Alım Koşulları)"
                              className={`w-full px-3 py-1.5 rounded-lg text-xs border ${
                                isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-white border-gray-300"
                              }`}
                            />

                            <textarea
                              rows={2}
                              value={adminReplyText}
                              onChange={(e) => setAdminReplyText(e.target.value)}
                              placeholder="Kullanıcıya iletmek istediğiniz yanıt metnini yazın..."
                              className={`w-full px-3 py-2 rounded-lg text-xs border ${
                                isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-white border-gray-300"
                              }`}
                            />

                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setReplyingToUserId(null)}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold border border-gray-500/30"
                              >
                                İptal
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAdminQuickReply(thread.userId, thread.userName)}
                                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm"
                              >
                                <Send className="w-3.5 h-3.5" />
                                <span>Yanıtı Gönder</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
              )}
            </div>
          )}

          {/* TAB 2: BROADCAST MESSAGE TO ALL USERS (TOPLU MESAJ GÖNDER) */}
          {adminTab === "broadcast" && (
            <div className="space-y-4">
              <form
                onSubmit={handleAdminBroadcast}
                className={`p-4 rounded-2xl border space-y-3.5 shadow-md ${
                  isDark ? "bg-[#10241c] border-amber-500/50 text-amber-100" : "bg-amber-50/80 border-amber-300"
                }`}
              >
                <div className="flex items-center gap-2 pb-1 border-b border-amber-900/30">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-black flex items-center justify-center font-bold">
                    <Megaphone className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-amber-400">
                      Tüm Kullanıcılara Toplu Mesaj & Duyuru Gönder
                    </h4>
                    <p className="text-[11px] opacity-80">
                      Bu alandan yazacağınız mesaj tüm kayıtlı kullanıcılara ({users.length} üretici/çiftçi) anında ulaştırılır.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold mb-1 opacity-90">
                    Duyuru / Toplu Mesaj Başlığı *
                  </label>
                  <input
                    type="text"
                    required
                    value={broadcastSubject}
                    onChange={(e) => setBroadcastSubject(e.target.value)}
                    placeholder="Örn: 📢 2026 Sezonu Gübre Dağıtımı & Desteklemeler Hakkında Önemli Bilgilendirme"
                    className={`w-full px-3 py-2 rounded-xl text-xs font-bold border ${
                      isDark ? "bg-[#142920] border-emerald-800 text-white placeholder:text-gray-500" : "bg-white border-gray-300"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold mb-1 opacity-90">
                    Toplu Mesaj İçeriği *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={broadcastContent}
                    onChange={(e) => setBroadcastContent(e.target.value)}
                    placeholder="Tüm Karadeniz üreticilerimize ulaştırılacak duyuru ve açıklama metnini buraya yazın..."
                    className={`w-full px-3 py-2 rounded-xl text-xs border ${
                      isDark ? "bg-[#142920] border-emerald-800 text-white placeholder:text-gray-500" : "bg-white border-gray-300"
                    }`}
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] opacity-75 font-semibold">
                    Gönderici: <strong>Kağan (Sistem Tek Yöneticisi)</strong>
                  </span>

                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs flex items-center gap-2 shadow-md cursor-pointer transition-transform hover:scale-102"
                  >
                    <Megaphone className="w-4 h-4" />
                    <span>Tüm Kullanıcılara Toplu Mesajı Gönder</span>
                  </button>
                </div>
              </form>

              {/* Geçmiş Toplu Duyurular Listesi */}
              <div className="space-y-2.5 pt-2">
                <span className="font-extrabold text-xs text-amber-400">
                  Yayınlanan Toplu Duyurular ({broadcastMessages.length})
                </span>

                {broadcastMessages.map((b) => (
                  <div
                    key={b.id}
                    className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                      isDark ? "bg-black/30 border-amber-600/40 text-amber-200" : "bg-amber-50 border-amber-200 text-amber-950"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-amber-500 text-black">
                          TOPLU DUYURU
                        </span>
                        <span className="font-bold">{b.subject}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] opacity-75">
                        <span>{b.timestamp}</span>
                        {onDeleteMessage && (
                          <button
                            type="button"
                            onClick={() => onDeleteMessage(b.id)}
                            className="text-red-400 hover:text-red-300 cursor-pointer p-1"
                            title="Toplu Mesajı Sil"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-[11px] opacity-90 leading-relaxed whitespace-pre-wrap">{b.content}</p>
                    <div className="text-[10px] opacity-60 flex items-center gap-1 font-bold">
                      <Users className="w-3 h-3" />
                      <span>Tüm kullanıcılara ulaştırıldı</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MODAL: KULLANICIYA ÖZEL YENİ MESAJ YAZ */}
          {isDirectModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/70 backdrop-blur-xs animate-in fade-in">
              <div
                className={`w-full max-w-md rounded-2xl border p-4 space-y-3.5 shadow-2xl ${
                  isDark ? "bg-[#0b1c15] border-emerald-700 text-emerald-100" : "bg-white border-emerald-300 text-gray-900"
                }`}
              >
                <div className="flex items-center justify-between pb-2 border-b border-emerald-900/30">
                  <span className="font-extrabold text-sm text-emerald-400 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>Kullanıcıya Özel Mesaj Yaz</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsDirectModalOpen(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleAdminDirectSend} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold mb-1 opacity-90 text-amber-300">
                      Alıcı Kullanıcıyı Seçin ({selectableUsers.length} Kayıtlı Üye) *
                    </label>
                    <select
                      required
                      value={directRecipientId}
                      onChange={(e) => setDirectRecipientId(e.target.value)}
                      className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold border transition-colors ${
                        isDark ? "bg-[#142920] border-emerald-700 text-white" : "bg-white border-gray-300 text-gray-900"
                      }`}
                    >
                      <option value="">-- Alıcı Kullanıcıyı Seçiniz ({selectableUsers.length} Kayıtlı Üye) --</option>
                      {selectableUsers.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.fullName || u.username} • {u.phone || u.username} ({u.role === "admin" ? "Yönetici" : "Kayıtlı Üye"})
                        </option>
                      ))}
                    </select>
                    {directRecipientId && (
                      <div className="mt-1 text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Seçilen Alıcı: {allAvailableUsers.find((u) => u.id === directRecipientId)?.fullName}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold mb-1 opacity-90">
                      Mesaj Konusu
                    </label>
                    <input
                      type="text"
                      value={directSubject}
                      onChange={(e) => setDirectSubject(e.target.value)}
                      placeholder="Örn: ÇKS belgesi veya randıman bilgilendirmesi"
                      className={`w-full px-3 py-2 rounded-xl text-xs border ${
                        isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-white border-gray-300"
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold mb-1 opacity-90">
                      Mesaj Metni *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={directContent}
                      onChange={(e) => setDirectContent(e.target.value)}
                      placeholder="Kullanıcıya iletmek istediğiniz özel mesajı yazın..."
                      className={`w-full px-3 py-2 rounded-xl text-xs border ${
                        isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-white border-gray-300"
                      }`}
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsDirectModalOpen(false)}
                      className="px-3 py-1.5 rounded-xl border border-gray-500/30 text-xs font-bold"
                    >
                      Vazgeç
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Mesajı Gönder</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
