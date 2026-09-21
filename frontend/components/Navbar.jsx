"use client";

import { useRouter } from "next/navigation";
import { clearToken } from "@/lib/auth";

export default function Navbar() {
  const router = useRouter();

  function logout() {
    clearToken();
    router.push("/login");
  }

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">

      <div className="md:hidden">
        <span className="font-bold">
          SpendWise
        </span>
      </div>

      <div className="ml-auto flex items-center gap-4">

        <span className="text-sm text-gray-500">
          Account
        </span>

        <button
          onClick={logout}
          className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-100"
        >
          Logout
        </button>

      </div>

    </header>
  );
}