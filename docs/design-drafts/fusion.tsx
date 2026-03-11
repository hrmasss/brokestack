/**
 * FUSION - Japanese Minimalism × Nordic Design
 * 
 * Design Philosophy: Ma (間) – The beauty of negative space. Essential simplicity.
 * 
 * Brand Identity:
 * - Pure snow white (#fefefe) as canvas
 * - Soft warm gray (#9a9a9a) for harmony
 * - Deep charcoal (#1a1a1a) for text
 * - Persimmon red (#d4442a) as single accent (used sparingly)
 * - Extreme whitespace, asymmetric balance
 * 
 * Typography: Zen Kaku Gothic New (Japanese-inspired sans) + Inter for balance
 * Signature: Enso circles, single accent color, meditative spacing
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  RiLeafLine,
  RiMoonClearLine,
  RiTimeLine,
  RiBarChartLine,
  RiGroupLine,
  RiShieldLine,
  RiArrowRightLine,
  RiCheckLine,
  RiAddLine,
  RiSubtractLine,
  RiTwitterXLine,
  RiInstagramLine,
  RiLinkedinBoxLine,
} from "@remixicon/react";

// === COMPONENTS ===

// Enso circle (Zen brush stroke)
function Enso({ className = "", size = 120 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Enso circle</title>
      <circle
        cx="50"
        cy="50"
        r="40"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="240 20"
        opacity="0.15"
      />
    </svg>
  );
}

// Minimal dot accent
function Dot({ active = false }: { active?: boolean }) {
  return (
    <div className={`w-1.5 h-1.5 rounded-full ${active ? "bg-[#d4442a]" : "bg-[#1a1a1a]/10"}`} />
  );
}

// Minimal card
function ZenCard({
  children,
  className = "",
  bordered = true,
}: {
  children: React.ReactNode;
  className?: string;
  bordered?: boolean;
}) {
  return (
    <div className={`bg-white ${bordered ? "border border-[#1a1a1a]/5" : ""} ${className}`}>
      {children}
    </div>
  );
}

// Section heading - extremely minimal
function SectionHeading({
  label,
  title,
  align = "center",
}: {
  label?: string;
  title: string;
  align?: "left" | "center";
}) {
  return (
    <div className={`mb-24 ${align === "center" ? "text-center" : "text-left"}`}>
      {label && (
        <div className={`flex items-center gap-3 mb-6 ${align === "center" ? "justify-center" : ""}`}>
          <Dot active />
          <span className="text-xs tracking-[0.25em] uppercase text-[#9a9a9a]">{label}</span>
        </div>
      )}
      <h2 className="text-3xl md:text-4xl font-light text-[#1a1a1a] tracking-tight">
        {title}
      </h2>
    </div>
  );
}

// Feature item - side by side layout
function FeatureRow({
  icon: Icon,
  title,
  description,
  index,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  index: number;
}) {
  const isEven = index % 2 === 0;
  
  return (
    <div className={`grid md:grid-cols-2 gap-12 md:gap-24 items-center py-16 border-b border-[#1a1a1a]/5 last:border-0`}>
      <div className={isEven ? "md:order-1" : "md:order-2"}>
        <div className="flex items-center gap-4 mb-4">
          <Icon className="w-5 h-5 text-[#d4442a]" />
          <h3 className="text-xl font-light text-[#1a1a1a]">{title}</h3>
        </div>
        <p className="text-[#9a9a9a] leading-relaxed">{description}</p>
      </div>
      <div className={`aspect-video bg-[#fafafa] flex items-center justify-center ${isEven ? "md:order-2" : "md:order-1"}`}>
        <Enso size={80} className="text-[#1a1a1a]" />
      </div>
    </div>
  );
}

// Pricing card - minimal
function PricingCard({
  name,
  price,
  description,
  features,
  isHighlighted,
}: {
  name: string;
  price: string;
  description: string;
  features: string[];
  isHighlighted?: boolean;
}) {
  return (
    <ZenCard className={`p-10 ${isHighlighted ? "border-[#d4442a]/20 bg-[#fefcfc]" : ""}`}>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h3 className="text-xl font-light text-[#1a1a1a] mb-1">{name}</h3>
          <p className="text-sm text-[#9a9a9a]">{description}</p>
        </div>
        {isHighlighted && <Dot active />}
      </div>
      
      <div className="mb-10">
        <span className="text-4xl font-light text-[#1a1a1a]">{price}</span>
        <span className="text-[#9a9a9a] ml-1">/mo</span>
      </div>
      
      <ul className="space-y-4 mb-10">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-3">
            <RiCheckLine className={`w-4 h-4 mt-1 shrink-0 ${isHighlighted ? "text-[#d4442a]" : "text-[#1a1a1a]/30"}`} />
            <span className="text-[#1a1a1a]/70">{feature}</span>
          </li>
        ))}
      </ul>
      
      <Button
        className={`w-full h-12 rounded-none font-light ${
          isHighlighted
            ? "bg-[#d4442a] hover:bg-[#b83a24] text-white border-0"
            : "bg-white border border-[#1a1a1a]/10 text-[#1a1a1a] hover:border-[#1a1a1a]/20"
        }`}
      >
        Begin
      </Button>
    </ZenCard>
  );
}

// Testimonial - quiet elegance
function TestimonialBlock({
  quote,
  author,
  role,
}: {
  quote: string;
  author: string;
  role: string;
}) {
  return (
    <div className="py-8">
      <blockquote className="text-2xl md:text-3xl font-light text-[#1a1a1a] leading-relaxed mb-8">
        "{quote}"
      </blockquote>
      <div className="flex items-center gap-3">
        <Dot active />
        <span className="text-[#1a1a1a]">{author}</span>
        <span className="text-[#9a9a9a]">· {role}</span>
      </div>
    </div>
  );
}

// FAQ - minimal accordion
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
    <div className="border-b border-[#1a1a1a]/5">
      <button
        onClick={onToggle}
        className="w-full py-6 flex items-center justify-between text-left group"
      >
        <span className="text-[#1a1a1a] font-light group-hover:text-[#d4442a] transition-colors pr-8">
          {question}
        </span>
        <div className="shrink-0">
          {isOpen ? (
            <RiSubtractLine className="w-4 h-4 text-[#d4442a]" />
          ) : (
            <RiAddLine className="w-4 h-4 text-[#1a1a1a]/30 group-hover:text-[#d4442a] transition-colors" />
          )}
        </div>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-96 pb-6" : "max-h-0"}`}>
        <p className="text-[#9a9a9a] leading-relaxed">{answer}</p>
      </div>
    </div>
  );
}

// Stat - understated
function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl font-light text-[#1a1a1a] mb-1">{value}</div>
      <div className="text-xs tracking-[0.2em] uppercase text-[#9a9a9a]">{label}</div>
    </div>
  );
}

// Integration - simple text list
function IntegrationList({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap justify-center gap-x-8 gap-y-3">
      {items.map((item) => (
        <span key={item} className="text-[#9a9a9a] hover:text-[#1a1a1a] transition-colors cursor-default">
          {item}
        </span>
      ))}
    </div>
  );
}

// === MAIN COMPONENT ===
export function MarketingFusion() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [email, setEmail] = useState("");

  const features = [
    { icon: RiLeafLine, title: "Natural Flow", description: "Content creation should feel effortless. Our interface adapts to your rhythm, supporting your creative process without friction." },
    { icon: RiTimeLine, title: "Perfect Timing", description: "Schedule with precision. Our algorithms find the moments when your audience is most receptive, maximizing every post's potential." },
    { icon: RiBarChartLine, title: "Clear Insights", description: "Analytics stripped to their essence. Understand what matters without drowning in data. Clarity over complexity." },
    { icon: RiGroupLine, title: "Team Harmony", description: "Collaborate in peace. Clean workflows, clear roles, seamless handoffs. Your team moves as one." },
  ];

  const testimonials = [
    { quote: "Heimdall brought calm to our social strategy. The simplicity is deceptive – it's incredibly powerful underneath.", author: "Sarah Lin", role: "Creative Director" },
    { quote: "Finally, a tool that respects negative space. Both in design and in letting us focus on what matters.", author: "Erik Holst", role: "Brand Strategist" },
    { quote: "We reduced our social management time by half. The clarity of purpose is remarkable.", author: "Yuki Tanaka", role: "Marketing Lead" },
  ];

  const pricing = [
    { name: "Essential", price: "$29", description: "For individuals", features: ["3 accounts", "100 posts/month", "Core analytics", "Email support"] },
    { name: "Growth", price: "$79", description: "For teams", features: ["15 accounts", "Unlimited posts", "Advanced analytics", "Team workspace", "Priority support", "AI assistance"], isHighlighted: true },
    { name: "Scale", price: "$199", description: "For organizations", features: ["Unlimited accounts", "Enterprise features", "Dedicated support", "Custom solutions", "SLA guarantee"] },
  ];

  const faqs = [
    { question: "How quickly can I start?", answer: "Connect your accounts in under two minutes. Our onboarding is designed for immediate productivity – you'll be scheduling your first post within five minutes." },
    { question: "Can I import existing content?", answer: "Yes. We support migration from all major platforms. Your history transfers seamlessly, maintaining your established rhythm." },
    { question: "What makes Heimdall different?", answer: "We believe in essentialism. Every feature earns its place. The result is a focused tool that does fewer things, but does them beautifully." },
    { question: "Is there a commitment?", answer: "No long-term contracts. Month-to-month billing. Begin when ready, adjust as needed." },
  ];

  const integrations = ["Twitter/X", "Instagram", "LinkedIn", "Facebook", "TikTok", "YouTube", "Pinterest", "Threads"];

  return (
    <div className="min-h-screen bg-[#fefefe] text-[#1a1a1a] font-['Inter',sans-serif]">
      {/* Navigation - extremely minimal */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#fefefe]/90 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Dot active />
            <span className="font-light text-lg tracking-wide">heimdall</span>
          </div>
          
          <div className="hidden md:flex items-center gap-12">
            <a href="#features" className="text-sm text-[#9a9a9a] hover:text-[#1a1a1a] transition-colors">Features</a>
            <a href="#pricing" className="text-sm text-[#9a9a9a] hover:text-[#1a1a1a] transition-colors">Pricing</a>
            <a href="#faq" className="text-sm text-[#9a9a9a] hover:text-[#1a1a1a] transition-colors">FAQ</a>
          </div>
          
          <div className="flex items-center gap-6">
            <a href="/login" className="text-sm text-[#9a9a9a] hover:text-[#1a1a1a] transition-colors">Sign in</a>
            <Button className="h-10 px-6 bg-[#1a1a1a] hover:bg-[#333] text-white rounded-none text-sm font-light">
              Begin
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero - maximum whitespace */}
      <section className="pt-40 pb-32 px-6">
        <div className="max-w-4xl mx-auto text-center relative">
          <Enso size={160} className="text-[#1a1a1a] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
          
          <h1 className="text-5xl md:text-7xl font-light text-[#1a1a1a] tracking-tight mb-8 leading-[1.15] relative">
            Social media,<br />
            <span className="text-[#d4442a]">simplified.</span>
          </h1>
          
          <p className="text-xl text-[#9a9a9a] font-light max-w-xl mx-auto mb-12 leading-relaxed">
            Schedule, analyze, and grow your presence across every platform. 
            With clarity. With purpose.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button className="h-14 px-10 bg-[#1a1a1a] hover:bg-[#333] text-white rounded-none font-light">
              Start free trial
              <RiArrowRightLine className="ml-3 w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Stats - understated */}
      <section className="py-20 px-6 border-y border-[#1a1a1a]/5">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatItem value="40K" label="Users" />
            <StatItem value="12M" label="Posts" />
            <StatItem value="99.9%" label="Uptime" />
            <StatItem value="4.9" label="Rating" />
          </div>
        </div>
      </section>

      {/* Features - alternating layout */}
      <section id="features" className="py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <SectionHeading
            label="Features"
            title="Everything essential. Nothing more."
          />
          
          {features.map((feature, index) => (
            <FeatureRow key={feature.title} {...feature} index={index} />
          ))}
        </div>
      </section>

      {/* Integrations - simple */}
      <section className="py-20 px-6 bg-[#fafafa]">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-xs tracking-[0.25em] uppercase text-[#9a9a9a] mb-8 block">Connects with</span>
          <IntegrationList items={integrations} />
        </div>
      </section>

      {/* Pricing - clean grid */}
      <section id="pricing" className="py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <SectionHeading
            label="Pricing"
            title="Simple, transparent plans"
          />
          
          <div className="grid md:grid-cols-3 gap-8">
            {pricing.map((plan) => (
              <PricingCard key={plan.name} {...plan} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials - one at a time feel */}
      <section className="py-32 px-6 bg-[#fafafa]">
        <div className="max-w-3xl mx-auto">
          <SectionHeading
            label="Voices"
            title="From our community"
          />
          
          <div className="space-y-12 divide-y divide-[#1a1a1a]/5">
            {testimonials.map((testimonial) => (
              <TestimonialBlock key={testimonial.author} {...testimonial} />
            ))}
          </div>
        </div>
      </section>

      {/* FAQ - minimal */}
      <section id="faq" className="py-32 px-6">
        <div className="max-w-2xl mx-auto">
          <SectionHeading
            label="Questions"
            title="You might wonder"
          />
          
          <div>
            {faqs.map((faq, index) => (
              <FaqItem
                key={faq.question}
                {...faq}
                isOpen={openFaq === index}
                onToggle={() => setOpenFaq(openFaq === index ? null : index)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA - serene */}
      <section className="py-32 px-6 bg-[#1a1a1a]">
        <div className="max-w-xl mx-auto text-center">
          <Enso size={80} className="text-white mx-auto mb-12" />
          
          <h2 className="text-3xl md:text-4xl font-light text-white mb-6">
            Begin your journey
          </h2>
          
          <p className="text-[#9a9a9a] mb-10">
            Start with a 14-day free trial. No obligations.
          </p>
          
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <div className="flex-1">
              <Label htmlFor="email-cta" className="sr-only">Email</Label>
              <Input
                id="email-cta"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-white/30 rounded-none"
              />
            </div>
            <Button className="h-12 px-8 bg-[#d4442a] hover:bg-[#b83a24] text-white rounded-none font-light">
              Begin
            </Button>
          </form>
        </div>
      </section>

      {/* Footer - understated */}
      <footer className="py-16 px-6 border-t border-[#1a1a1a]/5">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Dot active />
                <span className="font-light tracking-wide">heimdall</span>
              </div>
              <p className="text-sm text-[#9a9a9a] max-w-xs">
                Social media management with clarity and purpose.
              </p>
            </div>
            
            <div className="flex gap-16">
              <div>
                <h4 className="text-sm text-[#1a1a1a] mb-4">Product</h4>
                <ul className="space-y-2 text-sm text-[#9a9a9a]">
                  <li><a href="/features" className="hover:text-[#1a1a1a] transition-colors">Features</a></li>
                  <li><a href="/pricing" className="hover:text-[#1a1a1a] transition-colors">Pricing</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-sm text-[#1a1a1a] mb-4">Company</h4>
                <ul className="space-y-2 text-sm text-[#9a9a9a]">
                  <li><a href="/about" className="hover:text-[#1a1a1a] transition-colors">About</a></li>
                  <li><a href="/blog" className="hover:text-[#1a1a1a] transition-colors">Journal</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-sm text-[#1a1a1a] mb-4">Legal</h4>
                <ul className="space-y-2 text-sm text-[#9a9a9a]">
                  <li><a href="/privacy" className="hover:text-[#1a1a1a] transition-colors">Privacy</a></li>
                  <li><a href="/terms" className="hover:text-[#1a1a1a] transition-colors">Terms</a></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="mt-16 pt-8 border-t border-[#1a1a1a]/5 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-[#9a9a9a]">© 2026 Heimdall</p>
            <div className="flex items-center gap-6">
              <a href="https://x.com" className="text-[#9a9a9a] hover:text-[#1a1a1a] transition-colors">
                <RiTwitterXLine className="w-4 h-4" />
              </a>
              <a href="https://instagram.com" className="text-[#9a9a9a] hover:text-[#1a1a1a] transition-colors">
                <RiInstagramLine className="w-4 h-4" />
              </a>
              <a href="https://linkedin.com" className="text-[#9a9a9a] hover:text-[#1a1a1a] transition-colors">
                <RiLinkedinBoxLine className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default MarketingFusion;
