/**
 * TERRAFORM - Topographic Landscape Theme
 * 
 * Design Philosophy: Building your social landscape. Survey, plan, cultivate.
 * 
 * Brand Identity:
 * - Dark slate (#1a1d21) as base
 * - Topographic green (#3d8b5f) as primary
 * - Terracotta (#c75d38) as accent
 * - Cream (#f5f0e6) for text
 * - Contour lines as signature pattern
 * 
 * Typography: DM Sans (clean geometric sans)
 * Signature: Elevation markers, contour rings, terrain terminology
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  RiMapLine,
  RiCompass4Line,
  RiSearchEyeLine,
  RiStackLine,
  RiRouteLine,
  RiFlag2Line,
  RiArrowRightLine,
  RiCheckLine,
  RiStarFill,
  RiAddLine,
  RiSubtractLine,
  RiTwitterXLine,
  RiInstagramLine,
  RiLinkedinBoxLine,
  RiLandscapeLine,
  RiPlantLine,
} from "@remixicon/react";

// === COMPONENTS ===

// Contour lines background
function ContourBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
      <svg className="w-full h-full" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice">
        <title>Topographic contour lines</title>
        {/* Contour rings */}
        {[100, 150, 200, 250, 300, 350, 400].map((r, i) => (
          <ellipse
            key={`contour-${i}`}
            cx="500"
            cy="600"
            rx={r}
            ry={r * 0.6}
            fill="none"
            stroke="#3d8b5f"
            strokeWidth="1"
            opacity={0.3 + i * 0.1}
          />
        ))}
        {/* Secondary contours */}
        {[120, 180, 250, 320].map((r, i) => (
          <ellipse
            key={`contour2-${i}`}
            cx="200"
            cy="300"
            rx={r}
            ry={r * 0.7}
            fill="none"
            stroke="#3d8b5f"
            strokeWidth="0.5"
            opacity={0.2 + i * 0.05}
          />
        ))}
        {[80, 130, 180, 230].map((r, i) => (
          <ellipse
            key={`contour3-${i}`}
            cx="850"
            cy="200"
            rx={r}
            ry={r * 0.5}
            fill="none"
            stroke="#3d8b5f"
            strokeWidth="0.5"
            opacity={0.2 + i * 0.05}
          />
        ))}
      </svg>
    </div>
  );
}

// Elevation marker
function ElevationMarker({ elevation, className = "" }: { elevation: string; className?: string }) {
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div className="w-4 h-4 border-2 border-[#3d8b5f] rotate-45" />
      <span className="font-mono text-xs tracking-wider text-[#3d8b5f]">{elevation}</span>
    </div>
  );
}

// Terrain card
function TerrainCard({
  children,
  className = "",
  variant = "default",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "elevated" | "peak";
}) {
  const variants = {
    default: "bg-[#1e2228] border border-[#3d8b5f]/20",
    elevated: "bg-[#252930] border border-[#3d8b5f]/30 shadow-xl shadow-black/20",
    peak: "bg-gradient-to-br from-[#3d8b5f]/20 to-[#1e2228] border border-[#3d8b5f]/40",
  };

  return (
    <div className={`rounded-lg ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
}

// Section heading with elevation
function SectionHeading({
  elevation,
  title,
  subtitle,
}: {
  elevation: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="text-center mb-16">
      <ElevationMarker elevation={elevation} className="justify-center mb-4" />
      <h2 className="text-4xl md:text-5xl font-bold text-[#f5f0e6] tracking-tight mb-4">
        {title}
      </h2>
      {subtitle && (
        <p className="text-lg text-[#f5f0e6]/60 max-w-2xl mx-auto">{subtitle}</p>
      )}
    </div>
  );
}

// Feature card
function FeatureCard({
  icon: Icon,
  title,
  description,
  elevation,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  elevation: string;
}) {
  return (
    <TerrainCard variant="default" className="p-6 group hover:border-[#3d8b5f]/50 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-lg bg-[#3d8b5f]/10 flex items-center justify-center border border-[#3d8b5f]/20 group-hover:bg-[#3d8b5f]/20 transition-colors">
          <Icon className="w-6 h-6 text-[#3d8b5f]" />
        </div>
        <span className="font-mono text-xs text-[#3d8b5f]/60">{elevation}</span>
      </div>
      <h3 className="text-lg font-semibold text-[#f5f0e6] mb-2">{title}</h3>
      <p className="text-[#f5f0e6]/60 leading-relaxed">{description}</p>
    </TerrainCard>
  );
}

// Pricing card
function PricingCard({
  name,
  price,
  period,
  description,
  features,
  isPopular,
  elevation,
}: {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  elevation: string;
}) {
  return (
    <TerrainCard
      variant={isPopular ? "peak" : "elevated"}
      className={`p-8 relative ${isPopular ? "ring-2 ring-[#3d8b5f]" : ""}`}
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#3d8b5f] text-[#1a1d21] text-xs font-semibold tracking-wider uppercase rounded-full">
          Summit
        </div>
      )}
      
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-[#f5f0e6]">{name}</h3>
        <span className="font-mono text-xs text-[#3d8b5f]">{elevation}</span>
      </div>
      <p className="text-sm text-[#f5f0e6]/50 mb-6">{description}</p>
      
      <div className="mb-8">
        <span className="text-4xl font-bold text-[#f5f0e6]">{price}</span>
        <span className="text-[#f5f0e6]/50 ml-2">/{period}</span>
      </div>
      
      <ul className="space-y-3 mb-8">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-3">
            <RiCheckLine className="w-5 h-5 text-[#3d8b5f] mt-0.5 shrink-0" />
            <span className="text-[#f5f0e6]/80">{feature}</span>
          </li>
        ))}
      </ul>
      
      <Button
        className={`w-full h-12 ${
          isPopular
            ? "bg-[#3d8b5f] hover:bg-[#4a9e6e] text-[#1a1d21]"
            : "bg-transparent border border-[#3d8b5f]/30 text-[#3d8b5f] hover:bg-[#3d8b5f]/10"
        }`}
      >
        Start Ascent
      </Button>
    </TerrainCard>
  );
}

// Testimonial card
function TestimonialCard({
  quote,
  author,
  role,
  rating,
}: {
  quote: string;
  author: string;
  role: string;
  rating: number;
}) {
  return (
    <TerrainCard variant="elevated" className="p-6">
      <div className="flex gap-1 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <RiStarFill
            key={`star-${i}`}
            className={`w-4 h-4 ${i < rating ? "text-[#c75d38]" : "text-[#c75d38]/20"}`}
          />
        ))}
      </div>
      <blockquote className="text-[#f5f0e6]/90 leading-relaxed mb-6 italic">
        "{quote}"
      </blockquote>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3d8b5f] to-[#2a6344] flex items-center justify-center text-[#f5f0e6] font-medium">
          {author.charAt(0)}
        </div>
        <div>
          <div className="font-medium text-[#f5f0e6]">{author}</div>
          <div className="text-sm text-[#f5f0e6]/50">{role}</div>
        </div>
      </div>
    </TerrainCard>
  );
}

// FAQ Accordion
function FaqItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-[#3d8b5f]/10 last:border-0">
      <button
        onClick={onToggle}
        className="w-full py-5 flex items-center justify-between text-left group"
      >
        <span className="font-medium text-[#f5f0e6] group-hover:text-[#3d8b5f] transition-colors pr-8">
          {question}
        </span>
        <div className={`w-6 h-6 flex items-center justify-center shrink-0 transition-colors ${isOpen ? "text-[#3d8b5f]" : "text-[#f5f0e6]/40"}`}>
          {isOpen ? <RiSubtractLine className="w-5 h-5" /> : <RiAddLine className="w-5 h-5" />}
        </div>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-96 pb-5" : "max-h-0"}`}>
        <p className="text-[#f5f0e6]/60 leading-relaxed">{answer}</p>
      </div>
    </div>
  );
}

// Stat display
function StatBlock({ value, label, icon: Icon }: { value: string; label: string; icon: React.ElementType }) {
  return (
    <div className="text-center p-6">
      <Icon className="w-6 h-6 text-[#c75d38] mx-auto mb-3" />
      <div className="text-3xl md:text-4xl font-bold text-[#f5f0e6] mb-1">{value}</div>
      <div className="text-sm text-[#f5f0e6]/50 uppercase tracking-wider">{label}</div>
    </div>
  );
}

// Integration item
function IntegrationItem({ name }: { name: string }) {
  return (
    <div className="px-4 py-3 bg-[#1e2228] border border-[#3d8b5f]/10 rounded-lg text-[#f5f0e6]/70 text-sm hover:border-[#3d8b5f]/30 transition-colors">
      {name}
    </div>
  );
}

// === MAIN COMPONENT ===
export function MarketingTerraform() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const features = [
    { icon: RiMapLine, title: "Territory Mapping", description: "Survey your complete social landscape. See all accounts, metrics, and opportunities in one unified view.", elevation: "1200m" },
    { icon: RiCompass4Line, title: "Pathfinding", description: "Navigate to your goals with AI-powered content suggestions and optimal posting schedules.", elevation: "1450m" },
    { icon: RiSearchEyeLine, title: "Terrain Analysis", description: "Deep analytics that reveal the topology of your audience. Understand what moves them.", elevation: "1680m" },
    { icon: RiStackLine, title: "Base Camp", description: "Organize all your content assets in one central location. Tag, search, and deploy instantly.", elevation: "1890m" },
    { icon: RiRouteLine, title: "Route Planning", description: "Map out your content calendar weeks in advance. Coordinate campaigns across all trails.", elevation: "2100m" },
    { icon: RiFlag2Line, title: "Summit Goals", description: "Set ambitious targets and track your expedition progress with milestone markers.", elevation: "2400m" },
  ];

  const testimonials = [
    { quote: "Heimdall helped us map out a content strategy that actually reached our summit goals. The terrain analysis is unmatched.", author: "Alex Thornton", role: "Head of Marketing, Outward Bound", rating: 5 },
    { quote: "Finally a tool that understands the landscape of social media management. Our team's productivity peaked.", author: "Maria Santos", role: "Content Director, Peak Media", rating: 5 },
    { quote: "The route planning feature changed how we approach campaigns. We're reaching audiences we never found before.", author: "James Chen", role: "Founder, Trailhead Digital", rating: 5 },
  ];

  const pricing = [
    { name: "Basecamp", price: "$29", period: "month", description: "For solo explorers starting their journey", features: ["3 social territories", "100 scheduled posts", "Basic terrain analysis", "Email support"], elevation: "1000m" },
    { name: "Expedition", price: "$79", period: "month", description: "For teams conquering new heights", features: ["15 social territories", "Unlimited scheduling", "Advanced analytics", "Team collaboration (5)", "Priority support", "AI pathfinding"], isPopular: true, elevation: "2500m" },
    { name: "Summit", price: "$199", period: "month", description: "For agencies scaling peaks", features: ["Unlimited territories", "White-label options", "Custom integrations", "Dedicated guide", "99.9% uptime SLA", "API access"], elevation: "4000m" },
  ];

  const faqs = [
    { question: "How do I migrate from another platform?", answer: "Our expedition team provides guided migration from all major platforms. We'll help you pack up your content and scheduled posts, ensuring nothing is left behind on the trail." },
    { question: "Can I try before committing to an expedition?", answer: "Every plan includes a 14-day basecamp trial. Explore the terrain, test all features, and decide if the summit is worth the climb." },
    { question: "What happens if I need to change my route mid-journey?", answer: "Plans can be upgraded or downgraded at any checkpoint. Changes apply on your next billing cycle, and we handle the logistics." },
    { question: "Is my content secure on the mountain?", answer: "We use enterprise-grade encryption and are SOC 2 certified. Your data is protected like a well-established base camp." },
    { question: "Do you offer team training for expeditions?", answer: "All plans include access to our Trail Guide Academy. Summit plans include live training sessions with our expert guides." },
  ];

  const integrations = ["X/Twitter", "Instagram", "LinkedIn", "Facebook", "TikTok", "YouTube", "Pinterest", "Threads", "Slack", "Notion", "HubSpot", "Zapier"];

  return (
    <div className="min-h-screen bg-[#1a1d21] text-[#f5f0e6] font-['DM_Sans',sans-serif] relative overflow-hidden">
      <ContourBackground />
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#1a1d21]/90 backdrop-blur-sm border-b border-[#3d8b5f]/10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 relative">
              <RiLandscapeLine className="w-8 h-8 text-[#3d8b5f]" />
            </div>
            <span className="font-bold text-xl tracking-tight">heimdall</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-[#f5f0e6]/60 hover:text-[#3d8b5f] transition-colors">Features</a>
            <a href="#pricing" className="text-sm text-[#f5f0e6]/60 hover:text-[#3d8b5f] transition-colors">Pricing</a>
            <a href="#testimonials" className="text-sm text-[#f5f0e6]/60 hover:text-[#3d8b5f] transition-colors">Stories</a>
            <a href="#faq" className="text-sm text-[#f5f0e6]/60 hover:text-[#3d8b5f] transition-colors">FAQ</a>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="text-[#f5f0e6]/70 hover:text-[#3d8b5f]">Sign In</Button>
            <Button className="bg-[#3d8b5f] hover:bg-[#4a9e6e] text-[#1a1d21]">
              Start Trail
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-6 relative">
        <div className="max-w-4xl mx-auto text-center relative">
          <ElevationMarker elevation="EL. 0m" className="justify-center mb-6" />
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
            Build Your Social<br />
            <span className="text-[#3d8b5f]">Landscape</span>
          </h1>
          
          <p className="text-xl text-[#f5f0e6]/60 max-w-2xl mx-auto mb-10 leading-relaxed">
            Survey, plan, and cultivate your social media presence. Heimdall maps 
            the terrain so you can focus on reaching the summit.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button className="h-14 px-8 text-lg bg-[#3d8b5f] hover:bg-[#4a9e6e] text-[#1a1d21]">
              Begin Expedition
              <RiArrowRightLine className="ml-2 w-5 h-5" />
            </Button>
            <Button variant="ghost" className="h-14 px-8 text-lg text-[#f5f0e6]/70 hover:text-[#3d8b5f]">
              View Trail Map
            </Button>
          </div>
          
          {/* Topographic card preview */}
          <TerrainCard variant="elevated" className="max-w-3xl mx-auto p-8 relative overflow-hidden">
            {/* Mini contours inside card */}
            <div className="absolute inset-0 opacity-10">
              <svg className="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice">
                <title>Decorative contour lines</title>
                {[40, 60, 80, 100, 120].map((r, i) => (
                  <ellipse key={`mini-${i}`} cx="200" cy="100" rx={r} ry={r * 0.5} fill="none" stroke="#3d8b5f" strokeWidth="1" />
                ))}
              </svg>
            </div>
            
            <div className="relative grid grid-cols-4 gap-4">
              <div className="col-span-3">
                <div className="h-8 w-48 bg-[#3d8b5f]/20 rounded mb-4" />
                <div className="grid grid-cols-3 gap-3">
                  <div className="h-24 bg-[#3d8b5f]/10 rounded border border-[#3d8b5f]/20" />
                  <div className="h-24 bg-[#c75d38]/10 rounded border border-[#c75d38]/20" />
                  <div className="h-24 bg-[#3d8b5f]/10 rounded border border-[#3d8b5f]/20" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-12 bg-[#3d8b5f]/10 rounded" />
                <div className="h-12 bg-[#3d8b5f]/10 rounded" />
                <div className="h-12 bg-[#3d8b5f]/10 rounded" />
              </div>
            </div>
          </TerrainCard>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6 border-y border-[#3d8b5f]/10">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatBlock value="25K+" label="Explorers" icon={RiCompass4Line} />
            <StatBlock value="8M+" label="Posts Mapped" icon={RiMapLine} />
            <StatBlock value="99.9%" label="Uptime" icon={RiFlag2Line} />
            <StatBlock value="142" label="Countries" icon={RiPlantLine} />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <SectionHeading
            elevation="EL. 1000m"
            title="Expedition Gear"
            subtitle="Every tool you need to survey and conquer the social landscape."
          />
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section className="py-24 px-6 bg-[#1e2228]/50">
        <div className="max-w-4xl mx-auto">
          <SectionHeading
            elevation="EL. 1800m"
            title="Connected Territories"
            subtitle="Integrate with all the platforms and tools in your expedition pack."
          />
          
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {integrations.map((integration) => (
              <IntegrationItem key={integration} name={integration} />
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <SectionHeading
            elevation="EL. 2500m"
            title="Choose Your Route"
            subtitle="Select the expedition package that matches your ambitions."
          />
          
          <div className="grid md:grid-cols-3 gap-8">
            {pricing.map((plan) => (
              <PricingCard key={plan.name} {...plan} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 px-6 bg-[#1e2228]/50">
        <div className="max-w-6xl mx-auto">
          <SectionHeading
            elevation="EL. 3200m"
            title="Trail Stories"
            subtitle="Hear from explorers who've reached their summits with Heimdall."
          />
          
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <TestimonialCard key={testimonial.author} {...testimonial} />
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 px-6">
        <div className="max-w-2xl mx-auto">
          <SectionHeading
            elevation="EL. 3800m"
            title="Trail Guide"
            subtitle="Common questions from fellow explorers."
          />
          
          <TerrainCard variant="elevated" className="p-8">
            {faqs.map((faq, index) => (
              <FaqItem
                key={faq.question}
                {...faq}
                isOpen={openFaq === index}
                onToggle={() => setOpenFaq(openFaq === index ? null : index)}
              />
            ))}
          </TerrainCard>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#3d8b5f]/20 to-transparent" />
        <ContourBackground />
        
        <div className="max-w-2xl mx-auto text-center relative">
          <ElevationMarker elevation="SUMMIT" className="justify-center mb-6" />
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready for the Ascent?
          </h2>
          <p className="text-xl text-[#f5f0e6]/60 mb-10">
            Join 25,000+ explorers building their social landscapes with Heimdall.
          </p>
          
          <form className="max-w-md mx-auto">
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="sr-only">Name</Label>
                  <Input
                    id="name"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-12 bg-[#1e2228] border-[#3d8b5f]/20 text-[#f5f0e6] placeholder:text-[#f5f0e6]/30 focus:border-[#3d8b5f]/50"
                  />
                </div>
                <div>
                  <Label htmlFor="plan" className="sr-only">Plan</Label>
                  <select
                    id="plan"
                    value={selectedPlan || ""}
                    onChange={(e) => setSelectedPlan(e.target.value)}
                    className="h-12 w-full px-3 bg-[#1e2228] border border-[#3d8b5f]/20 text-[#f5f0e6] rounded-md focus:border-[#3d8b5f]/50 focus:outline-none"
                  >
                    <option value="" disabled>Select plan</option>
                    <option value="basecamp">Basecamp</option>
                    <option value="expedition">Expedition</option>
                    <option value="summit">Summit</option>
                  </select>
                </div>
              </div>
              <div>
                <Label htmlFor="email" className="sr-only">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 bg-[#1e2228] border-[#3d8b5f]/20 text-[#f5f0e6] placeholder:text-[#f5f0e6]/30 focus:border-[#3d8b5f]/50"
                />
              </div>
              <Button className="h-12 bg-[#3d8b5f] hover:bg-[#4a9e6e] text-[#1a1d21] font-semibold">
                Start Your Expedition
                <RiArrowRightLine className="ml-2" />
              </Button>
            </div>
          </form>
          
          <p className="mt-4 text-sm text-[#f5f0e6]/40">
            14-day basecamp trial • No credit card required
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 border-t border-[#3d8b5f]/10">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <RiLandscapeLine className="w-6 h-6 text-[#3d8b5f]" />
                <span className="font-bold text-lg">heimdall</span>
              </div>
              <p className="text-sm text-[#f5f0e6]/50 leading-relaxed">
                Build and cultivate your social landscape with the most comprehensive terrain mapping tool.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-[#f5f0e6] mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-[#f5f0e6]/50">
                <li><a href="/features" className="hover:text-[#3d8b5f] transition-colors">Features</a></li>
                <li><a href="/pricing" className="hover:text-[#3d8b5f] transition-colors">Pricing</a></li>
                <li><a href="/integrations" className="hover:text-[#3d8b5f] transition-colors">Integrations</a></li>
                <li><a href="/api" className="hover:text-[#3d8b5f] transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-[#f5f0e6] mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-[#f5f0e6]/50">
                <li><a href="/about" className="hover:text-[#3d8b5f] transition-colors">About</a></li>
                <li><a href="/blog" className="hover:text-[#3d8b5f] transition-colors">Blog</a></li>
                <li><a href="/careers" className="hover:text-[#3d8b5f] transition-colors">Careers</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-[#f5f0e6] mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-[#f5f0e6]/50">
                <li><a href="/privacy" className="hover:text-[#3d8b5f] transition-colors">Privacy</a></li>
                <li><a href="/terms" className="hover:text-[#3d8b5f] transition-colors">Terms</a></li>
                <li><a href="/security" className="hover:text-[#3d8b5f] transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-[#3d8b5f]/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-[#f5f0e6]/30">© 2026 Heimdall. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <a href="https://x.com" className="text-[#f5f0e6]/30 hover:text-[#3d8b5f] transition-colors">
                <RiTwitterXLine className="w-5 h-5" />
              </a>
              <a href="https://instagram.com" className="text-[#f5f0e6]/30 hover:text-[#3d8b5f] transition-colors">
                <RiInstagramLine className="w-5 h-5" />
              </a>
              <a href="https://linkedin.com" className="text-[#f5f0e6]/30 hover:text-[#3d8b5f] transition-colors">
                <RiLinkedinBoxLine className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default MarketingTerraform;
