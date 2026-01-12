import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Database,
  Shield,
  AlertTriangle,
  FileText,
} from "lucide-react";

const navigation = [
  { name: "Models", href: "/", icon: Database },
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Policies", href: "/policies", icon: Shield },
  { name: "Violations", href: "/violations", icon: AlertTriangle },
];

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const location = useLocation();

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow border-r bg-card pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-primary" />
              <div className="ml-3">
                <h1 className="text-lg font-bold text-foreground">
                  AI Governance Hub
                </h1>
                <p className="text-xs text-muted-foreground">
                  Compliance & Risk Management
                </p>
              </div>
            </div>
          </div>
          <nav className="mt-8 flex-1 px-2 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  )}
                >
                  <item.icon
                    className={cn(
                      "mr-3 flex-shrink-0 h-5 w-5",
                      isActive
                        ? "text-primary-foreground"
                        : "text-muted-foreground group-hover:text-accent-foreground",
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="px-4 py-3 border-t">
            <p className="text-xs text-muted-foreground">
              Version 0.7.0 • NIST AI RMF Aligned
            </p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          {children}
        </main>
      </div>
    </div>
  );
}
