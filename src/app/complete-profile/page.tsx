"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/auth";
import Button from "@/components/ui/Button";
import { User, Phone, MapPin, ArrowRight, Loader } from "lucide-react";

export default function CompleteProfilePage() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || "",
    mobileNumber: "",
    address: "",
    latitude: "",
    longitude: "",
  });

  // Auto-fill lat/lng using browser geolocation
  const detectLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported on this device");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((f) => ({
          ...f,
          latitude: pos.coords.latitude.toString(),
          longitude: pos.coords.longitude.toString(),
        }));
        toast.success("Location detected!");
        setLocating(false);
      },
      () => {
        toast.error("Could not detect location. Enter manually.");
        setLocating(false);
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.mobileNumber.trim() || !form.address.trim()) {
      toast.error("Please fill all fields");
      return;
    }
    if (!form.latitude || !form.longitude) {
      toast.error("Please detect or enter your location");
      return;
    }

    setLoading(true);
    try {
      const res = await api.put("/users/complete-profile", {
        name: form.name,
        mobileNumber: form.mobileNumber,   // ✅ matches backend
        address: form.address,              // ✅ matches backend
        latitude: parseFloat(form.latitude),   // ✅ matches backend
        longitude: parseFloat(form.longitude), // ✅ matches backend
      });
      setUser(res.data.data);
      toast.success("Profile saved!");
      router.replace("/");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to save profile";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-cream flex flex-col px-6 py-12 max-w-lg mx-auto">
      <div className="mb-10">
        <h1 className="font-display text-3xl text-bark font-bold mb-2">
          Complete your profile
        </h1>
        <p className="text-earth-500 text-sm">Just a few details to get started</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 flex-1">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-earth-700 mb-1.5">Full Name</label>
          <div className="relative">
            <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-earth-400" />
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Your full name"
              className="w-full pl-11 pr-4 py-3.5 bg-white border border-earth-200 rounded-2xl text-bark placeholder:text-earth-300 focus:outline-none focus:ring-2 focus:ring-sage-300 focus:border-sage-400 transition"
            />
          </div>
        </div>

        {/* Mobile Number */}
        <div>
          <label className="block text-sm font-medium text-earth-700 mb-1.5">
            Mobile Number
          </label>

          <div className="relative">
            <Phone
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-earth-400"
            />

            <input
              type="tel"
              value={form.mobileNumber}
              onChange={(e) => {
                let value = e.target.value.replace(/\D/g, "");
                if (value.length > 10) return;
                setForm((f) => ({ ...f, mobileNumber: value }));
              }}
              placeholder="10-digit mobile number"
              maxLength={10}
              inputMode="numeric"
              pattern="[0-9]{10}"
              className="w-full pl-11 pr-4 py-3.5 bg-white border border-earth-200 rounded-2xl text-bark placeholder:text-earth-300 focus:outline-none focus:ring-2 focus:ring-sage-300 focus:border-sage-400 transition"
            />
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-earth-700 mb-1.5">Address</label>
          <div className="relative">
            <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-earth-400" />
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              placeholder="Village, District, State"
              className="w-full pl-11 pr-4 py-3.5 bg-white border border-earth-200 rounded-2xl text-bark placeholder:text-earth-300 focus:outline-none focus:ring-2 focus:ring-sage-300 focus:border-sage-400 transition"
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-earth-700 mb-1.5">GPS Location</label>
          <button
            type="button"
            onClick={detectLocation}
            disabled={locating}
            className="w-full flex items-center justify-center gap-2 py-3.5 border-2 border-dashed border-earth-300 rounded-2xl text-earth-500 hover:border-sage-400 hover:text-sage-600 transition disabled:opacity-50"
          >
            {locating ? (
              <Loader size={16} className="animate-spin" />
            ) : (
              <MapPin size={16} />
            )}
            {locating
              ? "Detecting location..."
              : form.latitude
              ? `📍 ${parseFloat(form.latitude).toFixed(4)}, ${parseFloat(form.longitude).toFixed(4)}`
              : "Detect my location"}
          </button>

          {/* Manual lat/lng fallback */}
          {!form.latitude && (
            <div className="grid grid-cols-2 gap-3 mt-2">
              <input
                type="number"
                step="any"
                value={form.latitude}
                onChange={(e) => setForm((f) => ({ ...f, latitude: e.target.value }))}
                placeholder="Latitude"
                className="px-4 py-3 bg-white border border-earth-200 rounded-2xl text-bark text-sm placeholder:text-earth-300 focus:outline-none focus:ring-2 focus:ring-sage-300 transition"
              />
              <input
                type="number"
                step="any"
                value={form.longitude}
                onChange={(e) => setForm((f) => ({ ...f, longitude: e.target.value }))}
                placeholder="Longitude"
                className="px-4 py-3 bg-white border border-earth-200 rounded-2xl text-bark text-sm placeholder:text-earth-300 focus:outline-none focus:ring-2 focus:ring-sage-300 transition"
              />
            </div>
          )}
        </div>

        <div className="pt-6">
          <Button type="submit" size="lg" loading={loading} className="w-full">
            <span>Continue</span>
            <ArrowRight size={18} className="ml-2" />
          </Button>
        </div>
      </form>
    </div>
  );
}