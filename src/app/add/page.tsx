"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, X, ImagePlus, MapPin, Loader } from "lucide-react";
import api from "@/lib/axios";
import { uploadImageToCloudinary } from "@/lib/uploadImage";
import { CATEGORIES } from "@/types";
import AppLayout from "@/components/layout/AppLayout";
import AuthGuard from "@/components/auth/AuthGuard";
import Button from "@/components/ui/Button";

interface FormState {
  title: string;
  type: string;
  pricePerDay: string;
  description: string;
  address: string;
  latitude: string;
  longitude: string;
  availableFrom: string;
  availableTo: string;
}

export default function AddEquipmentPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [form, setForm] = useState<FormState>({
    title: "",
    type: "",
    pricePerDay: "",
    description: "",
    address: "",
    latitude: "",
    longitude: "",
    availableFrom: "",
    availableTo: "",
  });

  const set = (key: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value: string = e.target.value;
      setForm((f) => ({ ...f, [key]: value }));
    };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
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

  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 5 - imageFiles.length);
    setImageFiles((prev) => [...prev, ...files].slice(0, 5));
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPreviews((prev) => [...prev, ev.target?.result as string].slice(0, 5));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (i: number) => {
    setImageFiles((prev) => prev.filter((_, idx) => idx !== i));
    setPreviews((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title.trim() || !form.type || !form.pricePerDay || !form.description.trim()) {
      toast.error("Please fill all required fields");
      return;
    }
    if (!form.latitude || !form.longitude) {
      toast.error("Please detect or enter your location");
      return;
    }
    if (!form.availableFrom || !form.availableTo) {
      toast.error("Please set availability dates");
      return;
    }
    if (new Date(form.availableFrom) >= new Date(form.availableTo)) {
      toast.error("End date must be after start date");
      return;
    }
    if (isNaN(Number(form.pricePerDay)) || Number(form.pricePerDay) <= 0) {
      toast.error("Enter a valid price");
      return;
    }

    setLoading(true);
    try {
      // Step 1 — Upload images to Cloudinary
      let imageUrls: string[] = [];
      if (imageFiles.length > 0) {
        setUploading(true);
        toast("Uploading images...");
        imageUrls = await Promise.all(
          imageFiles.map((file) => uploadImageToCloudinary(file))
        );
        setUploading(false);
      }

      // Step 2 — Post equipment with Cloudinary URLs
      await api.post("/equipments", {
        title: form.title,
        type: form.type,
        pricePerDay: Number(form.pricePerDay),
        description: form.description,
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
        availableFrom: new Date(form.availableFrom).toISOString(), 
        availableTo: new Date(form.availableTo).toISOString(),
        images: imageUrls,
      });

      toast.success("Equipment listed successfully!");
      router.push("/");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to list equipment";
      toast.error(msg);
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <AuthGuard>
      <AppLayout>
        <div className="px-5 py-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-soft"
            >
              <ArrowLeft size={18} className="text-bark" />
            </button>
            <div>
              <h1 className="font-display text-2xl font-bold text-bark">List Equipment</h1>
              <p className="text-earth-400 text-xs">Earn by renting your equipment</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-earth-700 mb-2">
                Photos{" "}
                <span className="text-earth-400 font-normal">(up to 5)</span>
              </label>
              <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
                {previews.map((src, i) => (
                  <div
                    key={i}
                    className="relative shrink-0 w-24 h-24 rounded-2xl overflow-hidden bg-earth-100"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 w-6 h-6 bg-bark/70 rounded-full flex items-center justify-center"
                    >
                      <X size={12} className="text-white" />
                    </button>
                  </div>
                ))}
                {previews.length < 5 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="shrink-0 w-24 h-24 rounded-2xl border-2 border-dashed border-earth-300 flex flex-col items-center justify-center gap-1 text-earth-400 hover:border-sage-400 hover:text-sage-500 transition"
                  >
                    <ImagePlus size={22} strokeWidth={1.5} />
                    <span className="text-xs">Add</span>
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImages}
              />
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-earth-700 mb-1.5">
                Equipment Title <span className="text-clay-500">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={set("title")}
                placeholder="e.g., Mahindra 575 Tractor"
                className="w-full px-4 py-3.5 bg-white border border-earth-200 rounded-2xl text-bark placeholder:text-earth-300 focus:outline-none focus:ring-2 focus:ring-sage-300 transition"
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-earth-700 mb-1.5">
                Type <span className="text-clay-500">*</span>
              </label>
              <select
                value={form.type}
                onChange={set("type")}
                className="w-full px-4 py-3.5 bg-white border border-earth-200 rounded-2xl text-bark focus:outline-none focus:ring-2 focus:ring-sage-300 transition appearance-none"
              >
                <option value="">Select type</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c.toLowerCase()}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-earth-700 mb-1.5">
                Price per Day (₹) <span className="text-clay-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-earth-500 font-medium">
                  ₹
                </span>
                <input
                  type="number"
                  value={form.pricePerDay}
                  onChange={set("pricePerDay")}
                  placeholder="500"
                  min="1"
                  className="w-full pl-8 pr-4 py-3.5 bg-white border border-earth-200 rounded-2xl text-bark placeholder:text-earth-300 focus:outline-none focus:ring-2 focus:ring-sage-300 transition"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-earth-700 mb-1.5">
                Description <span className="text-clay-500">*</span>
              </label>
              <textarea
                value={form.description}
                onChange={set("description")}
                rows={3}
                placeholder="Describe condition, features, usage..."
                className="w-full px-4 py-3.5 bg-white border border-earth-200 rounded-2xl text-bark placeholder:text-earth-300 focus:outline-none focus:ring-2 focus:ring-sage-300 transition resize-none"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-earth-700 mb-1.5">
                Location <span className="text-clay-500">*</span>
              </label>
              <input
                type="text"
                value={form.address}
                onChange={set("address")}
                placeholder="Village, District, State"
                className="w-full px-4 py-3.5 bg-white border border-earth-200 rounded-2xl text-bark placeholder:text-earth-300 focus:outline-none focus:ring-2 focus:ring-sage-300 transition mb-2"
              />
              <button
                type="button"
                onClick={detectLocation}
                disabled={locating}
                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-earth-300 rounded-2xl text-earth-500 hover:border-sage-400 hover:text-sage-600 transition disabled:opacity-50"
              >
                {locating ? (
                  <Loader size={15} className="animate-spin" />
                ) : (
                  <MapPin size={15} />
                )}
                {locating
                  ? "Detecting..."
                  : form.latitude
                  ? `${parseFloat(form.latitude).toFixed(4)}, ${parseFloat(form.longitude).toFixed(4)}`
                  : "Detect GPS location"}
              </button>

              {/* Manual lat/lng fallback if detection fails */}
              {!form.latitude && (
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <input
                    type="number"
                    step="any"
                    value={form.latitude}
                    onChange={set("latitude")}
                    placeholder="Latitude"
                    className="px-4 py-3 bg-white border border-earth-200 rounded-2xl text-bark text-sm placeholder:text-earth-300 focus:outline-none focus:ring-2 focus:ring-sage-300 transition"
                  />
                  <input
                    type="number"
                    step="any"
                    value={form.longitude}
                    onChange={set("longitude")}
                    placeholder="Longitude"
                    className="px-4 py-3 bg-white border border-earth-200 rounded-2xl text-bark text-sm placeholder:text-earth-300 focus:outline-none focus:ring-2 focus:ring-sage-300 transition"
                  />
                </div>
              )}
            </div>

            {/* Availability Dates */}
            <div>
              <label className="block text-sm font-medium text-earth-700 mb-1.5">
                Availability Dates <span className="text-clay-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-earth-400 mb-1 block">From</label>
                  <input
                    type="date"
                    min={today}
                    value={form.availableFrom}
                    onChange={set("availableFrom")}
                    className="w-full px-3 py-3 bg-white border border-earth-200 rounded-2xl text-bark text-sm focus:outline-none focus:ring-2 focus:ring-sage-300 transition"
                  />
                </div>
                <div>
                  <label className="text-xs text-earth-400 mb-1 block">To</label>
                  <input
                    type="date"
                    min={form.availableFrom || today}
                    value={form.availableTo}
                    onChange={set("availableTo")}
                    disabled={!form.availableFrom}
                    className="w-full px-3 py-3 bg-white border border-earth-200 rounded-2xl text-bark text-sm focus:outline-none focus:ring-2 focus:ring-sage-300 transition disabled:opacity-40"
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <Button type="submit" size="lg" loading={loading} className="w-full">
              {uploading ? "Uploading images..." : "List Equipment"}
            </Button>
          </form>
        </div>
      </AppLayout>
    </AuthGuard>
  );
}