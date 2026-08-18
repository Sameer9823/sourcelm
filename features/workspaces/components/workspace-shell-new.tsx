"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    ArrowLeftIcon,
    BookOpenIcon,
    GraduationCapIcon,
    HelpCircleIcon,
    MessageSquareIcon,
    MicIcon,
    PlusIcon,
    SearchIcon,
    SettingsIcon,
} from "lucide-react";
import { learnRoutes } from "@/features/learn";
import { podcastRoutes } from "@/features/podcast";
import { SignOutButton } from "@/features/auth/components/sign-out-button";
import {
    AddSourceDialog,
    SourceSidebarList,
    sourceRoutes,
} from "@/features/sources";
import { Button } from "@/components/ui/button";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarRail,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { workspaceRoutes } from "../lib/routes";
import type { Workspace } from "../lib/types";
import { WorkspaceHeaderActions } from "./workspace-header-actions";
import { SovyniqLogo } from "@/features/marketing/components/sovyniq-logo";
import { CreditBadge } from "@/features/billing/components/credit-badge";
import { ReviewStreakBadge } from "@/features/review/components/review-streak-badge";
import { useIsMobile } from "@/shared/hooks/use-mobile";
import { cn } from "@/lib/utils";

type WorkspaceShellProps = {
    workspace: Workspace;
    children: React.ReactNode;
};

// Navigation items configuration
const NAVIGATION_ITEMS = [
    {
        key: "chat",
        label: "Chat",
        icon: MessageSquareIcon,
        href: (workspaceId: string) => workspaceRoutes.detail(workspaceId),
    },
    {
        key: "sources",
        label: "Sources",
        icon: BookOpenIcon,
        href: (workspaceId: string) => sourceRoutes.list(workspaceId),
    },
    {
        key: "artifacts",
        label: "Artifacts",
        icon: GraduationCapIcon,
        href: (workspaceId: string) => learnRoutes.hub(workspaceId),
    },
    {
        key: "podcast",
        label: "Podcast",
        icon: MicIcon,
        href: (workspaceId: string) => podcastRoutes.hub(workspaceId),
    },
] as const;

const BOTTOM_ITEMS = [
    {
        key: "settings",
        label: "Settings",
        icon: SettingsIcon,
        href: (workspaceId: string) => workspaceRoutes.settings(workspaceId),
    },
    {
        key: "help",
        label: "Help",
        icon: HelpCircleIcon,
        href: "/docs",
    },
] as const;
