import React, { useState, useMemo } from "react";
import {
  AgriProductListing,
  JobListing,
  CrewLeaderProfile,
  WorkerProfile,
  ServiceProvider,
  JobApplication,
  UserRole,
  AgriCategory,
  MarketMessage,
} from "../../types";
import { MarketAppHeader } from "./MarketAppHeader";
import { SearchBar } from "./SearchBar";
import { CategoryChips } from "./CategoryChips";
import { QuickActions } from "./QuickActions";
import { ListingCard } from "./ListingCard";
import { FilterSheetModal, FilterState } from "./FilterSheetModal";
import { ProductDetailModal } from "./ProductDetailModal";
import { NewListingWizardModal } from "./NewListingWizardModal";
import { MarketBottomNavigation, MarketNavTab } from "./MarketBottomNavigation";
import { MarketplaceMessagesView } from "./MarketplaceMessagesView";
import { MarketplaceProfileView } from "./MarketplaceProfileView";
import { EmptyState } from "./EmptyState";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { Sparkles, Users, Layers, ArrowRight } from "lucide-react";

interface MarketplaceMainProps {
  products: AgriProductListing[];
  onAddProduct: (prod: AgriProductListing) => void;
  jobs: JobListing[];
  crews: CrewLeaderProfile[];
  workers: WorkerProfile[];
  services: ServiceProvider[];
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  userName?: string;
  userPhone?: string;
  onNavigateTab: (tab: string) => void;
  onOpenPrivacy: () => void;
  onOpenSettings: () => void;
  onOpenLegacyMarketplace?: () => void;
}

export const MarketplaceMain: React.FC<MarketplaceMainProps> = ({
  products,
  onAddProduct,
  jobs,
  crews,
  workers,
  services,
  currentRole,
  onRoleChange,
  userName = "Ahmet Kavalcı",
  userPhone = "0532 411 28 53",
  onNavigateTab,
  onOpenPrivacy,
  onOpenSettings,
  onOpenLegacyMarketplace,
}) => {
  // Navigation Tab: home | explore | new_listing | messages | profile
  const [navTab, setNavTab] = useState<MarketNavTab>("home");

  // Search & Category
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<AgriCategory>("all");

  // Sub-filter inside Home/Explore: "products" | "jobs" | "crews"
  const [marketSection, setMarketSection] = useState<"all" | "products" | "jobs" | "crews">("all");

  // Filter Sheet State
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    category: "all",
    city: "Tümü",
    district: "Tümü",
    minPrice: "",
    maxPrice: "",
    sellerType: "all",
    verifiedOnly: false,
    sortBy: "newest",
  });

  // Favorites state (stored in memory / local)
  const [favoriteIds, setFavoriteIds] = useState<string[]>(["prod-1", "prod-2"]);
  const [viewOnlyFavorites, setViewOnlyFavorites] = useState(false);
  const [viewOnlyMyListings, setViewOnlyMyListings] = useState(false);

  // Modals state
  const [selectedDetailItem, setSelectedDetailItem] = useState<AgriProductListing | JobListing | null>(null);
  const [isNewListingWizardOpen, setIsNewListingWizardOpen] = useState(false);

  // Messages state
  const [messages, setMessages] = useState<MarketMessage[]>([
    {
      id: "msg-1",
      listingId: "prod-1",
      listingTitle: "Kabuklu Fındık (Yeni Sezon Randımanlı)",
      contactName: "Mustafa Çakır",
      contactPhone: "0544 322 19 28",
      lastMessage: "Merhaba, 10 çuval için yarın Çarşamba merkezde teslimat yapabiliriz.",
      timestamp: "14:25",
      unread: true,
    },
    {
      id: "msg-2",
      listingId: "j-1",
      listingTitle: "3. Sürüm Çay Hasadı İçin 5 Kişilik Ekip",
      contactName: "Çavuş Mehmet Yılmaz",
      contactPhone: "0535 882 14 00",
      lastMessage: "Ekibimiz hazır, teleferik kontrolünü tamamladınız mı?",
      timestamp: "Dün",
      unread: false,
    },
  ]);

  const toggleFavorite = (id: string) => {
    setFavoriteIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSendMessage = (listingId: string, text: string) => {
    const targetProduct = products.find((p) => p.id === listingId);
    const targetJob = jobs.find((j) => j.id === listingId);
    const title = targetProduct ? targetProduct.title : targetJob ? targetJob.title : "Tarımsal İlan";
    const name = targetProduct ? targetProduct.sellerName : targetJob ? targetJob.employerName : "Üretici";
    const phone = targetProduct ? targetProduct.sellerPhone : targetJob ? targetJob.employerPhone : "05320000000";

    const newMsg: MarketMessage = {
      id: `msg-${Date.now()}`,
      listingId,
      listingTitle: title,
      contactName: name,
      contactPhone: phone,
      lastMessage: text,
      timestamp: "Şimdi",
      unread: false,
    };

    setMessages((prev) => [newMsg, ...prev]);
  };

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.category !== "all") count++;
    if (filters.city !== "Tümü") count++;
    if (filters.district !== "Tümü") count++;
    if (filters.minPrice || filters.maxPrice) count++;
    if (filters.sellerType !== "all") count++;
    if (filters.verifiedOnly) count++;
    return count;
  }, [filters]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      // My Listings filter
      if (viewOnlyMyListings && item.sellerPhone !== userPhone && !item.id.includes("user")) {
        return false;
      }
      // Favorites filter
      if (viewOnlyFavorites && !favoriteIds.includes(item.id)) {
        return false;
      }
      // Category Chip
      if (selectedCategory !== "all" && selectedCategory !== "labor") {
        if (item.category !== selectedCategory) return false;
      }
      // Modal Filter Category
      if (filters.category !== "all" && filters.category !== "labor") {
        if (item.category !== filters.category) return false;
      }
      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchSeller = item.sellerName.toLowerCase().includes(q);
        const matchCity = item.locationCity.toLowerCase().includes(q);
        const matchDist = item.locationDistrict.toLowerCase().includes(q);
        if (!matchTitle && !matchSeller && !matchCity && !matchDist) return false;
      }
      // City / District
      if (filters.city !== "Tümü" && item.locationCity !== filters.city) return false;
      if (filters.district !== "Tümü" && item.locationDistrict !== filters.district) return false;
      // Price range
      if (filters.minPrice && item.price < Number(filters.minPrice)) return false;
      if (filters.maxPrice && item.price > Number(filters.maxPrice)) return false;
      // Seller type
      if (filters.sellerType !== "all" && item.sellerType !== filters.sellerType) return false;
      // Verified only
      if (filters.verifiedOnly && !item.verified) return false;

      return true;
    }).sort((a, b) => {
      if (filters.sortBy === "price_asc") return a.price - b.price;
      if (filters.sortBy === "price_desc") return b.price - a.price;
      if (filters.sortBy === "rating") return b.rating - a.rating;
      return 0; // default newest
    });
  }, [products, selectedCategory, searchQuery, filters, viewOnlyFavorites, viewOnlyMyListings, favoriteIds, userPhone]);

  // Filtered Jobs
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      if (selectedCategory !== "all" && selectedCategory !== "labor") return false;
      if (viewOnlyFavorites && !favoriteIds.includes(job.id)) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = job.title.toLowerCase().includes(q);
        const matchEmp = job.employerName.toLowerCase().includes(q);
        const matchCity = job.locationCity.toLowerCase().includes(q);
        const matchDist = job.locationDistrict.toLowerCase().includes(q);
        if (!matchTitle && !matchEmp && !matchCity && !matchDist) return false;
      }
      if (filters.city !== "Tümü" && job.locationCity !== filters.city) return false;
      if (filters.district !== "Tümü" && job.locationDistrict !== filters.district) return false;
      return true;
    });
  }, [jobs, selectedCategory, searchQuery, filters, viewOnlyFavorites, favoriteIds]);

  const totalResultsCount = filteredProducts.length + (selectedCategory === "all" || selectedCategory === "labor" ? filteredJobs.length : 0);

  const resetAllFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setViewOnlyFavorites(false);
    setViewOnlyMyListings(false);
    setFilters({
      category: "all",
      city: "Tümü",
      district: "Tümü",
      minPrice: "",
      maxPrice: "",
      sellerType: "all",
      verifiedOnly: false,
      sortBy: "newest",
    });
  };

  // Handle bottom navigation tab switch
  const handleNavTabChange = (tab: MarketNavTab) => {
    if (tab === "new_listing") {
      setIsNewListingWizardOpen(true);
      return;
    }
    setNavTab(tab);
    if (tab === "home") {
      setViewOnlyFavorites(false);
      setViewOnlyMyListings(false);
    }
  };

  const unreadCount = messages.filter((m) => m.unread).length;

  return (
    <div className="min-h-screen bg-[#071C17] text-[#C7DDD0] flex flex-col selection:bg-[#20C878] selection:text-[#071C17]">
      {/* 1. Üst App Bar */}
      <MarketAppHeader
        currentRole={currentRole}
        onRoleChange={onRoleChange}
        userName={userName}
        unreadNotificationsCount={unreadCount}
        onOpenPrivacy={onOpenPrivacy}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-4 space-y-4 pb-28">
        {/* VIEW 1: Ana Sayfa / Keşfet */}
        {(navTab === "home" || navTab === "explore") && (
          <div className="space-y-4">
            {/* 2. Arama ve Filtre Çubuğu (Min 48px yükseklik) */}
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onOpenFilter={() => setIsFilterOpen(true)}
              activeFilterCount={activeFilterCount}
              placeholder="Ürün, ilçe veya üretici ara..."
            />

            {/* Yatay Kaydırılabilir Kategori Chip'leri (Min 36px yükseklik) */}
            <CategoryChips
              selectedCategory={selectedCategory}
              onSelectCategory={(cat) => {
                setSelectedCategory(cat);
                setViewOnlyFavorites(false);
                setViewOnlyMyListings(false);
              }}
            />

            {/* 3. Hızlı Aksiyonlar (En fazla 3 aksiyon: İlan Ver, İlanlarım, Favorilerim) */}
            {navTab === "home" && !searchQuery && selectedCategory === "all" && !viewOnlyFavorites && !viewOnlyMyListings && (
              <QuickActions
                onOpenNewListing={() => setIsNewListingWizardOpen(true)}
                onOpenMyListings={() => {
                  setViewOnlyMyListings(true);
                  setViewOnlyFavorites(false);
                }}
                onOpenFavorites={() => {
                  setViewOnlyFavorites(true);
                  setViewOnlyMyListings(false);
                }}
                favoriteCount={favoriteIds.length}
                myListingsCount={products.filter((p) => p.id.includes("user")).length}
              />
            )}

            {/* Active Mode Notice (Favorilerim / İlanlarım) */}
            {(viewOnlyFavorites || viewOnlyMyListings) && (
              <div className="p-3 rounded-[14px] bg-[#10352B] border border-[#20C878]/30 flex items-center justify-between text-xs">
                <span className="font-extrabold text-[#F5FFF8]">
                  {viewOnlyFavorites ? "❤️ Kaydettiğin Favori İlanlar" : "📄 Yayındaki İlanların"}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setViewOnlyFavorites(false);
                    setViewOnlyMyListings(false);
                  }}
                  className="font-bold text-[#20C878] hover:underline"
                >
                  Tüm İlanlara Dön
                </button>
              </div>
            )}

            {/* Section Switcher Tabs: Tüm İlanlar vs Tarım Ürünleri vs Hasat & İş Gücü */}
            <div className="flex items-center justify-between gap-2 border-b border-[#20C878]/15 pb-2 pt-1 flex-wrap">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                <button
                  type="button"
                  onClick={() => setMarketSection("all")}
                  className={`px-3 py-1.5 rounded-[10px] text-xs font-bold transition-all ${
                    marketSection === "all"
                      ? "bg-[#124235] text-[#20C878] border border-[#20C878]/40"
                      : "text-[#8BAF9B] hover:text-[#F5FFF8]"
                  }`}
                >
                  Tüm İlanlar ({totalResultsCount})
                </button>

                <button
                  type="button"
                  onClick={() => setMarketSection("products")}
                  className={`px-3 py-1.5 rounded-[10px] text-xs font-bold transition-all ${
                    marketSection === "products"
                      ? "bg-[#124235] text-[#20C878] border border-[#20C878]/40"
                      : "text-[#8BAF9B] hover:text-[#F5FFF8]"
                  }`}
                >
                  Tarımsal Ürünler ({filteredProducts.length})
                </button>

                <button
                  type="button"
                  onClick={() => setMarketSection("jobs")}
                  className={`px-3 py-1.5 rounded-[10px] text-xs font-bold transition-all ${
                    marketSection === "jobs"
                      ? "bg-[#124235] text-[#20C878] border border-[#20C878]/40"
                      : "text-[#8BAF9B] hover:text-[#F5FFF8]"
                  }`}
                >
                  Hasat & İş Gücü ({filteredJobs.length})
                </button>
              </div>

              {onOpenLegacyMarketplace && (
                <button
                  type="button"
                  onClick={onOpenLegacyMarketplace}
                  className="text-[11px] font-bold text-[#8FE3AE] hover:text-[#20C878] flex items-center gap-1 shrink-0 ml-auto"
                  title="Eski işgücü ve başvuru panelini aç"
                >
                  <span>Çavuş & İşçi Paneli</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* LISTINGS STREAM */}
            {totalResultsCount === 0 ? (
              <EmptyState
                title="Aramana uygun ilan bulunamadı"
                description="Farklı bir ürün adı veya ilçe deneyebilir ya da filtreleri temizleyerek tüm üretici ilanlarını görebilirsin."
                onClearFilters={resetAllFilters}
              />
            ) : (
              <div className="space-y-3.5">
                {/* 1. Products Section */}
                {(marketSection === "all" || marketSection === "products") &&
                  filteredProducts.map((prod) => (
                    <ListingCard
                      key={prod.id}
                      product={prod}
                      isFavorite={favoriteIds.includes(prod.id)}
                      onToggleFavorite={toggleFavorite}
                      onViewDetails={(item) => setSelectedDetailItem(item)}
                    />
                  ))}

                {/* 2. Labor Jobs Section */}
                {(marketSection === "all" || marketSection === "jobs") &&
                  (selectedCategory === "all" || selectedCategory === "labor") &&
                  filteredJobs.map((job) => (
                    <ListingCard
                      key={job.id}
                      job={job}
                      isFavorite={favoriteIds.includes(job.id)}
                      onToggleFavorite={toggleFavorite}
                      onViewDetails={(item) => setSelectedDetailItem(item)}
                    />
                  ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: Mesajlar */}
        {navTab === "messages" && (
          <MarketplaceMessagesView
            messages={messages}
            onSendMessage={handleSendMessage}
          />
        )}

        {/* VIEW 3: Profil */}
        {navTab === "profile" && (
          <MarketplaceProfileView
            currentRole={currentRole}
            onRoleChange={onRoleChange}
            userName={userName}
            userPhone={userPhone}
            onNavigateTab={onNavigateTab}
            onOpenMyListings={() => {
              setViewOnlyMyListings(true);
              setNavTab("home");
            }}
            onOpenFavorites={() => {
              setViewOnlyFavorites(true);
              setNavTab("home");
            }}
            onOpenPrivacy={onOpenPrivacy}
            onOpenSettings={onOpenSettings}
            favoriteCount={favoriteIds.length}
            myListingsCount={products.filter((p) => p.id.includes("user")).length}
          />
        )}
      </main>

      {/* 5. Alt Navigasyon (Sabit 5 Sekme, Güvenli Alan Uyumlu) */}
      <MarketBottomNavigation
        activeTab={navTab}
        onTabChange={handleNavTabChange}
        unreadMessagesCount={unreadCount}
      />

      {/* Filter Bottom Sheet / Modal */}
      <FilterSheetModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        onApplyFilters={setFilters}
        onResetFilters={resetAllFilters}
        totalResultsCount={totalResultsCount}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        item={selectedDetailItem}
        isOpen={Boolean(selectedDetailItem)}
        onClose={() => setSelectedDetailItem(null)}
        isFavorite={selectedDetailItem ? favoriteIds.includes(selectedDetailItem.id) : false}
        onToggleFavorite={toggleFavorite}
        onSendMessage={handleSendMessage}
      />

      {/* 6 Adımlı İlan Verme Akışı Modal */}
      <NewListingWizardModal
        isOpen={isNewListingWizardOpen}
        onClose={() => setIsNewListingWizardOpen(false)}
        onPublish={(newProd) => {
          onAddProduct(newProd);
          setViewOnlyMyListings(true);
          setNavTab("home");
        }}
      />
    </div>
  );
};
