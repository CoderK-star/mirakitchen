"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, ShoppingCart, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { haptics } from "@/lib/haptics";

const navItems = [
  { href: "/home", label: "ホーム", icon: Home },
  { href: "/recipes", label: "レシピ", icon: BookOpen },
  { href: "/cart", label: "買い物", icon: ShoppingCart },
  { href: "/profile", label: "プロフィール", icon: User },
] as const;

/**
 * ボトムナビゲーションバー (DESIGN.md §9)
 */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 backdrop-blur-sm"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="flex h-16 items-center">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                onClick={() => haptics.light()}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 min-h-[44px] w-full transition",
                  active ? "text-[#FF8C00]" : "text-gray-400"
                )}
                aria-label={label}
                aria-current={active ? "page" : undefined}
              >
                <Icon size={24} strokeWidth={active ? 2.5 : 1.8} />
                {active && (
                  <span className="text-[10px] font-bold leading-tight">{label}</span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
