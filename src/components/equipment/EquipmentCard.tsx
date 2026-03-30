"use client";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Star } from "lucide-react";
import { Equipment } from "@/types";
import { formatCurrency, formatDistance } from "@/lib/utils";

interface EquipmentCardProps {
  equipment: Equipment;
}

export default function EquipmentCard({ equipment }: EquipmentCardProps) {
  const image = equipment.images?.[0] || "/placeholder-equipment.jpg";

  // ✅ handle both field name variants
  const price = equipment.pricePerDay ?? equipment.price ?? 0;
  const isAvailable = equipment.isActive ?? equipment.isAvailable ?? true;
  const displayName = equipment.title ?? equipment.name ?? "Equipment";

  // ✅ handle GeoJSON location
  const locationDisplay =
    typeof equipment.location === "string"
      ? equipment.location
      : equipment.address ||
        (equipment.location?.coordinates
          ? `${equipment.location.coordinates[1].toFixed(4)}, ${equipment.location.coordinates[0].toFixed(4)}`
          : "Location unavailable");

  return (
    <Link href={`/listing/${equipment._id ?? equipment.id}`} className="block">
      <div className="bg-white rounded-3xl overflow-hidden shadow-soft active:scale-[0.98] transition-transform duration-150">
        <div className="relative h-48 w-full bg-earth-100">
          <Image
            src={image}
            alt={displayName}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 400px"
          />
          <div className="absolute top-3 left-3">
            <span className="bg-white/90 backdrop-blur-sm text-xs font-semibold px-3 py-1.5 rounded-full text-sage-700 border border-sage-200">
              {equipment.type ?? equipment.category}
            </span>
          </div>
          {/* ✅ use isActive */}
          {!isAvailable && (
            <div className="absolute inset-0 bg-bark/40 flex items-center justify-center">
              <span className="bg-white text-bark text-sm font-semibold px-4 py-2 rounded-full">
                Unavailable
              </span>
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-display text-lg text-bark font-semibold leading-tight mb-1 truncate">
            {displayName}
          </h3>
          <div className="flex items-center gap-1 text-earth-500 text-sm mb-3">
            <MapPin size={12} />
            <span className="truncate">{locationDisplay}</span>
            {equipment.distance !== undefined && (
              <span className="ml-auto text-xs text-earth-400 shrink-0">
                {formatDistance(equipment.distance)}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <div>
              {/* ✅ use pricePerDay */}
              <span className="text-xl font-display font-bold text-sage-600">
                {formatCurrency(price)}
              </span>
              <span className="text-earth-400 text-sm">/day</span>
            </div>
            {equipment.rating && (
              <div className="flex items-center gap-1 text-sm text-earth-500">
                <Star size={13} className="fill-clay-400 text-clay-400" />
                <span className="font-medium">{equipment.rating.toFixed(1)}</span>
                {equipment.reviewCount && (
                  <span className="text-earth-400">({equipment.reviewCount})</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}