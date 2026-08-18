use client;

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
    BookOpenIcon,
    GraduationCapIcon,
    MessageSquareIcon,
    PlusIcon,
    SparklesIcon,
    ArrowRightIcon,
    FileTextIcon,
    GlobeIcon,
    VideoIcon,
    NotebookPenIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useWorkspaces } from "../hooks/use-workspaces";
import { useSources } from "@/features/sources/hooks/use-sources";
import { useConversations } from "@/features/chat/hooks/use-conversations";
import { useArtifacts } from "@/features/learn/hooks/use-artifacts";
import { sourceRoutes } from "@/features/sources/lib/routes";
import { learnRoutes } from "@/features/learn/lib/routes";
import { workspaceRoutes } from "../lib/routes";
import { SovyniqLogo } from "@/features/marketing/components/sovyniq-logo";
import { CreateWorkspaceCard } from "./create-workspace-card";
import type { Workspace } from "../lib/types";
import type { Source } from "@/features/sources/lib/types";
import type { Conversation } from "@/features/chat/lib/types";
import type { LearningArtifact, ArtifactType } from "@/features/learn/lib/types";
import { ARTIFACT_TYPE_LABELS } from "@/features/learn/lib/constants";

type DashboardHomeProps = {
    userName?: string | null;
};

const SOURCE_TYPE_ICONS = {
    PDF: FileTextIcon,
    WEBSITE: GlobeIcon,
    YOUTUBE: VideoIcon,
    TEXT: NotebookPenIcon,
    MARKDOWN: NotebookPenIcon,
};

const SOURCE_TYPE_LABELS = {
    PDF: "PDF",
    WEBSITE: "Website",
    YOUTUBE: "YouTube",
    TEXT: "Text",
    MARKDOWN: "Markdown",
};

function SourceTypeBadge({ type }) {
    const Icon = SOURCE_TYPE_ICONS[type];
    return (
        <Badge variant="outline" className="gap-1 px-2 py-0.5 text-xs">
            <Icon className="size-3" />
            {SOURCE_TYPE_LABELS[type]}
        </Badge>
    );
}

function ArtifactTypeBadge({ type }) {
    return (
        <Badge variant="secondary" className="gap-1 px-2 py-0.5 text-xs">
            <SparklesIcon className="size-3" />
            {ARTIFACT_TYPE_LABELS[type]}
        </Badge>
    );
}

function ConversationRow({ conversation }) {
    return (
        <Link
            href={workspaceRoutes.detail(conversation.workspaceId) + "?conversation=" + conversation.id}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors hover:bg-accent group"
        >
            <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
                <MessageSquareIcon className="size-4 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1 space-y-0.5">
                <p className="truncate font-medium text-sm">
                    {conversation.title ?? "Untitled conversation"}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(conversation.updatedAt), { addSuffix: true })}
                </p>
            </div>
            <ArrowRightIcon className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>
    );
}

function SourceRow({ source }) {
    return (
        <Link
            href={sourceRoutes.detail(source.workspaceId, source.id)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors hover:bg-accent group"
        >
            <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
                <SOURCE_TYPE_ICONS[source.type] className="size-4 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1 space-y-0.5">
                <p className="truncate font-medium text-sm">{source.title}</p>
                <div className="flex items-center gap-2">
                    <SourceTypeBadge type={source.type} />
                    <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(source.updatedAt), { addSuffix: true })}
                    </span>
                </div>
            </div>
            <ArrowRightIcon className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>
    );
}

function ArtifactRow({ artifact }) {
    return (
        <Link
            href={learnRoutes.detail(artifact.workspaceId, artifact.id)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors hover:bg-accent group"
        >
            <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
                <GraduationCapIcon className="size-4 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1 space-y-0.5">
                <p className="truncate font-medium text-sm">{artifact.title}</p>
                <div className="flex items-center gap-2">
                    <ArtifactTypeBadge type={artifact.type} />
                    <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(artifact.updatedAt), { addSuffix: true })}
                    </span>
                </div>
            </div>
            <ArrowRightIcon className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>
    );
}

function EmptyState({ icon: Icon, title, description, actionLabel, actionHref }) {
    return (
        <div className="flex flex-col items-center justify-center gap-3 py-8 text-center border border-dashed rounded-2xl bg-muted/30">
            <div className="flex size-12 items-center justify-center rounded-xl bg-muted">
                <Icon className="size-5 text-muted-foreground" />
            </div>
            <div className="space-y-1">
                <p className="font-medium">{title}</p>
                <p className="text-sm text-muted-foreground max-w-xs">{description}</p>
            </div>
            <Button size="sm" asChild>
                <Link href={actionHref}>{actionLabel}</Link>
            </Button>
        </div>
    );
}

function SectionHeader({ title, count, actionLabel, actionHref }) {
    return (
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
                <h2 className="font-heading text-lg font-semibold">{title}</h2>
                {count !== undefined && (
                    <Badge variant="outline" className="text-xs">
                        {count}
                    </Badge>
                )}
            </div>
            {actionLabel && actionHref && (
                <Button size="sm" variant="ghost" asChild>
                    <Link href={actionHref}>{actionLabel}</Link>
                </Button>
            )}
        </div>
    );
}

function SectionList({ children, emptyState }) {
    return (
        <Card className="overflow-hidden">
            <CardContent className="p-0">
                <div className="divide-y">
                    {children}
                </div>
                {emptyState}
            </CardContent>
        </Card>
    );
}

export function DashboardHome({ userName }) {
    const { data: workspaces = [] } = useWorkspaces();
    
    const activeWorkspace = workspaces[0];
    
    const { data: sources = [] } = useSources(
        activeWorkspace?.id ?? "",
        {}
    );
    
    const { data: conversations = [] } = useConversations(
        activeWorkspace?.id ?? ""
    );
    
    const { data: artifacts = [] } = useArtifacts(
        activeWorkspace?.id ?? ""
    );

    const recentSources = sources.slice(0, 5);
    const recentConversations = conversations.slice(0, 5);
    const recentArtifacts = artifacts.slice(0, 5);

    const greeting = userName?.split(" ")[0] ?? "";

    if (workspaces.length === 0) {
        return (
            <div className="flex flex-col gap-8">
                <div className="space-y-2">
                    <h1 className="font-heading text-2xl font-semibold tracking-tight">
                        Welcome{f ? ", " + greeting : ""}
                    </h1>
                    <p className="text-muted-foreground">
                        You don't have any notebooks yet. Create one to start organizing your
                        knowledge.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <CreateWorkspaceCard onClick={() => {}} />
                    <CreateWorkspaceCard onClick={() => {}} />
                    <CreateWorkspaceCard onClick={() => {}} />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <SovyniqLogo size="md" showText={true} />
                </div>
                <h1 className="font-heading text-2xl font-semibold tracking-tight">
                    Your knowledge workspace
                </h1>
                <p className="text-muted-foreground max-w-2xl">
                    Bring your sources together, explore what matters, and create something useful.
                </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <Button size="lg" asChild>
                    <Link href={sourceRoutes.list(activeWorkspace.id)}>
                        <PlusIcon className="size-4 mr-2" />
                        Add sources
                    </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                    <Link href={workspaceRoutes.detail(activeWorkspace.id)}>
                        <MessageSquareIcon className="size-4 mr-2" />
                        Start a conversation
                    </Link>
                </Button>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <SectionList
                    emptyState={
                        <EmptyState
                            icon={BookOpenIcon}
                            title="No sources yet"
                            description="Add your first source to start building your knowledge workspace."
                            actionLabel="Add source"
                            actionHref={sourceRoutes.list(activeWorkspace.id)}
                        />
                    }
                >
                    <CardHeader className="px-4 py-3 border-b">
                        <SectionHeader
                            title="Recent Sources"
                            count={sources.length}
                            actionLabel="View all"
                            actionHref={sourceRoutes.list(activeWorkspace.id)}
                        />
                    </CardHeader>
                    {recentSources.length > 0 ? (
                        recentSources.map((source) => (
                            <SourceRow key={source.id} source={source} />
                        ))
                    ) : null}
                </SectionList>

                <SectionList
                    emptyState={
                        <EmptyState
                            icon={MessageSquareIcon}
                            title="No conversations yet"
                            description="Start a conversation to explore your sources with AI."
                            actionLabel="Start chat"
                            actionHref={workspaceRoutes.detail(activeWorkspace.id)}
                        />
                    }
                >
                    <CardHeader className="px-4 py-3 border-b">
                        <SectionHeader
                            title="Recent Conversations"
                            count={conversations.length}
                            actionLabel="View all"
                            actionHref={workspaceRoutes.detail(activeWorkspace.id)}
                        />
                    </CardHeader>
                    {recentConversations.length > 0 ? (
                        recentConversations.map((conversation) => (
                            <ConversationRow key={conversation.id} conversation={conversation} />
                        ))
                    ) : null}
                </SectionList>

                <SectionList
                    emptyState={
                        <EmptyState
                            icon={GraduationCapIcon}
                            title="No artifacts yet"
                            description="Generate summaries, flashcards, quizzes, and more from your sources."
                            actionLabel="Generate"
                            actionHref={learnRoutes.hub(activeWorkspace.id)}
                        />
                    }
                >
                    <CardHeader className="px-4 py-3 border-b">
                        <SectionHeader
                            title="Recent Artifacts"
                            count={artifacts.length}
                            actionLabel="View all"
                            actionHref={learnRoutes.hub(activeWorkspace.id)}
                        />
                    </CardHeader>
                    {recentArtifacts.length > 0 ? (
                        recentArtifacts.map((artifact) => (
                            <ArtifactRow key={artifact.id} artifact={artifact} />
                        ))
                    ) : null}
                </SectionList>
            </div>
        </div>
    );
}
