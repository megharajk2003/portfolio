import React from "react";
import { Menu } from "lucide-react";
import Sidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarLayoutProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  backgroundClassName?: string;
  contentClassName?: string;
  headerClassName?: string;
  headerContent?: React.ReactNode;
  hideHeader?: boolean;
}

/**
 * Reusable layout that renders the app sidebar as an off‑canvas drawer on mobile
 * and a fixed column on desktop. It also provides a consistent sticky header
 * with an optional title, description, and action area.
 */
export function SidebarLayout({
  title,
  description,
  actions,
  children,
  backgroundClassName,
  contentClassName,
  headerClassName,
  headerContent,
  hideHeader = false,
}: SidebarLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const shouldRenderHeader =
    !hideHeader && (title || description || actions || headerContent);

  return (
    <div
      className={cn(
        "relative min-h-screen bg-gray-50 dark:bg-gray-900 mobile-safe-padding",
        backgroundClassName,
      )}
    >
      {/* Mobile overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden",
          sidebarOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none",
        )}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar (drawer on mobile, fixed on desktop) */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0",
        )}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main content */}
      <main className="lg:ml-64 min-h-screen flex flex-col">
        {shouldRenderHeader && (
          <header
            className={cn(
              "sticky top-0 z-30 backdrop-blur bg-white/85 dark:bg-gray-900/85 border-b border-gray-200/70 dark:border-gray-800/70",
              headerClassName,
            )}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-start gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden mt-1"
                  onClick={() => setSidebarOpen(true)}
                  aria-label="Open navigation"
                >
                  <Menu className="h-5 w-5" />
                </Button>
                <div className="space-y-1">
                  {headerContent ?? (
                    <>
                      {title && (
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                          {title}
                        </h1>
                      )}
                      {description && (
                        <p className="text-sm sm:text-base text-gray-600 dark:text-white">
                          {description}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>

              {actions && (
                <div className="flex flex-wrap gap-2 justify-end">
                  {actions}
                </div>
              )}
            </div>
          </header>
        )}

        <div
          className={cn("flex-1 px-4 sm:px-6 lg:px-8 py-6", contentClassName)}
        >
          {children}
        </div>
      </main>
    </div>
  );
}

export default SidebarLayout;
