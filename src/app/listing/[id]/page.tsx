"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { format, differenceInCalendarDays, addDays } from "date-fns";
import { ArrowLeft, MapPin, Star, Calendar, CheckCircle, Tractor } from "lucide-react";
import api from "@/lib/axios";
import { Equipment, Booking } from "@/types";
import { formatCurrency, calculatePricing } from "@/lib/utils";
import AppLayout from "@/components/layout/AppLayout";
import AuthGuard from "@/components/auth/AuthGuard";
import Button from "@/components/ui/Button";
import PricingBreakdown from "@/components/booking/PricingBreakdown";
import { Skeleton } from "@/components/ui/Skeleton";

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => { open: () => void };
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name?: string;
  description?: string;
  handler: (response: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => void;
  modal?: { ondismiss: () => void };
}

function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function ListingPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"ONLINE" | "COD">("ONLINE");
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    api
      .get(`/equipments/${id}`)
      .then((res) => setEquipment(res.data.data))
      .catch(() => toast.error("Equipment not found"))
      .finally(() => setLoading(false));
  }, [id]);

  const totalDays =
    startDate && endDate
      ? Math.max(1, differenceInCalendarDays(new Date(endDate), new Date(startDate)))
      : 0;

  // ✅ derive correct fields from backend response
  const equipmentId = equipment?._id ?? equipment?.id ?? "";
  const equipmentName = equipment?.title ?? equipment?.name ?? "Equipment";
  const equipmentPrice = equipment?.pricePerDay ?? equipment?.price ?? 0;
  const equipmentType = equipment?.type ?? equipment?.category ?? "";
  const isAvailable = equipment?.isActive ?? equipment?.isAvailable ?? false;

  const locationDisplay =
    equipment?.address ||
    (equipment?.location && typeof equipment.location !== "string" &&
    equipment.location?.coordinates
      ? `${equipment.location.coordinates[1].toFixed(4)}, ${equipment.location.coordinates[0].toFixed(4)}`
      : typeof equipment?.location === "string"
      ? equipment.location
      : "Location unavailable");

  const handleBook = useCallback(async () => {
  if (!equipment || !startDate || !endDate || booked) return;
  setBooking(true);

  try {
    const res = await api.post<{ success: boolean; data: { booking: Booking; rzpOrder?: { id: string; amount: number; currency: string } } }>("/bookings", {
      equipmentId: equipmentId,
      startDate: new Date(startDate).toISOString(),   // ✅ ISO format required
      endDate: new Date(endDate).toISOString(),         // ✅ ISO format required
      paymentMethod,                                    // ✅ "ONLINE" | "COD" matches enum
    });

    const { booking, rzpOrder } = res.data.data;       // ✅ correct destructure

    if (paymentMethod === "COD") {
      setBooked(true);
      toast.success("Booking confirmed! Pay on delivery.");
      return;
    }

    // ONLINE — open Razorpay
    const rzpLoaded = await loadRazorpay();
    if (!rzpLoaded) {
      toast.error("Payment gateway failed to load");
      setBooking(false);
      return;
    }

    const options: RazorpayOptions = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY!,
      amount: rzpOrder!.amount,
      currency: rzpOrder!.currency,
      order_id: rzpOrder!.id,
      name: "AgriRent",
      description: equipmentName,
      handler: async (response) => {
        try {
          await api.post("/bookings/verify", {
            // ✅ backend verifyPaymentSchema only needs these 3 fields
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          setBooked(true);
          toast.success("Payment successful! Booking confirmed.");
        } catch {
          toast.error("Payment verification failed. Contact support.");
        }
      },
      modal: {
        ondismiss: () => {
          toast("Payment cancelled");
          setBooking(false);
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  } catch (err: unknown) {
    const msg =
      (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
      "Booking failed. Try again.";
    toast.error(msg);
    setBooking(false);
  }
}, [equipment, startDate, endDate, paymentMethod, booked, equipmentId, equipmentName]);

  const today = format(new Date(), "yyyy-MM-dd");
  const minEnd = startDate
    ? format(addDays(new Date(startDate), 1), "yyyy-MM-dd")
    : today;

  if (loading) {
    return (
      <AuthGuard>
        <AppLayout>
          <div className="px-5 py-6 space-y-4">
            <Skeleton className="h-64 w-full rounded-3xl" />
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-32 w-full" />
          </div>
        </AppLayout>
      </AuthGuard>
    );
  }

  if (!equipment) {
    return (
      <AuthGuard>
        <AppLayout>
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <Tractor size={48} className="text-earth-300" />
            <p className="text-earth-500">Equipment not found</p>
            <Button variant="ghost" onClick={() => router.back()}>
              Go back
            </Button>
          </div>
        </AppLayout>
      </AuthGuard>
    );
  }

  if (booked) {
    return (
      <AuthGuard>
        <AppLayout>
          <div className="flex flex-col items-center justify-center min-h-[70dvh] px-8 text-center animate-slide-up">
            <div className="w-24 h-24 bg-sage-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle size={48} className="text-sage-500" strokeWidth={1.5} />
            </div>
            <h2 className="font-display text-2xl text-bark font-bold mb-2">
              Booking Confirmed!
            </h2>
            <p className="text-earth-500 text-sm mb-2">
              {equipmentName} — {totalDays} day{totalDays !== 1 ? "s" : ""}
            </p>
            <p className="text-earth-400 text-xs mb-8">
              {format(new Date(startDate), "dd MMM")} →{" "}
              {format(new Date(endDate), "dd MMM yyyy")}
            </p>
            <Button onClick={() => router.push("/profile")} className="w-full max-w-xs">
              View My Bookings
            </Button>
            <Button
              variant="ghost"
              onClick={() => router.push("/")}
              className="mt-3 w-full max-w-xs"
            >
              Browse More
            </Button>
          </div>
        </AppLayout>
      </AuthGuard>
    );
  }

  const images = equipment.images?.length
    ? equipment.images
    : ["/placeholder-equipment.jpg"];

  return (
    <AuthGuard>
      <AppLayout>
        <div className="flex flex-col">
          {/* Image gallery */}
          <div className="relative h-72 bg-earth-100">
            <Image
              src={images[activeImage]}
              alt={equipmentName}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw"
              priority
            />
            <button
              onClick={() => router.back()}
              className="absolute top-12 left-4 w-10 h-10 bg-white/90 backdrop-blur rounded-2xl flex items-center justify-center shadow-soft"
            >
              <ArrowLeft size={18} className="text-bark" />
            </button>
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === activeImage ? "bg-white w-6" : "bg-white/50"
                    }`}
                  />
                ))}
              </div>
            )}
            {images.length > 1 && (
              <div className="absolute bottom-12 left-4 right-4 flex gap-2 overflow-x-auto hide-scrollbar">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`shrink-0 w-14 h-10 rounded-xl overflow-hidden border-2 transition-all ${
                      i === activeImage ? "border-white" : "border-transparent opacity-60"
                    }`}
                  >
                    <Image
                      src={img}
                      alt=""
                      width={56}
                      height={40}
                      className="object-cover w-full h-full"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="px-5 pt-6 space-y-5">
            <div>
              <div className="flex items-start justify-between gap-3 mb-1">
                <h1 className="font-display text-2xl text-bark font-bold leading-tight flex-1">
                  {equipmentName} {/* ✅ */}
                </h1>
                <span className="bg-earth-100 text-earth-600 text-xs font-medium px-3 py-1.5 rounded-full shrink-0">
                  {equipmentType} {/* ✅ */}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm text-earth-500">
                <span className="flex items-center gap-1">
                  <MapPin size={13} />
                  {locationDisplay} {/* ✅ */}
                </span>
                {equipment.rating && (
                  <span className="flex items-center gap-1">
                    <Star size={13} className="fill-clay-400 text-clay-400" />
                    {equipment.rating.toFixed(1)}
                    {equipment.reviewCount && (
                      <span className="text-earth-400">({equipment.reviewCount})</span>
                    )}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="font-display text-3xl font-bold text-sage-600">
                {formatCurrency(equipmentPrice)} {/* ✅ */}
              </span>
              <span className="text-earth-400">/day</span>
            </div>

            {equipment.description && (
              <div>
                <h3 className="font-semibold text-bark mb-1.5">About</h3>
                <p className="text-earth-600 text-sm leading-relaxed">
                  {equipment.description}
                </p>
              </div>
            )}

            {/* Date selection */}
            <div>
              <h3 className="font-semibold text-bark mb-3 flex items-center gap-2">
                <Calendar size={16} className="text-sage-500" /> Select Dates
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-earth-500 mb-1 block">Start Date</label>
                  <input
                    type="date"
                    min={today}
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      if (endDate && e.target.value >= endDate) setEndDate("");
                    }}
                    className="w-full px-3 py-3 bg-white border border-earth-200 rounded-2xl text-bark text-sm focus:outline-none focus:ring-2 focus:ring-sage-300 transition"
                  />
                </div>
                <div>
                  <label className="text-xs text-earth-500 mb-1 block">End Date</label>
                  <input
                    type="date"
                    min={minEnd}
                    value={endDate}
                    disabled={!startDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-3 bg-white border border-earth-200 rounded-2xl text-bark text-sm focus:outline-none focus:ring-2 focus:ring-sage-300 transition disabled:opacity-40"
                  />
                </div>
              </div>
            </div>

            {/* Pricing */}
            {totalDays > 0 && (
              <div className="animate-slide-up">
                <PricingBreakdown pricePerDay={equipmentPrice} totalDays={totalDays} /> {/* ✅ */}
              </div>
            )}

            {/* Payment method */}
            <div>
              <h3 className="font-semibold text-bark mb-3">Payment Method</h3>
              <div className="grid grid-cols-2 gap-3">
                {(["ONLINE", "COD"] as const).map((method) => (
                  <button
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    className={`py-3 px-4 rounded-2xl border text-sm font-medium transition-all ${
                      paymentMethod === method
                        ? "bg-sage-500 text-white border-sage-500"
                        : "bg-white text-earth-600 border-earth-200"
                    }`}
                  >
                    {method === "ONLINE" ? "💳 Online" : "💵 Cash on Delivery"}
                  </button>
                ))}
              </div>
            </div>

            {/* Book button */}
            <Button
              size="lg"
              onClick={handleBook}
              disabled={!startDate || !endDate || !isAvailable || booked || booking} // ✅
              loading={booking}
              className="w-full mb-4"
            >
              {!isAvailable // ✅
                ? "Not Available"
                : booked
                ? "Booked!"
                : `Rent Now — ${
                    totalDays > 0
                      ? formatCurrency(calculatePricing(equipmentPrice, totalDays).total)
                      : "Select Dates"
                  }`}
            </Button>
          </div>
        </div>
      </AppLayout>
    </AuthGuard>
  );
}