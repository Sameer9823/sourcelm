import { Inngest } from "inngest";

export const inngest = new Inngest({ id: "chaibook" });

export type SourceCreatedEvent = {
    name: "source/created";
    data: {
        sourceId: string;
        workspaceId: string;
    };
};

export type ArtifactGenerateEvent = {
    name: "artifact/generate";
    data: {
        artifactId: string;
    };
};

export type PodcastGenerateEvent = {
    name: "podcast/generate";
    data: {
        podcastId: string;
        userId: string;
    };
};

export type ConversationSummarizeEvent = {
    name: "conversation/summarize";
    data: {
        conversationId: string;
        userId: string;
    };
};

export type InngestEvents =
    | SourceCreatedEvent
    | ArtifactGenerateEvent
    | PodcastGenerateEvent
    | ConversationSummarizeEvent;
