import React from "react";
import { Link, useLocation } from "@tanstack/react-router";
import {
  Flame,
  LayoutDashboard,
  Map as MapIcon,
  LineChart,
  FileText,
  Link2,
  Leaf,
  Bell,
  Radio,
  ExternalLink,
} from "lucide-react";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    { label: "Live Map", href: "/map", icon: MapIcon },
    { label: "Risk Analysis (FWI)", href: "/risk", icon: LineChart },
    { label: "Incident Reports", href: "/reports", icon: FileText },
    { label: "Blockchain Audit Trail", href: "/audit", icon: Link2 },
    { label: "Carbon Accounting (IPCC)", href: "/emissions", icon: Leaf },
  ];

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans antialiased">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-sidebar p-4 lg:flex sticky top-0 h-screen">
        <div className="mb-6 flex items-center gap-2.5 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/20 text-primary border border-primary/30 shadow-[0_0_12px_rgba(239,68,68,0.3)]">
            <Flame className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold tracking-tight">
              FireChain <span className="text-primary">AI</span>
            </h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
              ClimateChain Hub
            </p>
          </div>
        </div>

        {/* Live Status indicator */}
        <div className="mb-4 flex items-center justify-between rounded-lg border border-border/80 bg-muted/40 px-3 py-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-medium text-foreground">NASA FIRMS Live</span>
          </div>
          <span className="text-[10px] text-muted-foreground font-mono">VIIRS NRT</span>
        </div>

        {/* Nav Links */}
        <nav className="space-y-1.5 flex-1">
          {navItems.map((item) => {
            const isActive = currentPath === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25 font-semibold"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-primary-foreground" : "text-muted-foreground"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Blockchain Status Footer */}
        <div className="mt-auto space-y-3 pt-4 border-t border-border">
          <div className="rounded-lg border border-border/60 bg-card p-3 text-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-foreground">Polygon Amoy</span>
              <span className="h-1.5 w-1.5 rounded-full bg-success"></span>
            </div>
            <p className="text-[11px] text-muted-foreground font-mono truncate">
              0x3F88...A9B0
            </p>
            <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
              <span>Smart Contract Verified</span>
              <Link2 className="h-3 w-3 text-primary" />
            </div>
          </div>
          <p className="text-center text-[10px] text-muted-foreground">
            FireChain AI &copy; IEEE ClimateChain 2026
          </p>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur lg:px-6">
          <div className="flex items-center gap-3 lg:hidden">
            <Flame className="h-6 w-6 text-primary" />
            <span className="font-bold">FireChain AI</span>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-xs text-muted-foreground">
            <Radio className="h-3.5 w-3.5 text-primary animate-pulse" />
            <span>Surveillance Zone: <b>Kalimantan Peatlands & Protected Forests</b></span>
          </div>

          {/* Mobile Nav Links */}
          <div className="flex lg:hidden gap-1 overflow-x-auto text-xs py-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`rounded px-2.5 py-1 ${
                  currentPath === item.href ? "bg-primary text-primary-foreground font-medium" : "text-muted-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground">
              <span>Operational Date:</span>
              <b className="font-mono text-foreground">
                {new Date().toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
              </b>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              <span className="font-medium text-foreground">Command Operator</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
