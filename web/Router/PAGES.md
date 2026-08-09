# PAGES.md -- Complete App Router Page Inventory

> Generated on 2026-07-19

---

## 1. Full Directory Tree

Below is the complete recursive directory structure of `src/app/`. Route groups (parentheses) and dynamic segments (brackets) are shown as-is.

```
src/app/
├── api/
│   ├── api/
│   │   └── v1/
│   │       └── [...path]/
│   │           └── route.ts
│   ├── chat/
│   │   └── route.ts
│   └── friday/
│       └── chat/
│           └── route.ts
├── game/
│   ├── game.tsx
│   └── page.tsx
├── (app)/
│   ├── layout.tsx
│   ├── (blocks)/
│   │   ├── layout.tsx
│   │   ├── blocks/
│   │   │   ├── (list)/
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx
│   │   │   │   ├── blocks-nav.tsx
│   │   │   │   └── [category]/
│   │   │   │       └── page.tsx
│   │   │   └── (view)/
│   │   │       └── [category]/
│   │   │           └── [name]/
│   │   │               └── page.tsx
│   │   └── components/
│   │       └── showcase/
│   │           ├── page.tsx
│   │           └── grid-item.tsx
│   ├── (docs)/
│   │   ├── layout.tsx
│   │   ├── blog/
│   │   │   └── [slug]/
│   │   │       └── page.tsx
│   │   └── components/
│   │       ├── layout.tsx
│   │       ├── sidebar.tsx
│   │       ├── sidebar-icon.tsx
│   │       └── [slug]/
│   │           └── page.tsx
│   └── (pages)/
│       ├── layout.tsx
│       ├── blog/
│       │   └── page.tsx
│       ├── components/
│       │   ├── page.tsx
│       │   └── component-item.tsx
│       ├── sponsors/
│       │   └── page.tsx
│       └── testimonials/
│           └── page.tsx
├── (dx)/
│   ├── layout.tsx
│   ├── page.tsx
│   └── chat/
│       └── [...slug]/
│           └── page.tsx
├── (preview)/
│   ├── components/
│   │   ├── block-display.tsx
│   │   ├── block-viewer.tsx
│   │   └── preview-provider.tsx
│   ├── hooks/
│   │   └── use-iframe-sync.tsx
│   ├── lib/
│   │   ├── get-themes.ts
│   │   ├── search-params.ts
│   │   ├── shadcn.ts
│   │   ├── theme-css-vars.ts
│   │   ├── theme-fonts.ts
│   │   ├── theme-item.ts
│   │   └── tweakcn.ts
│   └── preview/
│       ├── layout.tsx
│       └── [name]/
│           └── page.tsx
├── layout.tsx
└── not-found.tsx
```
## 2. Page-by-Page Analysis

### 2.1 Root Layout

#### / -- src/app/layout.tsx
| Property | Value |
|---|---|
| **Route path** | / (root layout, wraps all pages) |
| **Type** | Static layout |
| **Title template** | %s - {SITE_INFO.name} |
| **Default title** | {USER.displayName} - {USER.jobTitle} |
| **Description** | From SITE_INFO.description |
| **Key features** | Sets up HTML/body, dark mode script, avatar lights script, JSON-LD WebSite schema, viewport meta, theme-color meta, font variables, <Providers> wrapper, <NuqsAdapter> for URL search params |
| **Fonts** | Dynamic font variables via ontVariables |
| **Icons** | Favicon (SVG light/dark), apple-touch-icon |

### 2.2 Root Not-Found

#### 404 -- src/app/not-found.tsx
| Property | Value |
|---|---|
| **Route path** | Catch-all not-found (404) |
| **Type** | Static page |
| **Title** | "Page Not Found" |
| **Description** | Renders a custom <NotFound> component from @/components/not-found |
| **Key features** | Imports Daikanoid CSS for background effect |

### 2.3 Route Group: (dx) -- AI Chat Shell

#### /(dx) -- Layout: src/app/(dx)/layout.tsx
| Property | Value |
|---|---|
| **Type** | Pass-through layout (renders children directly with a Fragment) |

#### /(dx)/ -- src/app/(dx)/page.tsx
| Property | Value |
|---|---|
| **Route path** | / (site index) |
| **Type** | Static page (client-rendered chat) |
| **Title/h1** | N/A (page has no explicit h1; title set by root layout default) |
| **Description** | Home page that renders the Chat component for the DX (developer experience) AI assistant |
| **Features** | <Chat swapped /> -- DX AI chat interface with swapped layout |

#### /(dx)/chat/[...slug] -- src/app/(dx)/chat/[...slug]/page.tsx
| Property | Value |
|---|---|
| **Route path** | /chat/[...slug] (catch-all segments, e.g., /chat/abc/def) |
| **Type** | Dynamic (static params returned as empty array -- no pre-rendering) |
| **Title/h1** | N/A |
| **Description** | Same Chat component as home but accessed via a catch-all slug route (supports deep-linking into chat conversations) |
| **Features** | <Chat swapped />, generateStaticParams() returns [] (all dynamic) |

### 2.4 Route Group: (app) -- Main App Shell

#### /(app) -- Layout: src/app/(app)/layout.tsx
| Property | Value |
|---|---|
| **Type** | Main app layout |
| **Components** | <SiteHeader>, <SiteFooter>, <SiteBottomNav>, <ScrollToTop> (dynamic import), fade/gradient bottom overlay for bottom nav |
| **Layout** | group/layout relative isolate wrapper, max-w-screen overflow-x-clip px-2 main |

#### Subgroup: (pages) -- Static Content Pages

##### /(app)/(pages) -- Layout: src/app/(app)/(pages)/layout.tsx
| Property | Value |
|---|---|
| **Type** | Centered content layout |
| **Layout** | mx-auto border-x border-line pt-12 md:max-w-3xl |

##### /blog -- src/app/(app)/(pages)/blog/page.tsx
| Property | Value |
|---|---|
| **Route path** | /blog |
| **Type** | Static page (dynamic search via client component) |
| **Title/h1** | "Blog" / tagline: "Writing about code, design, and everything in between." |
| **Description** | Blog listing page showing all blog posts with search/filter capability |
| **Schema** | Blog JSON-LD with blogPost list |
| **Breadcrumbs** | Home -> Blog |
| **Key features** | <PostSearchInput> (Suspense-wrapped), <PostListWithSearch> / <PostList> fallback, <PageHeading>, structured JSON-LD for each post |

##### /components -- src/app/(app)/(pages)/components/page.tsx
| Property | Value |
|---|---|
| **Route path** | /components |
| **Type** | Static page |
| **Title/h1** | "Components" / tagline: "Pixel-perfect, uniquely crafted." |
| **Description** | Component library listing page. Shows all shadcn/ui registry components with grid/list view |
| **Schema** | CollectionPage JSON-LD with ItemList |
| **Breadcrumbs** | Home -> Components |
| **Key features** | <RegistryCommandAnimated> (install command), <ComponentList> with grid layout (responsive 1-3 columns), "New components" section, "Trusted Registry" badge/link, toggle between list/showcase views |
| **Sub-components** | ComponentItem, ComponentItemIcon, ComponentItemDot, ComponentItemTitle |

##### /sponsors -- src/app/(app)/(pages)/sponsors/page.tsx
| Property | Value |
|---|---|
| **Route path** | /sponsors |
| **Type** | Static page |
| **Title/h1** | "Sponsors" / "Backed by the community." |
| **Description** | Shows sponsors grouped by tier (OSPs, Silver, Spark Supporters) with logos |
| **Breadcrumbs** | Home -> Sponsors |
| **Key features** | <SponsorItem> per sponsor, grouped by SPONSOR_TIERS, grid layout, "Sponsor my work" CTA button linking to SPONSORSHIP_URL |

##### /testimonials -- src/app/(app)/(pages)/testimonials/page.tsx
| Property | Value |
|---|---|
| **Route path** | /testimonials |
| **Type** | Static page |
| **Title/h1** | "Testimonials" / "Trusted by top builders on X" |
| **Description** | Shows testimonials from community members in a 2-column grid |
| **Breadcrumbs** | Home -> Testimonials |
| **Key features** | <Testimonial> cards with quote, author avatar, name, tagline; <Twemoji> for emoji rendering; grayscale-to-color hover effect; data sourced from TESTIMONIALS_1 and TESTIMONIALS_2 |

#### Subgroup: \(docs)\ -- Documentation Pages

##### \/(app)/(docs)\ -- Layout: \src/app/(app)/(docs)/layout.tsx\
| Property | Value |
|---|---|
| **Type** | Docs layout |
| **Layout** | Adds a spacer bar (\h-12 border-x border-line md:max-w-3xl\) above children |

##### \/blog/[slug]\ -- \src/app/(app)/(docs)/blog/[slug]/page.tsx\
| Property | Value |
|---|---|
| **Route path** | \/blog/[slug]\ (e.g., \/blog/my-post\) |
| **Type** | Static generation (\dynamic = "force-static"\, \dynamicParams = false\) |
| **Title/h1** | Dynamic -- from MDX frontmatter (\doc.metadata.title\) |
| **Description** | Individual blog post rendered from MDX content with table of contents, previous/next navigation |
| **Schema** | \BlogPosting\ JSON-LD |
| **Breadcrumbs** | Home -> Blog -> [post title] |
| **Key features** | \<MDX code={doc.content}>\ rendering, \<TOCInline>\ (mobile), \<TOCMinimap>\ (desktop sidebar), \<DocShareMenu>\, \<LLMCopyButtonWithViewOptions>\, keyboard shortcuts for prev/next, \<DocKeyboardShortcuts>\, \<Prose>\ typography wrapper |
| **SEO** | Full OpenGraph/article metadata with published/modified times, canonical URL |

##### \/components/[slug]\ -- \src/app/(app)/(docs)/components/[slug]/page.tsx\
| Property | Value |
|---|---|
| **Route path** | \/components/[slug]\ (e.g., \/components/button\) |
| **Type** | Static generation (\dynamic = "force-static"\, \dynamicParams = false\) |
| **Title/h1** | Dynamic -- from MDX frontmatter (\doc.metadata.title\) |
| **Description** | Individual component documentation page with file sidebar, MDX content, code viewer, TOC |
| **Schema** | \SoftwareSourceCode\ JSON-LD |
| **Breadcrumbs** | Home -> Components -> [component title] |
| **Key features** | Left sidebar (\<Sidebar>\ with all component links), \<MDX code={doc.content}>\, \<TOCMinimap>\ (right sticky column), \<DocShareMenu>\, \<LLMCopyButtonWithViewOptions>\ (isComponent mode), \<DocSponsors>\, keyboard shortcuts for prev/next |

##### \/(app)/(docs)/components\ -- Layout: \src/app/(app)/(docs)/components/layout.tsx\
| Property | Value |
|---|---|
| **Type** | Component docs layout with sidebar |
| **Layout** | \<DocPageRoot>\ -> \<DocGrid>\ -> \<DocLeftCol>\ (sidebar) + children (content) |
| **Sidebar** | Generated from \getComponentDocs()\, sorted alphabetically, rendered via \<Sidebar>\ / \<SidebarContent>\ |

#### Subgroup: \(blocks)\ -- Blocks Section

##### \/(app)/(blocks)\ -- Layout: \src/app/(app)/(blocks)/layout.tsx\
| Property | Value |
|---|---|
| **Type** | Wide app layout for blocks section |
| **Layout** | \container mx-auto border-x border-line pt-12\ |

##### \/(app)/(blocks)/blocks/(list)\ -- Layout: \src/app/(app)/(blocks)/blocks/(list)/layout.tsx\
| Property | Value |
|---|---|
| **Type** | Blocks listing layout |
| **Layout** | \<PageHeading>\ ("Blocks / Beautifully designed, production-ready."), \<BlocksNav>\ (category tabs), stripe divider, "More blocks on the way..." footer |
| **Nav** | \<BlocksNav>\ -- client component showing "All" + category links (from \lockCategories\ config) |

##### \/blocks\ -- \src/app/(app)/(blocks)/blocks/(list)/page.tsx\
| Property | Value |
|---|---|
| **Route path** | \/blocks\ |
| **Type** | Static generation (\dynamic = "force-static"\) |
| **Title/h1** | \"Blocks"\ / description: \"Beautifully designed, production-ready."\ |
| **Description** | Lists all registry blocks in a flat list with live preview and code tabs |
| **Schema** | \CollectionPage\ JSON-LD with ItemList |
| **Breadcrumbs** | Home -> Blocks |
| **Key features** | \<BlockDisplay name={name}>\ for each block from \locks.json\, stripe separators between blocks |

##### \/blocks/[category]\ -- \src/app/(app)/(blocks)/blocks/(list)/[category]/page.tsx\
| Property | Value |
|---|---|
| **Route path** | \/blocks/[category]\ (e.g., \/blocks/portfolio\) |
| **Type** | Static generation (\dynamic = "force-static"\, \dynamicParams = false\) |
| **Title/h1** | Dynamic -- from \lockCategories\ config |
| **Description** | Lists blocks filtered by a specific category |
| **Schema** | \CollectionPage\ JSON-LD with ItemList |
| **Breadcrumbs** | Home -> Blocks -> [category title] |
| **Key features** | \generateStaticParams()\ from \lockCategories\, \getAllBlockIds(["registry:block"], [category])\, displays blocks via \<BlockDisplay>\ |

##### \/blocks/[category]/[name]\ -- \src/app/(app)/(blocks)/blocks/(view)/[category]/[name]/page.tsx\
| Property | Value |
|---|---|
| **Route path** | \/blocks/[category]/[name]\ (e.g., \/blocks/portfolio/hero-section\) |
| **Type** | Static generation (\dynamic = "force-static"\, \dynamicParams = false\) |
| **Title/h1** | Dynamic -- from registry item name |
| **Description** | Individual block view page with full preview, code viewer, and navigation between blocks |
| **Schema** | \SoftwareSourceCode\ JSON-LD |
| **Breadcrumbs** | Home -> Blocks -> [category title] -> [block name] |
| **Key features** | \<BlockDisplay name={name}>\, prev/next navigation with keyboard shortcuts, \<DocShareMenu>\, custom \indNeighbour()\ function, \<DocKeyboardShortcuts>\ |

##### \/components/showcase\ -- \src/app/(app)/(blocks)/components/showcase/page.tsx\
| Property | Value |
|---|---|
| **Route path** | \/components/showcase\ |
| **Type** | Static page |
| **Title/h1** | \"Component Showcase"\ / \"Pixel-perfect, uniquely crafted."\ |
| **Description** | Visual grid showcase of interactive component demos (26+ demos) |
| **Breadcrumbs** | Home -> Components -> Component Showcase |
| **Key features** | 3-column responsive grid with 26+ live demos including: Apple Hello Effect, Slide to Unlock, Theme Switcher, Elastic Slider, Wheel Picker, Middle Truncation, GitHub Contributions, Text Flip, Copy Button, Brand Assets Menu, Code Block Command, Icon Swap, Twemoji, Fluid Gradient Text, Shimmering Text, Testimonials Marquee, Glow Card Grid, GitHub Stars, TOC Minimap, Scroll Fade Effect, Work Experience, Haptic, Dot Grid Spotlight, and more. Toggle between Showcase/List view |

### 2.5 Route Group: \(preview)\ -- Standalone Preview

#### \/(preview)/preview\ -- Layout: \src/app/(preview)/preview/layout.tsx\
| Property | Value |
|---|---|
| **Type** | Preview layout with dial floating button |
| **Features** | Imports \dialkit/styles.css\, wraps children in \<DialRoot position="top-right">\ |

#### \/preview/[name]\ -- \src/app/(preview)/preview/[name]/page.tsx\
| Property | Value |
|---|---|
| **Route path** | \/preview/[name]\ (e.g., \/preview/hero-section\) |
| **Type** | Static generation (\dynamic = "force-static"\, \dynamicParams = false\) |
| **Title/h1** | Dynamic -- from registry item name |
| **Description** | Standalone iframe-friendly preview page for registry items (blocks and examples). Used for rendering inside block viewer iframes |
| **Robots** | \index: false, follow: false\ |
| **Key features** | \<PreviewProvider themes={themes}>\ wrapper, dynamic theme application (CSS vars + fonts), renders \Index[name]?.component\ (the actual block/example component), supports multiple themes via shadcn/tweakcn |

**Supporting files (not routes but critical to preview):**
- \components/block-viewer.tsx\ -- Full-featured block viewer with Preview/Code tabs, responsive resize (mobile/tablet/desktop), file tree sidebar, syntax-highlighted code, theme picker, copy-to-clipboard, open-in-v0, iframe sync
- \components/block-display.tsx\ -- Server component that fetches registry item and renders BlockViewer
- \components/preview-provider.tsx\ -- Client component handling theme application via CSS vars and fonts
- \hooks/use-iframe-sync.tsx\ -- postMessage-based iframe sync hook
- \lib/\ -- Theme utilities (shadcn, tweakcn, CSS vars, fonts, search params)

### 2.6 Standalone Page: \/game\

#### \/game\ -- \src/app/game/page.tsx\
| Property | Value |
|---|---|
| **Route path** | \/game\ |
| **Type** | Static page (client-rendered game) |
| **Title/h1** | \"Daikanoid"\ (sr-only h1) |
| **Description** | Play the Daikanoid game (a breakout-style game). Desktop-only -- mobile users see a message to open on desktop |
| **OG Image** | \https://assets.chanhdai.com/images/blog/daikanoid.webp\ |
| **Key features** | \<Game>\ component (Suspense-wrapped), Daikanoid CSS, responsive: "Open this page on a desktop to play" on mobile, full game canvas on desktop |

### 2.7 API Routes

#### \/api/chat\ -- \src/app/api/chat/route.ts\
| Property | Value |
|---|---|
| **Route path** | \/api/chat\ |
| **Type** | API Route (POST) |
| **Methods** | \POST\ |
| **Description** | AI chat API endpoint supporting BYOK (Bring Your Own Key). Supports Google Gemini (with image generation tool) and OpenAI-compatible providers |
| **Features** | Streams text responses via \streamText\. Fallback to configured provider system (OpenCode). Supports: custom model ID, API key, provider key, provider ID. \generateImage\ tool for Gemini (via Pollinations.ai) |

#### \/api/friday/chat\ -- \src/app/api/friday/chat/route.ts\
| Property | Value |
|---|---|
| **Route path** | \/api/friday/chat\ |
| **Type** | API Route (POST, Edge Runtime) |
| **Methods** | \POST\ |
| **Runtime** | \dge\ |
| **Description** | Server-side proxy to OpenCode Zen free models. Streams OpenAI-compatible SSE responses as plain text |
| **Features** | \orce-dynamic\, transforms OpenAI SSE -> plain text stream, proxies to \\/chat/completions\, configurable model/messages/temperature |

#### \/api/api/v1/[...path]\ -- \src/app/api/api/v1/[...path]/route.ts\
| Property | Value |
|---|---|
| **Route path** | \/api/api/v1/[...path]\ (catch-all proxy) |
| **Type** | API Route (GET, POST) |
| **Methods** | \GET\, \POST\ |
| **Dynamic** | \orce-static\ with empty \generateStaticParams()\ |
| **Description** | Catch-all API proxy to muapi.ai (\https://api.muapi.ai/api/v1/...\). Passes through API key via \x-api-key\ header or \muapi_key\ cookie |
| **Features** | Cleans request headers (host, connection, cookie, content-length), forwards GET/POST requests to external API, returns JSON responses |

---

## 3. Summary Matrix

| Route | Type | Title/Description | Layout | Key Feature |
|---|---|---|---|---|
| \/\ | Static | DX Chat (AI assistant) | \(dx)/layout.tsx\ | Chat component, swapped layout |
| \/chat/[...slug]\ | Dynamic | DX Chat (deep link) | \(dx)/layout.tsx\ | Catch-all slug, Chat component |
| \/blog\ | Static | Blog listing | \(pages)/layout.tsx\ | Post search, post list, JSON-LD |
| \/blog/[slug]\ | Static Gen | Blog post (MDX) | \(docs)/layout.tsx\ | MDX rendering, TOC, prev/next |
| \/components\ | Static | Component library | \(pages)/layout.tsx\ | Grid list, registry cmd, new badges |
| \/components/[slug]\ | Static Gen | Component docs (MDX) | \(docs)/components/layout.tsx\ | Sidebar, MDX, code viewer, TOC |
| \/components/showcase\ | Static | Component demos grid | \(blocks)/layout.tsx\ | 26+ interactive live demos |
| \/sponsors\ | Static | Sponsor showcase | \(pages)/layout.tsx\ | Tiered sponsor grid, logos |
| \/testimonials\ | Static | Testimonials | \(pages)/layout.tsx\ | Testimonial cards, hover effects |
| \/blocks\ | Static Gen | All blocks | \(blocks)/layout.tsx\ + \(list)/layout.tsx\ | BlockDisplay per block, stripe separators |
| \/blocks/[category]\ | Static Gen | Blocks by category | \(blocks)/layout.tsx\ + \(list)/layout.tsx\ | Category-filtered BlockDisplay |
| \/blocks/[category]/[name]\ | Static Gen | Individual block | \(blocks)/layout.tsx\ | Full block viewer, prev/next |
| \/preview/[name]\ | Static Gen | Standalone preview | \(preview)/layout.tsx\ | Themeable iframe preview |
| \/game\ | Static | Daikanoid game | Root layout | Canvas game, desktop-only |
| \/api/chat\ | API (POST) | AI chat endpoint | -- | BYOK, streaming, Gemini/OpenAI |
| \/api/friday/chat\ | API (POST, Edge) | Zen chat proxy | -- | SSE->text stream, OpenCode Zen |
| \/api/api/v1/[...path]\ | API (GET, POST) | API proxy | -- | muapi.ai proxy, API key auth |
| 404 | Static | Not Found | Root layout | Custom NotFound component |

## 4. Route Group Summary

| Group | Purpose | Layout |
|---|---|---|
| \(app)\ | Main app shell (header, footer, bottom nav) | \SiteHeader\, \SiteFooter\, \SiteBottomNav\, \ScrollToTop\ |
| \(app)/(pages)\ | Static content pages (blog, components, sponsors, testimonials) | Centered content (\max-w-3xl\) |
| \(app)/(docs)\ | Documentation pages (blog posts, component docs) | Docs grid with optional sidebar/TOC |
| \(app)/(blocks)\ | Blocks section (list, category, individual view) | Wide container, block-specific nav |
| \(app)/(blocks)/blocks/(list)\ | Blocks listing route group | Page heading + BlocksNav |
| \(app)/(blocks)/blocks/(view)\ | Individual block view route group | Minimal (layout inherited from \(blocks)\) |
| \(dx)\ | AI chat experience | Pass-through (no chrome) |
| \(preview)\ | Standalone preview for iframes | Dial floating button, theme support |

## 5. Dynamic Route Patterns

| Pattern | Type | Example |
|---|---|---|
| \[slug]\ | Single dynamic segment | \/blog/my-post\, \/components/button\ |
| \[...slug]\ | Catch-all segments | \/chat/a/b/c\ |
| \[category]\ | Single dynamic segment | \/blocks/portfolio\ |
| \[category]/[name]\ | Two dynamic segments | \/blocks/portfolio/hero-section\ |
| \[...path]\ | Catch-all (API proxy) | \/api/api/v1/chat/completions\ |

## 6. API Routes Summary

| Endpoint | Methods | Runtime | Purpose |
|---|---|---|---|
| \/api/chat\ | POST | Node.js | AI chat with BYOK (Gemini/OpenAI) |
| \/api/friday/chat\ | POST | Edge | Proxy to OpenCode Zen free models |
| \/api/api/v1/[...path]\ | GET, POST | Node.js | Proxy to muapi.ai external API |
