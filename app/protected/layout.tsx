import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import Link from "next/link";
import { Suspense } from "react";
import { LayoutDashboard, ReceiptText, PiggyBank, Wallet, Tags } from "lucide-react";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const menuItems = [
    {
      href: "/protected",
      label: "Tổng Quan",
      icon: LayoutDashboard,
    },
    {
      href: "/protected/transactions",
      label: "Lịch Sử",
      icon: ReceiptText,
    },
    {
      href: "/protected/budgets",
      label: "Ngân Sách",
      icon: PiggyBank,
    },
    {
      href: "/protected/categories",
      label: "Danh Mục",
      icon: Tags,
    },
  ];

  return (
    <div className="min-h-screen flex w-full bg-background text-foreground">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card/50 backdrop-blur-md">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <Link href="/protected" className="flex items-center gap-2 font-bold text-lg text-primary">
            <Wallet className="h-6 w-6 text-primary" />
            <span>Chi Tiêu Cá Nhân</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground text-muted-foreground"
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border flex flex-col gap-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground px-2">
            <span>Giao diện</span>
            <ThemeSwitcher />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 border-b border-border bg-card/30 backdrop-blur-md flex items-center justify-between px-6 z-10">
          {/* Mobile Nav Header */}
          <div className="flex items-center gap-2 md:hidden">
            <Link href="/protected" className="flex items-center gap-2 font-bold text-base text-primary">
              <Wallet className="h-5 w-5 text-primary" />
              <span>Chi Tiêu</span>
            </Link>
          </div>

          <div className="hidden md:block">
            {/* Quick status message */}
            <span className="text-sm text-muted-foreground font-medium">Chào mừng trở lại!</span>
          </div>

          {/* User Profile & Auth Button */}
          <div className="flex items-center gap-4">
            <Suspense fallback={<div className="h-8 w-24 bg-accent animate-pulse rounded-md" />}>
              <AuthButton />
            </Suspense>
          </div>
        </header>

        {/* Mobile Navigation Links */}
        <nav className="flex md:hidden border-b border-border bg-card justify-around py-2 px-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-1 py-1 px-3 rounded-md text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Main Viewport */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
