/**
 * Design Comparison Page
 * 
 * A comprehensive page to preview and compare all 12 marketing page designs.
 * Navigate to /designs to see all options.
 * 
 * V2 Designs: Meridian, Prism, Terraform, Voltage, Chronicle, Fusion
 * V1 Designs: Cosmic, Amber, Neon, Organic, Brutalist, Editorial
 */

import { Link, useSearchParams } from "react-router";
import { Eye, ExternalLink, Sparkles, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// V2 Design metadata (new comprehensive designs)
const v2Designs = [
  {
    id: "meridian",
    name: "Meridian",
    description: "Nautical navigation theme with vintage cartography aesthetic. 'Chart your social course.'",
    theme: "Nautical, Navigation",
    colors: "Navy, Gold, Cream",
    font: "Crimson Pro",
    preview: "bg-[#0a1628]",
    accent: "#c9a227",
  },
  {
    id: "prism",
    name: "Prism",
    description: "Light refraction concept with prismatic rainbow edges on a clean white canvas.",
    theme: "Light, Clarity, Modern",
    colors: "White, Rainbow spectrum",
    font: "Space Grotesk",
    preview: "bg-white border border-zinc-200",
    accent: "rainbow",
  },
  {
    id: "prism-mist",
    name: "Prism Mist",
    description: "Teal/cyan clarity theme with glass morphism, noise texture, and subtle gradients.",
    theme: "Glass, Clarity, Fresh",
    colors: "White, Teal, Cyan",
    font: "Space Grotesk",
    preview: "bg-[#fafafa] border border-zinc-200",
    accent: "#14b8a6",
  },
  {
    id: "prism-aurora",
    name: "Prism Aurora",
    description: "Dark emerald theme inspired by northern lights with ethereal glow and glass morphism.",
    theme: "Aurora, Dark, Ethereal",
    colors: "Slate, Emerald, Lime",
    font: "Space Grotesk",
    preview: "bg-[#0f172a]",
    accent: "#10b981",
  },
  {
    id: "prism-dusk",
    name: "Prism Dusk",
    description: "Twilight elegance with slate/indigo/blue palette, serene and professional.",
    theme: "Twilight, Calm, Professional",
    colors: "White, Indigo, Sky",
    font: "Space Grotesk",
    preview: "bg-[#faf9f7] border border-zinc-200",
    accent: "#6366f1",
  },
  {
    id: "terraform",
    name: "Terraform",
    description: "Topographic landscape theme with contour lines. 'Build your social landscape.'",
    theme: "Topographic, Nature",
    colors: "Slate, Green, Terracotta",
    font: "DM Sans",
    preview: "bg-[#1a1d21]",
    accent: "#3d8b5f",
  },
  {
    id: "voltage",
    name: "Voltage",
    description: "Electric energy theme with clean power aesthetics. Lightning-fast performance.",
    theme: "Electric, Clean Power",
    colors: "White, Electric Blue",
    font: "Inter",
    preview: "bg-white border border-zinc-200",
    accent: "#0066ff",
  },
  {
    id: "chronicle",
    name: "Chronicle",
    description: "Timeline/manuscript aesthetic with chapter markers. 'Your story, beautifully told.'",
    theme: "Editorial, Documentary",
    colors: "Cream, Ink, Burgundy",
    font: "Playfair Display",
    preview: "bg-[#faf8f5]",
    accent: "#8b2635",
  },
  {
    id: "fusion",
    name: "Fusion",
    description: "Japanese minimalism meets Nordic design. Extreme whitespace, zen-like balance.",
    theme: "Minimal, Zen, Nordic",
    colors: "White, Gray, Persimmon",
    font: "Inter",
    preview: "bg-[#fefefe]",
    accent: "#d4442a",
  },
];

// V1 Design metadata (original designs)
const v1Designs = [
  {
    id: "cosmic",
    name: "Cosmic Dark",
    description: "Deep space theme with ethereal purple/cyan gradients, animated stars, and glass morphism",
    theme: "Space, Ethereal",
    colors: "Indigo, Purple, Cyan",
    font: "Outfit",
    preview: "bg-gradient-to-br from-purple-950 via-indigo-950 to-black",
    accent: "#a855f7",
  },
  {
    id: "amber",
    name: "Warm Amber",
    description: "Luxury premium feel with warm gold tones, elegant serif typography, and refined details",
    theme: "Luxury, Premium",
    colors: "Amber, Gold, Cream",
    font: "Playfair Display",
    preview: "bg-gradient-to-br from-amber-950 via-amber-900 to-black",
    accent: "#f59e0b",
  },
  {
    id: "neon",
    name: "Neon Cyber",
    description: "Cyberpunk aesthetic with vibrant neon colors, glitch effects, and bold tech typography",
    theme: "Cyberpunk, Electric",
    colors: "Cyan, Magenta, Yellow",
    font: "Orbitron",
    preview: "bg-black",
    accent: "#06b6d4",
  },
  {
    id: "organic",
    name: "Nature Organic",
    description: "Natural, calming aesthetic with soft greens, organic shapes, and flowing animations",
    theme: "Natural, Calming",
    colors: "Sage, Terracotta, Cream",
    font: "Fraunces",
    preview: "bg-gradient-to-br from-emerald-950 via-emerald-900 to-black",
    accent: "#10b981",
  },
  {
    id: "brutalist",
    name: "Brutalist Bold",
    description: "Raw, powerful design with massive typography, harsh contrasts, and intentional boldness",
    theme: "Raw, Bold",
    colors: "Black, White, Red",
    font: "Bebas Neue",
    preview: "bg-black",
    accent: "#ef4444",
  },
  {
    id: "editorial",
    name: "Editorial Refined",
    description: "Magazine-style sophistication with elegant typography, clean grids, and refined spacing",
    theme: "Magazine, Sophisticated",
    colors: "Off-white, Charcoal",
    font: "Cormorant Garamond",
    preview: "bg-[#f5f5f3]",
    accent: "#3b82f6",
  },
];

// Import all design components
import { MarketingMeridian } from "./meridian";
import { MarketingPrism } from "./prism";
import { MarketingPrismMist } from "./prism-mist";
import { MarketingPrismAurora } from "./prism-aurora";
import { MarketingPrismDusk } from "./prism-dusk";
import { MarketingTerraform } from "./terraform";
import { MarketingVoltage } from "./voltage";
import { MarketingChronicle } from "./chronicle";
import { MarketingFusion } from "./fusion";
import { MarketingCosmic } from "./cosmic";
import { MarketingAmber } from "./amber";
import { MarketingNeon } from "./neon";
import { MarketingOrganic } from "./organic";
import { MarketingBrutalist } from "./brutalist";
import { MarketingEditorial } from "./editorial";

const designComponents: Record<string, React.ComponentType> = {
  // V2
  meridian: MarketingMeridian,
  prism: MarketingPrism,
  "prism-mist": MarketingPrismMist,
  "prism-aurora": MarketingPrismAurora,
  "prism-dusk": MarketingPrismDusk,
  terraform: MarketingTerraform,
  voltage: MarketingVoltage,
  chronicle: MarketingChronicle,
  fusion: MarketingFusion,
  // V1
  cosmic: MarketingCosmic,
  amber: MarketingAmber,
  neon: MarketingNeon,
  organic: MarketingOrganic,
  brutalist: MarketingBrutalist,
  editorial: MarketingEditorial,
};

type DesignMeta = {
  id: string;
  name: string;
  description: string;
  theme: string;
  colors: string;
  font: string;
  preview: string;
  accent: string;
};

function DesignCard({ design }: { design: DesignMeta }) {
  const isLight = design.preview.includes("white") || design.preview.includes("faf") || design.preview.includes("fef") || design.preview.includes("f5f");
  
  return (
    <div
      className={cn(
        "group relative rounded-lg border overflow-hidden transition-all duration-300",
        "hover:shadow-xl hover:-translate-y-1",
        isLight ? "border-zinc-200 hover:border-zinc-400" : "border-zinc-800 hover:border-zinc-600"
      )}
    >
      {/* Preview swatch */}
      <div className={cn("h-36 relative overflow-hidden", design.preview)}>
        {/* Accent indicator */}
        {design.accent !== "rainbow" && (
          <div
            className="absolute top-3 right-3 w-4 h-4 rounded-full shadow-sm"
            style={{ backgroundColor: design.accent }}
          />
        )}
        {design.accent === "rainbow" && (
          <div className="absolute top-3 right-3 w-4 h-4 rounded-full bg-gradient-to-r from-rose-500 via-emerald-500 to-violet-500" />
        )}
        
        {/* Design preview indicator */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn(
            "font-medium text-lg",
            isLight ? "text-zinc-300" : "text-white/20"
          )}>
            {design.name}
          </span>
        </div>
        
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
          <Link
            to={`/designs?preview=${design.id}`}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Button className="bg-white text-black hover:bg-zinc-100">
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
          </Link>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 bg-zinc-900">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-white">{design.name}</h3>
          <span className="text-[10px] text-zinc-500 px-2 py-0.5 bg-zinc-800 rounded">{design.font.split(" ")[0]}</span>
        </div>
        <p className="text-xs text-zinc-400 mb-3 line-clamp-2">{design.description}</p>
        
        <div className="flex flex-wrap gap-1">
          {design.theme.split(", ").map((tag) => (
            <span key={tag} className="text-[10px] text-zinc-500 px-1.5 py-0.5 border border-zinc-700 rounded">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function DesignComparisonPage() {
  const [searchParams] = useSearchParams();
  const previewId = searchParams.get("preview");

  // If previewing a specific design, render it
  if (previewId && designComponents[previewId]) {
    const PreviewComponent = designComponents[previewId];
    return (
      <div className="relative">
        {/* Floating back button */}
        <div className="fixed top-4 left-4 z-[100]">
          <Link to="/designs">
            <Button 
              variant="secondary"
              className="bg-black/80 backdrop-blur-sm text-white hover:bg-black border border-white/20 shadow-lg"
            >
              ← All Designs
            </Button>
          </Link>
        </div>
        <PreviewComponent />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="border-b border-zinc-800">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Heimdall Design System</h1>
              <p className="text-sm text-zinc-500 mt-1">12 distinct marketing page designs</p>
            </div>
            <Link to="/">
              <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                View Active Design
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-6 py-10">
        
        {/* V2 Designs Section */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="w-5 h-5 text-violet-400" />
            <h2 className="text-xl font-semibold">New Designs (V2)</h2>
            <span className="text-xs bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded-full">Recommended</span>
          </div>
          <p className="text-zinc-500 text-sm mb-8 max-w-2xl">
            Comprehensive pages with unique brand identity. Each includes hero, features, stats, pricing, testimonials, FAQ, forms, integrations, and footer sections.
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {v2Designs.map((design) => (
              <DesignCard key={design.id} design={design} />
            ))}
          </div>
        </section>

        {/* V1 Designs Section */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <Archive className="w-5 h-5 text-zinc-500" />
            <h2 className="text-xl font-semibold text-zinc-400">Original Designs (V1)</h2>
          </div>
          <p className="text-zinc-600 text-sm mb-8 max-w-2xl">
            Earlier design explorations with focused sections. Good for reference or specific aesthetic needs.
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {v1Designs.map((design) => (
              <DesignCard key={design.id} design={design} />
            ))}
          </div>
        </section>

        {/* Instructions */}
        <div className="mt-16 p-6 rounded-xl border border-zinc-800 bg-zinc-900/50">
          <h3 className="font-semibold mb-4">How to switch the active design</h3>
          <p className="text-sm text-zinc-400 mb-4">
            Edit the export in{" "}
            <code className="text-cyan-400 bg-zinc-800 px-2 py-0.5 rounded">src/pages/marketing/index.tsx</code>
          </p>
          <pre className="text-xs bg-zinc-950 p-4 rounded-lg overflow-x-auto">
            <code className="text-zinc-300">
{`// V2 Designs (Recommended)
export { MarketingMeridian as MarketingPage } from "./meridian";   // Nautical
export { MarketingPrism as MarketingPage } from "./prism";         // Light/Rainbow
export { MarketingTerraform as MarketingPage } from "./terraform"; // Topographic  
export { MarketingVoltage as MarketingPage } from "./voltage";     // Electric Blue
export { MarketingChronicle as MarketingPage } from "./chronicle"; // Manuscript
export { MarketingFusion as MarketingPage } from "./fusion";       // Zen Minimal

// V1 Designs
export { MarketingCosmic as MarketingPage } from "./cosmic";       // Space
export { MarketingAmber as MarketingPage } from "./amber";         // Luxury Gold
export { MarketingNeon as MarketingPage } from "./neon";           // Cyberpunk
export { MarketingOrganic as MarketingPage } from "./organic";     // Nature
export { MarketingBrutalist as MarketingPage } from "./brutalist"; // Raw Bold
export { MarketingEditorial as MarketingPage } from "./editorial"; // Magazine`}
            </code>
          </pre>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 mt-12 py-6">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <p className="text-sm text-zinc-600">
            Heimdall Design System • 12 Distinct Directions
          </p>
        </div>
      </footer>
    </div>
  );
}
