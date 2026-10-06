// Tarım Cepte AI - Topluluk Kuralları, Küfür, Hakaret, Argo & Dolandırıcılık Filtreleme Sistemi

// Yasaklı küfür, hakaret, argo ve cinsel içerikli kelimeler havuzu
export const PROFANITY_WORDS = [
  "amk", "aq", "orospu", "piç", "pic", "oç", "o.ç", "sik", "sikeyim", "sikerim", "sikiş", 
  "siktir", "siktirgit", "sikik", "siktiğimin", "yarrak", "yarak", "yarram", "göt", "götveren",
  "götoş", "amcık", "ibne", "puşt", "kahpe", "pezevenk", "şerefsiz", "haysiyetsiz", "namussuz",
  "gavat", "kavat", "kerane", "fahişe", "dalyarak", "taşak", "taşşak", "amına", "ananı", "avradını", 
  "sulalesini", "ebeni", "bacını", "kahbe", "kodumun", "yavşak", "dingil", "dangalak", "ahmak", 
  "aptal", "gerizekalı", "salak", "mal", "hıyar", "bok", "boktan", "çakal", "it oğlu", "köpek soyu", 
  "it herif", "sürtük", "göt lalesi", "zürriyetsiz", "soysuz"
];

// Dolandırıcılık, sahtekarlık ve şüpheli finansal ifadeler havuzu
export const FRAUD_PHRASES = [
  "kapora at", "ön ödeme gönder", "iban at hemen para gönder", "hesaba para at",
  "şifreni gönder", "kart bilgilerini ver", "kredi kartı şifresi", "kolay yoldan zengin",
  "garantili para", "komisyon karşılığı nakit", "yüksek faizle nakit", "tefeci",
  "bahis", "kumar", "kripto yatır", "forex katla", "dekont at göndereyim",
  "kapora olmadan", "önce sen gönder", "kaporasız olmaz", "para transferi yap",
  "hesabıma para yolla", "ön kapora", "sahte fatura", "kara para", "kaçak çay", "kaçak tütün"
];

// Tarım Cepte Sistem Kuralları: Ücret görüşülür / belirsiz fiyat kesinlikle yasaktır
export const BANNED_WAGE_PHRASES = [
  "ücret görüşülür", "fiyat görüşülür", "ücret konuşulur", "fiyat konuşulur",
  "yevmiye görüşülür", "telefonda anlaşırız", "fiyatta anlaşırız", "ücrette anlaşırız",
  "fiyatı konuşuruz", "ücreti konuşuruz", "ücret telefonda", "fiyat telefonda",
  "pazarlık yapılır", "pazarlık payı vardır", "pazarlık", "fiyat verilir",
  "ücret bakarız", "işe göre bakarız", "ücret duruma göre", "fiyat konuşarak"
];

// Metni normalize et (Türkçe karakterleri ve leet-speak sembolleri düzelt)
export function normalizeText(text: string): string {
  if (!text) return "";
  let normalized = text.toLowerCase();
  
  // Harf ve rakam dönüştürmeleri (sansür aşma tekniklerini engeller: s1k, 0rospu, @mk vb.)
  normalized = normalized
    .replace(/@/g, "a")
    .replace(/0/g, "o")
    .replace(/1/g, "i")
    .replace(/3/g, "e")
    .replace(/5/g, "s")
    .replace(/\$/g, "s")
    .replace(/!/g, "i")
    .replace(/[\._\-\*\+\#\(\)\{\}\[\]\\\/]/g, " ");

  return normalized;
}

export interface ModerationResult {
  isValid: boolean;
  errorMessage?: string;
  category?: "profanity" | "fraud" | "banned_wage" | "clean";
  matchedTerm?: string;
  violatingField?: string;
}

/**
 * Kullanıcı girdisini küfür, hakaret, argo, dolandırıcılık ve kural dışı ifadelere karşı denetler.
 */
export function validateContent(text: string, fieldName = "Metin"): ModerationResult {
  if (!text || typeof text !== "string") {
    return { isValid: true, category: "clean" };
  }

  const raw = text.toLowerCase();
  const normalized = normalizeText(text);

  // 1. Ücret Belirsizliği Denetimi (AGENTS.md Kuralı)
  for (const phrase of BANNED_WAGE_PHRASES) {
    if (raw.includes(phrase) || normalized.includes(phrase)) {
      return {
        isValid: false,
        category: "banned_wage",
        matchedTerm: phrase,
        violatingField: fieldName,
        errorMessage: `"${phrase}" ifadesi kullanılamaz. Tarım Cepte kuralları gereği ücret/yevmiye alanına net ve kesin tutar girilmeli, belirsiz ifadelere izin verilmemektedir.`,
      };
    }
  }

  // 2. Dolandırıcılık ve Şüpheli Talep Denetimi
  for (const phrase of FRAUD_PHRASES) {
    if (raw.includes(phrase) || normalized.includes(phrase)) {
      return {
        isValid: false,
        category: "fraud",
        matchedTerm: phrase,
        violatingField: fieldName,
        errorMessage: `Topluluk güvenliği kuralı: ${fieldName} içinde dolandırıcılık veya şüpheli ön ödeme/kapora riski taşıyan ifade tespit edildi: "${phrase}". Lütfen doğrudan nakit ve şeffaf şartlar belirtiniz.`,
      };
    }
  }

  // 3. Küfür, Hakaret ve Argo Denetimi (Kelime sınırları ve varyasyonlarıyla)
  const tokens = normalized.split(/\s+/).filter(Boolean);

  for (const badWord of PROFANITY_WORDS) {
    // Tam kelime eşleşmesi
    if (tokens.includes(badWord)) {
      return {
        isValid: false,
        category: "profanity",
        matchedTerm: badWord,
        violatingField: fieldName,
        errorMessage: `${fieldName} içeriğinde topluluk kurallarına aykırı küfür, hakaret veya uygunsuz kelime tespit edildi. Lütfen temiz bir dil kullanınız.`,
      };
    }

    // Kelime içi açık kök eşleşmesi (örn: siktir... orospu...)
    if (badWord.length >= 4) {
      for (const token of tokens) {
        if (token.startsWith(badWord) || token.includes(badWord)) {
          return {
            isValid: false,
            category: "profanity",
            matchedTerm: badWord,
            violatingField: fieldName,
            errorMessage: `${fieldName} içeriğinde topluluk kurallarına aykırı uygunsuz bir kelime tespit edildi. Lütfen metni düzenleyiniz.`,
          };
        }
      }
    }
  }

  return { isValid: true, category: "clean" };
}

/**
 * Birden fazla alanı (başlık, açıklama, notlar vb.) topluca denetler.
 */
export function validateFormFields(fields: Record<string, string | undefined>): ModerationResult {
  for (const [fieldName, value] of Object.entries(fields)) {
    if (!value) continue;
    const res = validateContent(value, fieldName);
    if (!res.isValid) {
      return res;
    }
  }
  return { isValid: true, category: "clean" };
}

/**
 * 'Kötü Söz Denetleyici' (Profanity Filter) Yardımcı Fonksiyonu
 * İlan, başvuru ve açıklama alanları için input verisini küfür, hakaret, argo,
 * dolandırıcılık ve sansürlü kelimelere karşı filtreler.
 * 
 * @param input Tek bir metin string'i veya alan adlarıyla eşleştirilmiş nesne { [alanAdı]: değer }
 * @param defaultFieldLabel Alan adı etiketi (varsayılan: "İlan / Açıklama")
 * @returns ModerationResult: { isValid: boolean, errorMessage?: string, matchedTerm?: string, category?: string }
 */
export function checkProfanity(
  input: string | Record<string, string | undefined>,
  defaultFieldLabel = "İlan / Açıklama"
): ModerationResult {
  if (!input) return { isValid: true, category: "clean" };
  if (typeof input === "string") {
    return validateContent(input, defaultFieldLabel);
  }
  return validateFormFields(input);
}

// Türkçe fonksiyon adı takma adı
export const kotuSozDenetleyici = checkProfanity;

/**
 * Görüntüleme esnasında metindeki uygunsuz kelimeleri yıldızlar (***)
 */
export function sanitizeText(text: string): string {
  if (!text) return "";
  let sanitized = text;

  for (const badWord of PROFANITY_WORDS) {
    const regex = new RegExp(`\\b${badWord}[a-zçğıöşü]*\\b`, "gi");
    sanitized = sanitized.replace(regex, (match) => "*".repeat(match.length));
  }

  return sanitized;
}

/**
 * Bir ilanın 7 günlük yayın süresinin dolup dolmadığını veya pasif olup olmadığını denetler.
 */
export function isJobExpired(job: {
  status?: string;
  createdAt?: string;
  createdAtTimestamp?: number;
  expiresAtTimestamp?: number;
}): boolean {
  if (job.status === "inactive" || job.status === "filled" || job.status === "completed") {
    return true;
  }
  const now = Date.now();
  if (job.expiresAtTimestamp) {
    return now > job.expiresAtTimestamp;
  }
  if (job.createdAtTimestamp) {
    return now > job.createdAtTimestamp + 7 * 24 * 60 * 60 * 1000;
  }
  if (job.createdAt && job.createdAt !== "Bugün" && job.createdAt !== "Şimdi") {
    const parsed = Date.parse(job.createdAt);
    if (!isNaN(parsed)) {
      return now > parsed + 7 * 24 * 60 * 60 * 1000;
    }
  }
  return false;
}

/**
 * İlanın 7 günlük yayın süresinden geriye kaç gün kaldığını hesaplar.
 */
export function getJobRemainingDays(job: {
  createdAt?: string;
  createdAtTimestamp?: number;
  expiresAtTimestamp?: number;
}): number {
  const now = Date.now();
  let expireTime = job.expiresAtTimestamp;
  if (!expireTime && job.createdAtTimestamp) {
    expireTime = job.createdAtTimestamp + 7 * 24 * 60 * 60 * 1000;
  }
  if (!expireTime && job.createdAt && job.createdAt !== "Bugün" && job.createdAt !== "Şimdi") {
    const parsed = Date.parse(job.createdAt);
    if (!isNaN(parsed)) {
      expireTime = parsed + 7 * 24 * 60 * 60 * 1000;
    }
  }
  if (!expireTime) return 7;
  const diff = expireTime - now;
  if (diff <= 0) return 0;
  return Math.max(1, Math.ceil(diff / (24 * 60 * 60 * 1000)));
}

