import {
  Settings,
  LayoutDashboard,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";

export type NavItem = {
  label: string;
  link: string;
  icon: LucideIcon;
  badge?: string;
  isActive?: boolean;
  children?: { label: string; isActive?: boolean }[];
};

export type NavSection = {
  title: string;
  items: NavItem[];
};

export const navigation: NavSection[] = [
  {
    title: "",
    items: [
      {
        label: "Dashboard",
        icon: LayoutDashboard,
        link: "/dashboard",
        isActive: true,
      },
      {
        label: "Setting",
        icon: Settings,
        link: "/setting",
      },
    ],
  },
];