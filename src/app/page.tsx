"use client";
import { useEffect, useState, Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Bell, Search, Tractor, RefreshCw } from "lucide-react";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/auth";
import { useGeolocation } from "@/hooks/useGeolocation";
import { Equipment } from "@/types";
import AppLayout from "@/components/layout/AppLayout";
import AuthGuard from "@/components/auth/AuthGuard";
import EquipmentCard from "@/components/equipment/EquipmentCard";
import FilterBar from "@/components/equipment/FilterBar";
import { EquipmentCardSkeleton } from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";

function HomeContent() {
  const { lat, lng, loading: geoLoading } = useGeolocation();
  const searchParams = useSearchParams();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const { user } = useAuthStore();

  const category = searchParams.get("category") || "";
  const priceRange = searchParams.get("price") || "";

  const fetchEquipment = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const params: Record<string, string | number> = {};
      if (lat) params.latitude = lat;
      if (lng) params.longitude = lng;
      if (category) params.type = category;
      if (priceRange) {
        const [min, max] = priceRange.split("-");
        if (min) params.minPrice = min;
        if (max && max !== "+") params.maxPrice = max;
      }
      const res = await api.get("/equipments/nearby", { params });
      const ownerId = user?.id ?? (user as unknown as { _id?: string })?._id;
      setEquipment(
        (res.data.data || []).filter((e: Equipment) => {
          const eOwnerId =
            typeof e.owner === "string" ? e.owner : (e.owner as { _id: string })?._id;
          return eOwnerId !== ownerId;
        })
      );
      if (silent) toast.success("Refreshed!");
    } catch {
      toast.error("Failed to load equipment");
      setEquipment([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [lat, lng, category, priceRange, user]);

  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    if (hour < 21) return "Good Evening";
    return "Good Night";
  };

  useEffect(() => {
    if (geoLoading) return;
    fetchEquipment();
  }, [geoLoading, fetchEquipment]);

  const filtered = equipment.filter((e) =>
    search ? (e.title ?? e.name ?? "").toLowerCase().includes(search.toLowerCase()) : true
  );

  const firstName = user?.name?.split(" ")[0] || "Farmer";
  const greeting = getGreeting();

  return (
    <div className="flex flex-col min-h-dvh bg-cream">
      {/* Header */}
      <div className="px-5 pt-12 pb-5 bg-gradient-to-b from-sage-50 to-cream">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs tracking-wide text-earth-400 font-medium">
                {getGreeting()},
              </p>

              <h1 className="font-display text-2xl font-semibold text-bark tracking-tight">
                {firstName}
              </h1>
            </div>
          </div>
          {/* ✅ Refresh button next to bell */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchEquipment(true)}
              disabled={refreshing}
              className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-soft"
            >
              <RefreshCw
                size={16}
                className={`text-earth-600 transition-transform duration-500 ${
                  refreshing ? "animate-spin" : ""
                }`}
              />
            </button>
            <button className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-soft relative">
              <Bell size={18} className="text-earth-600" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-clay-500 rounded-full" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-earth-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tractors, harvesters..."
            className="w-full pl-11 pr-4 py-3.5 bg-white border border-earth-200 rounded-2xl text-bark placeholder:text-earth-300 focus:outline-none focus:ring-2 focus:ring-sage-300 transition shadow-soft"
          />
        </div>

        <Suspense>
          <FilterBar />
        </Suspense>
      </div>

      {/* Equipment Grid */}
      <div className="px-5 pt-4 pb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold text-bark">
            {category || "All Equipment"}
          </h2>
          {!loading && (
            <span className="text-earth-400 text-sm">{filtered.length} found</span>
          )}
        </div>

        {loading || geoLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <EquipmentCardSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Tractor}
            title="No equipment found"
            description="Try adjusting your filters or search for something else"
          />
        ) : (
          <div className="space-y-4">
            {/* ✅ Refreshing overlay */}
            {refreshing && (
              <div className="flex items-center justify-center gap-2 py-2 text-sage-600 text-sm animate-fade-in">
                <RefreshCw size={14} className="animate-spin" />
                <span>Refreshing...</span>
              </div>
            )}
            {filtered.map((item) => (
              <EquipmentCard key={item._id ?? item.id} equipment={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <AuthGuard>
      <AppLayout>
        <Suspense>
          <HomeContent />
        </Suspense>
      </AppLayout>
    </AuthGuard>
  );
}