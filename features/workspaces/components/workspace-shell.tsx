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

export function WorkspaceShell({ workspace, children }: WorkspaceShellProps) {
    const pathname = usePathname();
    const isMobile = useIsMobile();
    const [addSourceOpen, setAddSourceOpen] = useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    // Determine active navigation
    const sourcesPath = sourceRoutes.list(workspace.id);
    const learnPath = learnRoutes.hub(workspace.id);
    const podcastPath = podcastRoutes.hub(workspace.id);
    const chatPath = workspaceRoutes.detail(workspace.id);
    const settingsPath = workspaceRoutes.settings(workspace.id);

    const activeKey = (() => {
        if (pathname.startsWith(sourcesPath)) return "sources";
        if (pathname.startsWith(learnPath)) return "artifacts";
        if (pathname.startsWith(podcastPath)) return "podcast";
        if (pathname.startsWith(settingsPath)) return "settings";
        return "chat";
    })();

    const sidebarWidth = "w-[256px]"; // ~256px = 16rem

    return (
        <SidebarProvider>
            {/* Mobile Sheet Overlay */}
            <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
                <SheetTrigger asChild>
                    <SidebarTrigger className="lg:hidden" />
                </SheetTrigger>
                <SheetContent side="left" className="w-[280px] p-0">
                    <SheetHeader className="p-4 border-b">
                        <SheetTitle className="flex items-center gap-2">
                            <SovyniqLogo size="md" showText={true} />
                        </SheetTitle>
                    </SheetHeader>
                    <MobileSidebarContent
                        workspace={workspace}
                        activeKey={activeKey}
                        onNavigate={() => setMobileSidebarOpen(false)}
                    />
                </SheetContent>
            </Sheet>

            {/* Desktop Sidebar */}
            <Sidebar className={cn(sidebarWidth, "hidden lg:flex")}>
            <Sidebar className="w-64">
                {/* Sovyniq Brand Header */}
                <SidebarHeader className="border-b border-sidebar-border px-3 py-4">
                    <Link
                        href={workspaceRoutes.list}
                        className="flex items-center gap-2.5 font-heading text-lg font-semibold tracking-tight"
                    >
                        <SovyniqLogo size="md" showText={true} />
                    </Link>
                </SidebarHeader>

                <SidebarHeader className="border-b border-sidebar-border">
                    <div className="flex items-center gap-2 px-2 py-1">
                        <span className="text-xl">{workspace.icon ?? "📚"}</span>
                        <div className="min-w-0 flex-1">
                            <p className="truncate font-medium">
                                {workspace.title}
                            </p>
                            {workspace.description ? (
                                <p className="truncate text-xs text-muted-foreground">
                                    {workspace.description}
                                </p>
                            ) : null}
                        </div>
                    </div>
                </SidebarHeader>

                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupLabel>Workspace</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        isActive={isChatActive}
                                        render={
                                            <Link
                                                href={workspaceRoutes.detail(
                                                    workspace.id,
                                                )}
                                            />
                                        }
                                    >
                                        <MessageSquareIcon />
                                        <span>Chat</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        isActive={isLearnActive}
                                        render={
                                            <Link href={learnPath} />
                                        }
                                    >
                                        <GraduationCapIcon />
                                        <span>Learn</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        isActive={isPodcastActive}
                                        render={
                                            <Link href={podcastPath} />
                                        }
                                    >
                                        <MicIcon />
                                        <span>Podcast</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        isActive={isSourcesActive}
                                        render={
                                            <Link href={sourcesPath} />
                                        }
                                    >
                                        <BookOpenIcon />
                                        <span>Sources</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        isActive={isSettingsActive}
                                        render={
                                            <Link
                                                href={workspaceRoutes.settings(
                                                    workspace.id,
                                                )}
                                            />
                                        }
                                    >
                                        <SettingsIcon />
                                        <span>Settings</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>

                    <SourceSidebarList
                        workspaceId={workspace.id}
                        onAddSource={() => setAddSourceOpen(true)}
                    />
                </SidebarContent>

                <SidebarFooter className="border-t border-sidebar-border">
                    <Button
                        nativeButton={false}
                        variant="ghost"
                        className="w-full justify-start"
                        render={<Link href={workspaceRoutes.list} />}
                    >
                        <ArrowLeftIcon />
                        All workspaces
                    </Button>
                </SidebarFooter>

                <SidebarRail />
            </Sidebar>

            <SidebarInset>
                <header className="flex h-14 items-center gap-3 border-b px-4">
                    <SidebarTrigger />
                    <div className="min-w-0 flex-1">
                        <h1 className="truncate font-heading text-base font-semibold">
                            {workspace.title}
                        </h1>
                    </div>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setAddSourceOpen(true)}
                    >
                        <PlusIcon />
                        Add source
                    </Button>
                    <WorkspaceHeaderActions workspace={workspace} />
                    <SignOutButton />
                </header>

                <main className="flex min-h-0 flex-1 flex-col">{children}</main>
            </SidebarInset>

            <AddSourceDialog
                workspaceId={workspace.id}
                open={addSourceOpen}
                onOpenChange={setAddSourceOpen}
            />
        </SidebarProvider>
    );
}
