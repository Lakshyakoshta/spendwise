"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  {
    name: "Dashboard",
    href: "/dashboard",
  },
  {
    name: "Expenses",
    href: "/expenses",
  },
  {
    name: "Budgets",
    href: "/budgets",
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden min-h-screen w-64 border-r bg-white p-6 md:block">

      <div className="mb-10">
        <h1 className="text-2xl font-bold">
          SpendWise
        </h1>

        <p className="text-sm text-gray-500">
          Personal finance
        </p>
      </div>

      <nav className="space-y-2">

        {links.map((link) => {

          const active =
            pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`block rounded-lg px-4 py-3 text-sm font-medium ${
                active
                  ? "bg-black text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {link.name}
            </Link>
          );
        })}

      </nav>

    </aside>
  );
}