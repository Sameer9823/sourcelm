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
import { workspaceRoutes } from "../lib/routes";
import type { Workspace } from "../lib/types";
import { WorkspaceHeaderActions } from "./workspace-header-actions";
import { SovyniqLogo } from "@/features/marketing/components/sovyniq-logo";

type WorkspaceShellProps = {
    workspace: Workspace;
    children: React.ReactNode;
};

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

export function WorkspaceShell({ workspace, children }: WorkspaceShellProps) {
    const pathname = usePathname();
    const [addSourceOpen, setAddSourceOpen] = useState(false);

    const sourcesPath = sourceRoutes.list(workspace.id);
    const learnPath = learnRoutes.hub(workspace.id);
    const podcastPath = podcastRoutes.hub(workspace.id);
    const settingsPath = workspaceRoutes.settings(workspace.id);

    const activeKey = (() => {
        if (pathname.startsWith(settingsPath)) return "settings";
        if (pathname.startsWith(sourcesPath)) return "sources";
        if (pathname.startsWith(learnPath)) return "artifacts";
        if (pathname.startsWith(podcastPath)) return "podcast";
        return "chat";
    })();

    return (
        <SidebarProvider>
            <Sidebar collapsible="offcanvas">
                {/* Brand */}
                <SidebarHeader className="gap-3 border-b border-sidebar-border px-3 py-3.5">
                    <Link
                        href={workspaceRoutes.list}
                        className="flex items-center gap-2.5"
                    >
                        <SovyniqLogo size="md" showText={true} />
                    </Link>

                    {/* Workspace selector (current workspace) */}
                    <Link
                        href={workspaceRoutes.list}
                        className="flex items-center gap-2 rounded-lg border border-sidebar-border bg-sidebar-accent/40 px-2.5 py-1.5 transition-colors hover:bg-sidebar-accent"
                    >
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-sidebar-accent text-sm">
                            {workspace.icon ?? "📚"}
                        </span>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium leading-tight">
                                {workspace.title}
                            </p>
                        </div>
                    </Link>
                </SidebarHeader>

                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupLabel>Workspace</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {NAVIGATION_ITEMS.map((item) => (
                                    <SidebarMenuItem key={item.key}>
                                        <SidebarMenuButton
                                            isActive={activeKey === item.key}
                                            render={
                                                <Link
                                                    href={item.href(
                                                        workspace.id,
                                                    )}
                                                />
                                            }
                                        >
                                            <item.icon />
                                            <span>{item.label}</span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>

                    <SourceSidebarList
                        workspaceId={workspace.id}
                        onAddSource={() => setAddSourceOpen(true)}
                    />
                </SidebarContent>

                <SidebarFooter className="gap-1 border-t border-sidebar-border">
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                isActive={activeKey === "settings"}
                                render={
                                    <Link href={settingsPath} />
                                }
                            >
                                <SettingsIcon />
                                <span>Settings</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                render={<Link href="/docs" />}
                            >
                                <HelpCircleIcon />
                                <span>Help</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
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
                <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-4">
                    <SidebarTrigger />
                    <div className="min-w-0 flex-1">
                        <h1 className="truncate text-base font-semibold tracking-tight">
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