"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Bot, PlusCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/ai", icon: Bot, label: "AI" },
  { href: "/add", icon: PlusCircle, label: "Add" },
  { href: "/profile", icon: User, label: "Profile" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-cream/95 backdrop-blur-md border-t border-earth-200 pb-safe">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-3 touch-target justify-center transition-all duration-200",
                active ? "text-sage-600" : "text-earth-400"
              )}
            >
              <Icon
                size={22}
                strokeWidth={active ? 2.5 : 1.8}
                className={cn(
                  "transition-transform duration-200",
                  active && "scale-110"
                )}
              />
              <span className={cn("text-[10px] font-body font-medium tracking-wide", active ? "text-sage-600" : "text-earth-400")}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
