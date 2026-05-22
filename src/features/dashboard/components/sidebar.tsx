"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CircleUser,
  LogOut,
  Menu,
  Settings,
  Sun,
  Moon,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/layouts/sidebar-context";
import { navigation } from "@/features/dashboard/data/dashboard-data";

const iconColors = [
  "text-[#2388ff]",
  "text-[#20d66b]",
  "text-[#a66a91]",
  "text-[#ff5a1f]",
  "text-[#8b5cf6]",
];

function ThemeSwitch({ collapsed }: { collapsed: boolean }) {
  const [theme, setTheme] = React.useState<"light" | "dark">("dark");

  React.useEffect(() => {
    const saved = localStorage.getItem("theme");
    const nextTheme = saved === "light" || saved === "dark" ? saved : "dark";

    setTheme(nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
  }, []);

  const updateTheme = (value: "light" | "dark") => {
    setTheme(value);
    localStorage.setItem("theme", value);
    document.documentElement.classList.toggle("dark", value === "dark");
  };

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={() => updateTheme(theme === "dark" ? "light" : "dark")}
        className="grid h-[52px] w-[52px] place-items-center rounded-[12px] bg-[#eef1f3] text-[#657078] dark:bg-[#222829] dark:text-[#7a8389]"
      >
        {theme === "dark" ? (
          <Moon className="h-[21px] w-[21px]" />
        ) : (
          <Sun className="h-[20px] w-[20px]" />
        )}
      </button>
    );
  }

  return (
    <div className="grid h-[42px] grid-cols-2 rounded-[11px] bg-[#eef1f3] p-[4px] dark:bg-[#222829]">
      <button
        type="button"
        onClick={() => updateTheme("light")}
        className={cn(
          "flex items-center justify-center gap-[8px] rounded-[8px] text-[13px] font-semibold",
          theme === "light"
            ? "bg-white text-[#111516] shadow-sm dark:bg-[#111617] dark:text-white"
            : "text-[#6f777d]"
        )}
      >
        <Sun className="h-[16px] w-[16px]" />
        Light
      </button>

      <button
        type="button"
        onClick={() => updateTheme("dark")}
        className={cn(
          "flex items-center justify-center gap-[8px] rounded-[8px] text-[13px] font-semibold",
          theme === "dark"
            ? "bg-white text-[#111516] shadow-sm dark:bg-[#111617] dark:text-white"
            : "text-[#6f777d]"
        )}
      >
        <Moon className="h-[16px] w-[16px]" />
        Dark
      </button>
    </div>
  );
}

function SidebarContent({
  activeItem,
  activeChild,
}: {
  activeItem?: string;
  activeChild?: string;
}) {
  const { collapsed } = useSidebar();
  const { data: session } = useSession();
  const [profileImage, setProfileImage] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;

    const loadProfileImage = async () => {
      try {
        const response = await fetch("/api/user/me", { cache: "no-store" });
        if (!response.ok) return;

        const payload = (await response.json().catch(() => null)) as {
          image?: string | null;
        } | null;

        if (!mounted) return;
        setProfileImage(payload?.image ?? null);
      } catch {}
    };

    const onProfileUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<{ image?: string | null }>;
      setProfileImage(customEvent.detail?.image ?? null);
    };

    void loadProfileImage();
    window.addEventListener(
      "admin-profile-updated",
      onProfileUpdated as EventListener
    );

    return () => {
      mounted = false;
      window.removeEventListener(
        "admin-profile-updated",
        onProfileUpdated as EventListener
      );
    };
  }, []);

  const displayName = session?.user?.name || "Tran Mau Tri Tam";
  const displayRole = session?.user?.email || "tam@ui8.net";
  const avatarSrc =
    profileImage || session?.user?.image || "/images/avatar.png";

  return (
    <div
      className={cn(
        "flex h-full flex-col border-r transition-all duration-300 gap-[10px]",
        "border-[#e5e8ea] bg-white text-[#101315]",
        "dark:border-[#202628] dark:bg-[#252b2d] dark:text-[#cbd3d8]",
        collapsed ? "w-[72px]" : "w-full"
      )}
    >
      <div
        className={cn(
          "flex h-[72px] px-[20px] pt-1 gap-[10px]",
          collapsed ? "justify-center items-center" : "justify-between"
        )}
      >
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center">
            <Image
              src="/images/logo.png"
              alt="BKleads"
              width={200}
              height={400}
              className="h-full w-full dark:hidden"
            />

            <Image
              src="/images/logo.png"
              alt="BKleads"
              width={200}
              height={400}
              className="hidden h-full w-full dark:block"
            />
          </Link>
        )}
      </div>

      <ScrollArea className={cn("flex-1", collapsed ? "px-[10px]" : "px-[12px]")}>
        <div className={cn("space-y-[26px]", collapsed && "pt-[10px]")}>
          {navigation.map((section, sectionIndex) => (
            <div key={section.title || sectionIndex}>
              {section.title && !collapsed && (
                <p className="mb-[10px] px-[10px] text-[12px] font-medium text-[#7b8388]">
                  {section.title}
                </p>
              )}

              <div className="space-y-[7px]">
                {section.items.map((item, index) => {
                  const isActive = activeItem
                    ? item.label === activeItem
                    : item.isActive;

                  const Icon = item.icon;

                  const linkContent = (
                    <Link
                      href={item.link ?? "#"}
                      className={cn(
                        "group flex items-center rounded-[8px] font-medium transition",
                        collapsed
                          ? "h-[42px] justify-center px-0"
                          : "h-[38px] justify-between px-[12px] text-[13px]",
                        isActive
                          ? "bg-[#e7eaed] text-[#111516] dark:bg-[#2a3034] dark:text-white"
                          : "text-[#59636a] hover:bg-[#eceff1] hover:text-[#111516] dark:text-[#a6aeb3] dark:hover:bg-[#1d2325] dark:hover:text-white"
                      )}
                    >
                      <div
                        className={cn(
                          "flex items-center",
                          collapsed ? "justify-center" : "gap-[13px]"
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-[17px] w-[17px]",
                            iconColors[index % iconColors.length]
                          )}
                        />

                        {!collapsed && <span>{item.label}</span>}
                      </div>

                      {!collapsed && (
                        <div className="flex items-center gap-[7px]">
                          {item.badge && (
                            <Badge className="h-[20px] rounded-[6px] border-0 bg-[#dfe4e7] px-[7px] text-[10px] font-bold text-[#515b62] dark:bg-[#30373b] dark:text-[#b9c2c8]">
                              {item.badge}
                            </Badge>
                          )}

                          {item.children && (
                            <ChevronRight className="h-[13px] w-[13px] text-[#737c82]" />
                          )}
                        </div>
                      )}
                    </Link>
                  );

                  return (
                    <div key={item.label}>
                      {collapsed ? (
                        <Tooltip>
                          <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                          <TooltipContent
                            side="right"
                            sideOffset={10}
                            className="rounded-[8px] border-[#2c3336] bg-[#151a1c] px-3 py-2 text-white"
                          >
                            {item.label}
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        linkContent
                      )}

                      {item.children && !collapsed && (
                        <div className="ml-[20px] mt-[7px] space-y-[5px] border-l border-[#dfe4e7] pl-[10px] dark:border-[#2a3033]">
                          {item.children.map((child) => {
                            const isChildActive = activeChild
                              ? child.label === activeChild
                              : child.isActive;

                            return (
                              <Link
                                key={child.label}
                                href="#"
                                className={cn(
                                  "block rounded-[6px] px-[8px] py-[6px] text-[12px] font-medium transition",
                                  isChildActive
                                    ? "bg-[#e7eaed] text-[#111516] dark:bg-[#2a3034] dark:text-white"
                                    : "text-[#6f777d] hover:text-[#111516] dark:text-[#777f85] dark:hover:text-white"
                                )}
                              >
                                {child.label}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div
        className={cn(
          "space-y-[10px] border-t border-[#e5e8ea] dark:border-[#202628]",
          collapsed ? "p-[10px]" : "p-[12px]"
        )}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn(
                "w-full rounded-[10px] border transition",
                "border-[#e1e5e8] bg-white hover:bg-[#f1f3f4]",
                "dark:border-[#2a3033] dark:bg-[#1b2123] dark:hover:bg-[#22282b]",
                collapsed
                  ? "grid h-[42px] place-items-center border-0 bg-transparent p-0 dark:bg-transparent"
                  : "flex items-center gap-[9px] p-[10px]"
              )}
            >
              <span className="relative shrink-0">
                <Avatar className="h-[36px] w-[36px] border border-[#dce1e4] dark:border-[#31383c]">
                  <AvatarImage src={avatarSrc} alt="Profile" />
                </Avatar>

                <span className="absolute -bottom-[1px] -right-[1px] h-[10px] w-[10px] rounded-full border-[2px] border-white bg-[#22c55e] dark:border-[#1b2123]" />
              </span>

              {!collapsed && (
                <>
                  <span className="min-w-0 flex-1 text-left">
                    <span className="block truncate text-[14px] font-semibold text-[#111516] dark:text-white">
                      {displayName}
                    </span>
                    <span className="block truncate text-[13px] text-[#6f777d] dark:text-[#858e94]">
                      {displayRole}
                    </span>
                  </span>
                </>
              )}
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            side="right"
            align="end"
            sideOffset={15}
            className="w-60 rounded-[10px] border-[#dfe3e6] bg-white p-2 dark:border-[#2a3033] dark:bg-[#222829]"
          >
            <DropdownMenuLabel>
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={avatarSrc} alt="Profile" />
                </Avatar>

                <div>
                  <p className="text-sm font-semibold text-[#111516] dark:text-white">
                    {displayName}
                  </p>
                  <p className="text-xs text-[#7b8388]">{displayRole}</p>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <Link href="/setting" className="gap-2">
                <CircleUser className="h-4 w-4" />
                My Profile
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link href="/setting" className="gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => signOut({ callbackUrl: "/signin" })}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              Log Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <ThemeSwitch collapsed={collapsed} />
      </div>
    </div>
  );
}

export function Sidebar({
  className,
  activeItem,
  activeChild,
}: {
  className?: string;
  activeItem?: string;
  activeChild?: string;
}) {
  const { collapsed } = useSidebar();

  return (
    <aside
      className={cn(
        "hidden lg:fixed lg:left-0 lg:top-0 lg:z-41 lg:block lg:h-screen lg:transition-[width] lg:duration-300",
        collapsed ? "lg:w-[72px]" : "lg:w-71",
        className
      )}
    >
      <SidebarContent activeItem={activeItem} activeChild={activeChild} />
    </aside>
  );
}

export function MobileSidebar({
  activeItem,
  activeChild,
}: {
  activeItem?: string;
  activeChild?: string;
}) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-[#dfe4e7] bg-white text-[#111516] shadow-sm dark:border-[#2a3033] dark:bg-[#111617] dark:text-white lg:hidden">
          <Menu className="h-5 w-5" />
        </button>
      </SheetTrigger>

      <SheetContent
        side="left"
        className="w-full border-0 bg-transparent p-0"
      >
        <SidebarContent activeItem={activeItem} activeChild={activeChild} />
      </SheetContent>
    </Sheet>
  );
}