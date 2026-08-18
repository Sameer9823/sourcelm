import Link from "next/link";
import { redirect } from "next/navigation";
import {
    BookOpenTextIcon,
    CheckIcon,
    FileTextIcon,
    FolderIcon,
    GlobeIcon,
    HelpCircleIcon,
    LayersIcon,
    MenuIcon,
    MessagesSquareIcon,
    SettingsIcon,
    SparklesIcon,
    VideoIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { authRoutes, getSession } from "@/features/auth";
import { SovyniqLogo } from "@/features/marketing/components/sovyniq-logo";
import { PublicPricingSection } from "@/features/marketing/components/public-pricing-section";

const NAV_LINKS = [
    { label: "Features", href: "#features" },
    { label: "How it works", href: "#how-it-works" },
    { label: "Pricing", href: "#pricing" },
] as const;

const FEATURES = [
    {
        icon: MessagesSquareIcon,
        title: "Understand",
        description: "Ask questions and get answers grounded in your sources.",
    },
    {
        icon: SparklesIcon,
        title: "Create",
        description:
            "Generate summaries, quizzes, flashcards, study guides, and podcasts.",
    },
    {
        icon: BookOpenTextIcon,
        title: "Organize",
        description:
            "Keep documents, links, conversations, and AI artifacts together.",
    },
] as const;

const STEPS = [
    {
        number: "01",
        title: "Add your sources",
        description: "Upload documents, links, and other content.",
    },
    {
        number: "02",
        title: "Ask Sovyniq",
        description: "Chat with your knowledge and explore what matters.",
    },
    {
        number: "03",
        title: "Create something useful",
        description:
            "Turn your knowledge into summaries, quizzes, flashcards, podcasts, and more.",
    },
] as const;

const SIDEBAR_ITEMS = [
    { icon: FolderIcon, label: "Sources" },
    { icon: FileTextIcon, label: "Documents" },
    { icon: MessagesSquareIcon, label: "Conversations" },
    { icon: SparklesIcon, label: "Artifacts" },
    { icon: SettingsIcon, label: "Settings" },
] as const;

const SOURCE_LIST = [
    { icon: FileTextIcon, label: "Research Paper.pdf" },
    { icon: FileTextIcon, label: "Product Strategy.pdf" },
    { icon: GlobeIcon, label: "Website Research" },
    { icon: VideoIcon, label: "YouTube Lecture" },
] as const;

const ARTIFACT_ITEMS = [
    { icon: FileTextIcon, label: "Summary" },
    { icon: LayersIcon, label: "Flashcards" },
    { icon: HelpCircleIcon, label: "Quiz" },
    { icon: BookOpenTextIcon, label: "Study Guide" },
] as const;

const CITATIONS = [
    "Research Paper.pdf · p. 12",
    "Product Strategy.pdf · p. 8",
    "Website Research",
] as const;

const BRAND_GRADIENT = "linear-gradient(90deg, #8B5CF6, #D946EF, #06B6D4)";
const BRAND_GRADIENT_DIAGONAL =
    "linear-gradient(135deg, #8B5CF6, #D946EF, #06B6D4)";

/**
 * Reusable matte-grid + soft gradient-glow backdrop for dark sections.
 * Renders behind its siblings — parent must be `position: relative`.
 */
function MatteGridBackdrop({
    gridSize = 30,
    maskShape = "ellipse 75% 75% at 50% 45%",
}: {
    gridSize?: number;
    maskShape?: string;
}) {
    return (
        <>
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-[0.35]"
                style={{
                    backgroundImage:
                        "linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)",
                    backgroundSize: `${gridSize}px ${gridSize}px`,
                    maskImage: `radial-gradient(${maskShape}, black 0%, transparent 75%)`,
                    WebkitMaskImage: `radial-gradient(${maskShape}, black 0%, transparent 75%)`,
                }}
            />
            <div
                aria-hidden
                className="pointer-events-none absolute -left-24 -top-24 size-72 rounded-full opacity-[0.18] blur-[90px]"
                style={{ background: "#8B5CF6" }}
            />
            <div
                aria-hidden
                className="pointer-events-none absolute -bottom-24 -right-16 size-72 rounded-full opacity-[0.15] blur-[90px]"
                style={{ background: "#06B6D4" }}
            />
        </>
    );
}

export default async function HomePage() {
    const session = await getSession();

    if (session) {
        redirect(authRoutes.dashboard);
    }

    return (
        <div className="min-h-svh bg-background text-foreground">
            {/* ============ HEADER ============ */}
            <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
                    <SovyniqLogo
                        className="flex items-center gap-2.5 font-heading text-lg font-semibold tracking-tight"
                        size="md"
                    />

                    {/* Desktop nav */}
                    <nav className="hidden items-center gap-8 md:flex">
                        {NAV_LINKS.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                            >
                                {link.label}
                            </a>
                        ))}
                    </nav>

                    <div className="hidden items-center gap-3 md:flex">
                        <Button
                            nativeButton={false}
                            variant="ghost"
                            size="sm"
                            render={<Link href={authRoutes.login} />}
                        >
                            Sign in
                        </Button>
                        <Button
                            nativeButton={false}
                            size="sm"
                            render={<Link href={authRoutes.login} />}
                        >
                            Get Started
                        </Button>
                    </div>

                    {/* Mobile nav — no client JS needed */}
                    <details className="group relative md:hidden">
                        <summary className="flex size-9 list-none items-center justify-center rounded-md border [&::-webkit-details-marker]:hidden">
                            <MenuIcon className="size-4" />
                        </summary>
                        <div className="absolute right-0 top-11 w-56 space-y-1 rounded-xl border bg-card p-3 shadow-md">
                            {NAV_LINKS.map((link) => (
                                <a
                                    key={link.href}
                                    href={link.href}
                                    className="block rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                >
                                    {link.label}
                                </a>
                            ))}
                            <div className="my-2 h-px bg-border" />
                            <Link
                                href={authRoutes.login}
                                className="block rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                            >
                                Sign in
                            </Link>
                            <Link
                                href={authRoutes.login}
                                className="block rounded-md bg-primary px-3 py-2 text-center text-sm font-medium text-primary-foreground"
                            >
                                Get Started
                            </Link>
                        </div>
                    </details>
                </div>
            </header>

            <main>
                {/* ============ HERO ============ */}
                <section className="relative overflow-hidden px-4 pt-24 pb-16 text-center md:px-8 md:pt-32 md:pb-24">
                    {/* subtle atmospheric glow — the only large-scale gradient use on the light page */}
                    <div
                        aria-hidden
                        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[480px] w-[900px] -translate-x-1/2 rounded-full opacity-[0.15] blur-[120px]"
                        style={{ background: BRAND_GRADIENT }}
                    />

                    <div className="mx-auto max-w-3xl space-y-7">
                        <span className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
                            <span
                                className="size-1.5 rounded-full"
                                style={{ background: BRAND_GRADIENT_DIAGONAL }}
                            />
                            AI-powered knowledge workspace
                        </span>

                        <h1 className="text-balance font-heading text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                            Turn your knowledge into intelligence.
                        </h1>

                        <p className="mx-auto max-w-[700px] text-balance text-lg leading-relaxed text-muted-foreground">
                            Bring your sources together, ask questions, learn
                            faster, and create with AI — all in one
                            workspace.
                        </p>

                        <div className="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row">
                            <div className="group relative inline-block">
                                <div
                                    aria-hidden
                                    className="absolute -inset-1 rounded-lg opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-40"
                                    style={{ background: BRAND_GRADIENT }}
                                />
                                <Button
                                    nativeButton={false}
                                    size="lg"
                                    className="relative"
                                    render={<Link href={authRoutes.login} />}
                                >
                                    Get Started
                                </Button>
                            </div>
                            <Button
                                nativeButton={false}
                                size="lg"
                                variant="outline"
                                render={<a href="#how-it-works" />}
                            >
                                See how it works
                            </Button>
                        </div>

                        <p className="pt-1 text-sm font-medium text-muted-foreground">
                            Organize. Understand. Create.
                        </p>
                    </div>
                </section>

                {/* ============ PRODUCT PREVIEW ============ */}
                <section className="px-4 pb-24 md:px-8 md:pb-32">
                    <div className="relative mx-auto max-w-6xl">
                        <div
                            aria-hidden
                            className="pointer-events-none absolute -inset-4 -z-10 rounded-[28px] opacity-20 blur-3xl"
                            style={{ background: BRAND_GRADIENT }}
                        />

                        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0B0B0E] shadow-xl">
                            {/* gradient hairline along the top edge */}
                            <div
                                className="h-[2px] w-full"
                                style={{ background: BRAND_GRADIENT }}
                            />

                            {/* matte grid + soft color glows, sitting behind the content */}
                            <MatteGridBackdrop
                                gridSize={28}
                                maskShape="ellipse 80% 80% at 50% 40%"
                            />

                            <div className="relative grid md:grid-cols-[200px_1fr_240px]">
                                {/* Sidebar */}
                                <div className="hidden border-r border-white/10 p-4 md:block">
                                    <div className="mb-6 flex items-center gap-2 px-2 text-sm font-medium text-white">
                                        <span
                                            className="size-2 rounded-full"
                                            style={{
                                                background:
                                                    BRAND_GRADIENT_DIAGONAL,
                                            }}
                                        />
                                        Research Workspace
                                    </div>
                                    <nav className="space-y-1">
                                        {SIDEBAR_ITEMS.map(
                                            ({ icon: Icon, label }, i) => (
                                                <div
                                                    key={label}
                                                    className={`flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm ${
                                                        i === 2
                                                            ? "bg-white/10 text-white"
                                                            : "text-[#A1A1AA]"
                                                    }`}
                                                >
                                                    <Icon className="size-3.5" />
                                                    {label}
                                                </div>
                                            ),
                                        )}
                                    </nav>
                                </div>

                                {/* Main conversation */}
                                <div className="space-y-5 border-r border-white/10 p-5 md:p-6">
                                    <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
                                        {SOURCE_LIST.map(
                                            ({ icon: Icon, label }) => (
                                                <span
                                                    key={label}
                                                    className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-[#A1A1AA]"
                                                >
                                                    <Icon className="size-3" />
                                                    {label}
                                                </span>
                                            ),
                                        )}
                                    </div>

                                    <div className="ml-auto max-w-[85%] rounded-xl rounded-tr-sm bg-white/10 px-4 py-2.5 text-sm text-white">
                                        What are the key ideas across these
                                        documents?
                                    </div>

                                    <div className="max-w-[90%] space-y-3">
                                        <div className="flex items-center gap-2">
                                            <span
                                                className="size-2 rounded-full"
                                                style={{
                                                    background:
                                                        BRAND_GRADIENT_DIAGONAL,
                                                }}
                                            />
                                            <span className="text-xs font-medium text-[#A1A1AA]">
                                                Sovyniq
                                            </span>
                                        </div>
                                        <p className="text-sm leading-relaxed text-[#D4D4D8]">
                                            Here are the four key ideas I
                                            found across your sources.
                                            Onboarding speed, retention
                                            drivers, and pricing sensitivity
                                            come up repeatedly, alongside a
                                            shared emphasis on
                                            time-to-first-value.
                                        </p>
                                        <div className="flex flex-wrap gap-2 pt-1">
                                            {CITATIONS.map((citation, i) => (
                                                <span
                                                    key={citation}
                                                    className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-[#A1A1AA]"
                                                >
                                                    [{i + 1}] {citation}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Artifact panel */}
                                <div className="hidden p-5 md:block">
                                    <p className="mb-3 text-xs font-medium uppercase tracking-wide text-[#A1A1AA]">
                                        Artifacts
                                    </p>
                                    <div className="space-y-1.5">
                                        {ARTIFACT_ITEMS.map(
                                            ({ icon: Icon, label }) => (
                                                <div
                                                    key={label}
                                                    className="flex items-center gap-2.5 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-[#D4D4D8]"
                                                >
                                                    <Icon className="size-3.5 text-[#A1A1AA]" />
                                                    {label}
                                                </div>
                                            ),
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ============ FEATURES ============ */}
                <section id="features" className="px-4 py-24 md:px-8 md:py-32">
                    <div className="mx-auto max-w-6xl">
                        <div className="mx-auto mb-16 max-w-xl text-center">
                            <h2 className="text-balance font-heading text-3xl font-semibold tracking-tight md:text-4xl">
                                Everything you need to work with knowledge.
                            </h2>
                            <p className="mt-4 text-muted-foreground">
                                One workspace for understanding information,
                                creating content, and keeping your knowledge
                                organized.
                            </p>
                        </div>

                        <div className="grid divide-y border-t md:grid-cols-3 md:divide-x md:divide-y-0 md:border">
                            {FEATURES.map(({ icon: Icon, title, description }) => (
                                <div
                                    key={title}
                                    className="space-y-3 px-6 py-8 first:pt-6 md:py-10"
                                >
                                    <Icon className="size-5 text-primary" />
                                    <h3 className="font-heading text-lg font-semibold">
                                        {title}
                                    </h3>
                                    <p className="text-sm leading-relaxed text-muted-foreground">
                                        {description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ============ HOW IT WORKS ============ */}
                <section
                    id="how-it-works"
                    className="border-t bg-muted/30 px-4 py-24 md:px-8 md:py-32"
                >
                    <div className="mx-auto max-w-6xl">
                        <div className="mx-auto mb-16 max-w-xl text-center">
                            <h2 className="font-heading text-3xl font-semibold tracking-tight md:text-4xl">
                                How Sovyniq works
                            </h2>
                            <p className="mt-4 text-muted-foreground">
                                From scattered information to useful
                                knowledge in three simple steps.
                            </p>
                        </div>

                        <div className="grid gap-10 md:grid-cols-3 md:gap-0">
                            {STEPS.map((step, i) => (
                                <div
                                    key={step.number}
                                    className={`relative space-y-3 md:px-8 ${
                                        i > 0
                                            ? "md:border-l md:border-border"
                                            : ""
                                    }`}
                                >
                                    <span className="font-heading text-4xl font-semibold text-muted-foreground/30">
                                        {step.number}
                                    </span>
                                    <h3 className="font-heading text-lg font-semibold">
                                        {step.title}
                                    </h3>
                                    <p className="text-sm leading-relaxed text-muted-foreground">
                                        {step.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ============ AI CHAT SECTION ============ */}
                <section className="relative overflow-hidden bg-[#0B0B0E] px-4 py-24 text-white md:px-8 md:py-32">
                    <MatteGridBackdrop
                        gridSize={32}
                        maskShape="ellipse 70% 70% at 50% 50%"
                    />

                    <div className="relative mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
                        <div className="space-y-5">
                            <h2 className="text-balance font-heading text-3xl font-semibold tracking-tight md:text-4xl">
                                Your knowledge. One intelligent workspace.
                            </h2>
                            <p className="max-w-md leading-relaxed text-[#A1A1AA]">
                                Ask questions across your sources and get
                                answers grounded in the information you
                                trust.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                            <div className="mb-4 flex justify-end">
                                <div className="max-w-[85%] rounded-xl rounded-tr-sm bg-white/10 px-4 py-2.5 text-sm">
                                    What are the key ideas across these
                                    documents?
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <span
                                        className="size-2 rounded-full"
                                        style={{
                                            background: BRAND_GRADIENT_DIAGONAL,
                                        }}
                                    />
                                    <span className="text-xs font-medium text-[#A1A1AA]">
                                        Sovyniq
                                    </span>
                                </div>
                                <p className="text-sm leading-relaxed text-[#D4D4D8]">
                                    Here are the four key ideas I found
                                    across your sources.
                                </p>
                                <div className="flex flex-wrap gap-2 pt-1 text-xs text-[#A1A1AA]">
                                    <span>[1] Research Paper.pdf</span>
                                    <span>[2] Strategy Document.pdf</span>
                                    <span>[3] Website Research</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ============ PRICING ============ */}
                <section id="pricing" className="px-4 py-24 md:px-8 md:py-32">
                    <div className="mx-auto max-w-6xl">
                        <div className="mx-auto mb-12 max-w-xl text-center">
                            <h2 className="font-heading text-3xl font-semibold tracking-tight md:text-4xl">
                                Simple pricing. Start free.
                            </h2>
                            <p className="mt-4 text-muted-foreground">
                                Every account starts with 50 free credits.
                                Upgrade when you need more.
                            </p>
                        </div>

                        <div className="mx-auto mb-12 flex max-w-xl flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-2">
                                <CheckIcon className="size-4 text-primary" />
                                Chat messages — 1 credit
                            </span>
                            <span className="flex items-center gap-2">
                                <CheckIcon className="size-4 text-primary" />
                                Source uploads — 3 credits
                            </span>
                            <span className="flex items-center gap-2">
                                <CheckIcon className="size-4 text-primary" />
                                Generated artifacts — 5 credits
                            </span>
                        </div>

                        <PublicPricingSection />

                        <p className="mt-8 text-center text-sm text-muted-foreground">
                            <Link
                                href={authRoutes.login}
                                className="underline underline-offset-4"
                            >
                                Sign in
                            </Link>{" "}
                            first to purchase credits or subscribe.
                        </p>
                    </div>
                </section>

                {/* ============ FINAL CTA ============ */}
                <section className="relative overflow-hidden border-t px-4 py-24 text-center md:px-8 md:py-32">
                    <div
                        aria-hidden
                        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[380px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.12] blur-[110px]"
                        style={{ background: BRAND_GRADIENT }}
                    />
                    <div className="mx-auto max-w-xl space-y-5">
                        <h2 className="text-balance font-heading text-3xl font-semibold tracking-tight md:text-4xl">
                            Start building your knowledge workspace.
                        </h2>
                        <p className="text-muted-foreground">
                            Bring your sources together and let Sovyniq do
                            the rest.
                        </p>
                        <div className="pt-2">
                            <Button
                                nativeButton={false}
                                size="lg"
                                render={<Link href={authRoutes.login} />}
                            >
                                Get Started — It&apos;s Free
                            </Button>
                        </div>
                    </div>
                </section>
            </main>

            {/* ============ FOOTER ============ */}
            <footer className="border-t py-10">
                <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 text-sm text-muted-foreground sm:flex-row md:px-8">
                    <div className="flex flex-col items-center gap-1 sm:items-start">
                        <SovyniqLogo
                            className="font-heading text-sm font-semibold tracking-tight"
                            size="sm"
                        />
                        <span className="text-xs">
                            Your AI Knowledge Workspace
                        </span>
                    </div>

                    <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
                        <a href="#features" className="hover:text-foreground">
                            Features
                        </a>
                        <a href="#pricing" className="hover:text-foreground">
                            Pricing
                        </a>
                        {/* Docs/Privacy/Terms routes aren't part of the provided
                            architecture yet — point these at real pages once they
                            exist, or remove until then to avoid dead links. */}
                        <Link href="/docs" className="hover:text-foreground">
                            Docs
                        </Link>
                        <Link href="/privacy" className="hover:text-foreground">
                            Privacy
                        </Link>
                        <Link href="/terms" className="hover:text-foreground">
                            Terms
                        </Link>
                    </nav>
                </div>
            </footer>
        </div>
    );
}