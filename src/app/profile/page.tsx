"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  LogOut, Package, Inbox, TrendingUp, ChevronRight,
  Clock, CheckCircle, XCircle, AlertCircle
} from "lucide-react";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/auth";
import { Booking, Equipment, User } from "@/types";
import { formatCurrency } from "@/lib/utils";
import AppLayout from "@/components/layout/AppLayout";
import AuthGuard from "@/components/auth/AuthGuard";
import { Skeleton } from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";

const STATUS_CONFIG = {
  PENDING: { label: "Pending", icon: Clock, color: "text-clay-500 bg-clay-50" },
  CONFIRMED: { label: "Confirmed", icon: CheckCircle, color: "text-sage-600 bg-sage-50" },
  CANCELLED: { label: "Cancelled", icon: XCircle, color: "text-red-500 bg-red-50" },
  COMPLETED: { label: "Completed", icon: CheckCircle, color: "text-earth-500 bg-earth-100" },
};

function StatusBadge({ status }: { status: Booking["status"] }) {
  const { label, icon: Icon, color } = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${color}`}>
      <Icon size={11} />
      {label}
    </span>
  );
}

function BookingCard({ booking }: { booking: Booking }) {
  // ✅ narrow type — backend populates equipment as object
  const equipment: Equipment | null =
    typeof booking.equipment === "string" ? null : (booking.equipment as Equipment) ?? null;

  const image = equipment?.images?.[0];
  const equipmentName = equipment?.title ?? equipment?.name ?? "Equipment";

  // ✅ backend uses totalPrice not totalAmount
  const totalPrice = booking.totalPrice ?? (booking as unknown as { totalAmount?: number }).totalAmount ?? 0;

  // ✅ calculate days from dates instead of totalDays field
  const days = booking.startDate && booking.endDate
    ? Math.ceil(
        (new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) /
        (1000 * 60 * 60 * 24)
      )
    : 0;

  return (
    <div className="bg-white rounded-3xl p-4 shadow-soft">
      <div className="flex gap-3">
        <div className="w-16 h-16 rounded-2xl bg-earth-100 overflow-hidden shrink-0">
          {image ? (
            <Image
              src={image}
              alt={equipmentName}
              width={64}
              height={64}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl">🚜</div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            {/* ✅ use derived equipmentName */}
            <h4 className="font-semibold text-bark text-sm truncate">{equipmentName}</h4>
            <StatusBadge status={booking.status} />
          </div>
          <p className="text-earth-400 text-xs mb-2">
            {format(new Date(booking.startDate), "dd MMM")} →{" "}
            {format(new Date(booking.endDate), "dd MMM yyyy")}
            {days > 0 && ` · ${days} day${days !== 1 ? "s" : ""}`}
          </p>
          <div className="flex items-center justify-between">
            <div>
              {/* ✅ use totalPrice */}
              <span className="text-sage-600 font-display font-semibold text-sm">
                {formatCurrency(totalPrice)}
              </span>
              <span className="text-earth-400 text-xs ml-1">
                (fee: {formatCurrency(booking.platformFee ?? 0)})
              </span>
            </div>
            <span className="text-xs text-earth-400 capitalize">
              {booking.paymentMethod}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

type Tab = "rentals" | "incoming";

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("rentals");

  useEffect(() => {
    api
      .get("/bookings/mine")
      .then((res) => setBookings(res.data.data || []))
      .catch(() => toast.error("Failed to load bookings"))
      .finally(() => setLoading(false));
  }, []);

  // ✅ backend populates renter/owner as objects — use _id
  const userId = user?._id ?? user?.id;
const myRentals = bookings.filter((b) => {
  const renterId =
    typeof b.renter === "string"
      ? b.renter
      : (b.renter as unknown as User)?._id;  // ✅ unknown first
  return renterId === userId;
});

const incoming = bookings.filter((b) => {
  const ownerId =
    typeof b.owner === "string"
      ? b.owner
      : (b.owner as unknown as User)?._id;   // ✅ unknown first
  return ownerId === userId;
});

  // ✅ use totalPrice not totalAmount
  const totalEarnings = incoming
    .filter((b) => b.status === "COMPLETED" || b.status === "CONFIRMED")
    .reduce((sum, b) => sum + ((b.totalPrice ?? 0) - (b.platformFee ?? 0)), 0);

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <AuthGuard>
      <AppLayout>
        <div className="px-5 py-6">
          {/* Profile header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-sage-100 overflow-hidden">
                {user?.avatar ? (
                  <Image
                    src={user.avatar}
                    alt={user.name || ""}
                    width={56}
                    height={56}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl font-display font-bold text-sage-600">
                    {user?.name?.[0]?.toUpperCase() || "U"}
                  </div>
                )}
              </div>
              <div>
                <h2 className="font-display text-xl font-bold text-bark">{user?.name}</h2>
                <p className="text-earth-400 text-xs">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-10 h-10 bg-red-50 rounded-2xl flex items-center justify-center"
            >
              <LogOut size={16} className="text-red-500" />
            </button>
          </div>

          {/* Earnings card */}
          <div className="bg-sage-500 rounded-3xl p-5 mb-6 text-white">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={16} />
              <span className="text-sage-100 text-sm font-medium">Owner Earnings</span>
            </div>
            <p className="font-display text-3xl font-bold mb-3">
              {formatCurrency(totalEarnings)}
            </p>
            <div className="flex gap-4 text-sm">
              <div>
                <p className="text-sage-200 text-xs">Confirmed</p>
                <p className="font-semibold">
                  {incoming.filter((b) => b.status === "CONFIRMED").length}
                </p>
              </div>
              <div>
                <p className="text-sage-200 text-xs">Completed</p>
                <p className="font-semibold">
                  {incoming.filter((b) => b.status === "COMPLETED").length}
                </p>
              </div>
              <div>
                <p className="text-sage-200 text-xs">Platform Paid</p>
                <p className="font-semibold">
                  {/* ✅ fixed reduce */}
                  {formatCurrency(incoming.reduce((s, b) => s + (b.platformFee ?? 0), 0))}
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-earth-100 p-1 rounded-2xl mb-5">
            {(
              [
                { key: "rentals", label: "My Rentals", icon: Package, count: myRentals.length },
                { key: "incoming", label: "Incoming", icon: Inbox, count: incoming.length },
              ] as const
            ).map(({ key, label, icon: Icon, count }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTab === key ? "bg-white text-bark shadow-soft" : "text-earth-500"
                }`}
              >
                <Icon size={14} />
                {label}
                {count > 0 && (
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full ${
                      activeTab === key
                        ? "bg-sage-100 text-sage-600"
                        : "bg-earth-200 text-earth-500"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Booking list */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white rounded-3xl p-4 flex gap-3">
                  <Skeleton className="w-16 h-16 rounded-2xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : activeTab === "rentals" ? (
            myRentals.length === 0 ? (
              <EmptyState
                icon={Package}
                title="No rentals yet"
                description="Browse equipment near you and make your first rental"
                action={
                  <button
                    onClick={() => router.push("/")}
                    className="flex items-center gap-1 text-sage-600 font-medium text-sm"
                  >
                    Browse Equipment <ChevronRight size={16} />
                  </button>
                }
              />
            ) : (
              <div className="space-y-3">
                {/* ✅ use _id as key */}
                {myRentals.map((b) => (
                  <BookingCard key={b._id ?? b.id} booking={b} />
                ))}
              </div>
            )
          ) : incoming.length === 0 ? (
            <EmptyState
              icon={AlertCircle}
              title="No incoming requests"
              description="List your equipment to start receiving rental requests"
              action={
                <button
                  onClick={() => router.push("/add")}
                  className="flex items-center gap-1 text-sage-600 font-medium text-sm"
                >
                  Add Equipment <ChevronRight size={16} />
                </button>
              }
            />
          ) : (
            <div className="space-y-3">
              {incoming.map((b) => (
                <BookingCard key={b._id ?? b.id} booking={b} />
              ))}
            </div>
          )}
        </div>
      </AppLayout>
    </AuthGuard>
  );
}