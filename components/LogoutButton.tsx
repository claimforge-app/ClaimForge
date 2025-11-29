"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type LogoutButtonProps = {
  variant?: "light" | "dark";
};

export function LogoutButton({ variant = "dark" }: LogoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      setLoading(true);
      await fetch("/api/logout", {
        method: "POST",
      });
      // Go back to home and refresh so header button switches to "Log in"
      router.push("/");
      router.refresh();
    } catch (err) {
      setLoading(false);
    }
  };

  const baseClasses =
    "px-3 py-1.5 rounded-full text-xs sm:text-sm border transition disabled:opacity-60 disabled:cursor-not-allowed";

  const darkClasses =
    "border-neutral-800 text-neutral-300 hover:bg-neutral-900";

  const lightClasses =
    "border-neutral-700 text-neutral-100 bg-neutral-900 hover:bg-neutral-800";

  const className =
    variant === "light"
      ? `${baseClasses} ${lightClasses}`
      : `${baseClasses} ${darkClasses}`;

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className={className}
    >
      {loading ? "Logging out…" : "Log out"}
    </button>
  );
}
