/**
 * PRISM MIST - Frosted Glass Theme
 * 
 * Design Philosophy: Crystal clarity meets soft elegance. 
 * Teal/Cyan/Mint palette with glass morphism and noise texture.
 * 
 * Brand Identity:
 * - Off-white (#fafafa) as canvas
 * - Soft teal (#14b8a6) as primary
 * - Cyan (#06b6d4) as secondary
 * - Mint (#10b981) as accent
 * - Subtle gradients, glass morphism, noise grain
 */

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  RiSparkling2Line,
  RiPaletteLine,
  RiTimeLine,
  RiLineChartLine,
  RiGroupLine,
  RiShieldFlashLine,
  RiArrowRightLine,
  RiCheckLine,
  RiPlayCircleLine,
  RiStarLine,
  RiAddLine,
  RiSubtractLine,
  RiTwitterXLine,
  RiInstagramLine,
  RiLinkedinBoxLine,
} from "@remixicon/react";

// Noise texture overlay
function NoiseOverlay() {
  return (
    <div 
      className="fixed inset-0 pointer-events-none z-[1] opacity-[0.03]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      }}
    />
  );
}

// Glass card with frosted effect
function GlassCard({
  children,
  className = "",
  hover = true,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div className={`relative group ${className}`}>
      {hover && (
        <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-br from-teal-400/20 via-cyan-400/20 to-emerald-400/20 opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500" />
      )}
      <div className="relative bg-white/60 backdrop-blur-xl rounded-2xl border border-white/40 shadow-lg shadow-teal-500/5 p-6">
        {children}
      </div>
    </div>
  );
}

// Section heading with subtle gradient
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="h-px w-8 bg-gradient-to-r from-teal-400 to-cyan-400 opacity-60" />
      <span className="text-xs font-medium tracking-[0.2em] uppercase text-teal-600/70">{children}</span>
    </div>
  );
}

// Subtle gradient text
function GradientText({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`bg-gradient-to-r from-teal-500 via-cyan-500 to-emerald-500 bg-clip-text text-transparent ${className}`}>
      {children}
    </span>
  );
}

// Interactive cursor glow - soft teal
function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (glowRef.current) {
        glowRef.current.style.left = `${e.clientX}px`;
        glowRef.current.style.top = `${e.clientY}px`;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div
      ref={glowRef}
      className="fixed w-[500px] h-[500px] pointer-events-none z-0 -translate-x-1/2 -translate-y-1/2 opacity-20"
      style={{
        background: "radial-gradient(circle, rgba(20,184,166,0.15) 0%, rgba(6,182,212,0.08) 40%, transparent 70%)",
      }}
    />
  );
}

// Feature card
function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <GlassCard>
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400/20 to-cyan-400/20 border border-teal-500/20 flex items-center justify-center mb-4">
        <Icon className="w-5 h-5 text-teal-600" />
      </div>
      <h3 className="text-lg font-semibold text-zinc-800 mb-2">{title}</h3>
      <p className="text-zinc-500 leading-relaxed">{description}</p>
    </GlassCard>
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
}: {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  isPopular?: boolean;
}) {
  return (
    <div className={`relative ${isPopular ? "scale-105 z-10" : ""}`}>
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-xs font-medium shadow-lg shadow-teal-500/25">
          Most Popular
        </div>
      )}
      <GlassCard hover={isPopular}>
        <div className="p-2">
          <h3 className="text-xl font-semibold text-zinc-800 mb-1">{name}</h3>
          <p className="text-sm text-zinc-500 mb-6">{description}</p>
          
          <div className="mb-6">
            <span className="text-4xl font-bold text-zinc-800">{price}</span>
            <span className="text-zinc-400 ml-1">/{period}</span>
          </div>
          
          <ul className="space-y-3 mb-8">
            {features.map((feature) => (
              <li key={feature} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-gradient-to-r from-teal-400 to-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                  <RiCheckLine className="w-3 h-3 text-white" />
                </div>
                <span className="text-zinc-600">{feature}</span>
              </li>
            ))}
          </ul>
          
          <Button
            className={`w-full h-12 ${
              isPopular
                ? "bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white border-0 shadow-lg shadow-teal-500/25"
                : "bg-white/80 hover:bg-white text-zinc-700 border border-zinc-200/50"
            }`}
          >
            Get Started
          </Button>
        </div>
      </GlassCard>
    </div>
  );
}

// Testimonial card
function TestimonialCard({
  quote,
  author,
  role,
  avatar,
}: {
  quote: string;
  author: string;
  role: string;
  avatar: string;
}) {
  return (
    <GlassCard>
      <div className="flex gap-1 mb-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <RiStarLine key={i} className="w-4 h-4 fill-teal-400 text-teal-400" />
        ))}
      </div>
      <blockquote className="text-zinc-600 leading-relaxed mb-6">
        "{quote}"
      </blockquote>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-cyan-400 flex items-center justify-center text-white font-medium">
          {avatar}
        </div>
        <div>
          <div className="font-medium text-zinc-800">{author}</div>
          <div className="text-sm text-zinc-400">{role}</div>
        </div>
      </div>
    </GlassCard>
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
    <div className="border-b border-zinc-100/50 last:border-0">
      <button
        onClick={onToggle}
        className="w-full py-5 flex items-center justify-between text-left group"
      >
        <span className="font-medium text-zinc-700 group-hover:text-teal-600 transition-colors pr-8">
          {question}
        </span>
        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all ${isOpen ? "bg-teal-500 text-white" : "bg-zinc-100/80 text-zinc-400"}`}>
          {isOpen ? <RiSubtractLine className="w-4 h-4" /> : <RiAddLine className="w-4 h-4" />}
        </div>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-96 pb-5" : "max-h-0"}`}>
        <p className="text-zinc-500 leading-relaxed">{answer}</p>
      </div>
    </div>
  );
}

// Stat card
function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center p-6">
      <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent mb-2">
        {value}
      </div>
      <div className="text-sm text-zinc-500">{label}</div>
    </div>
  );
}

// === MAIN COMPONENT ===
export function MarketingPrismMist() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");

  const features = [
    { icon: RiSparkling2Line, title: "AI Content Generation", description: "Let AI craft your posts while maintaining your unique voice. Generate weeks of content in minutes." },
    { icon: RiPaletteLine, title: "Visual Design Suite", description: "Create stunning graphics with our built-in editor. No design skills required." },
    { icon: RiTimeLine, title: "Smart Scheduling", description: "Our algorithm finds your optimal posting times. Maximize reach automatically." },
    { icon: RiLineChartLine, title: "Deep Analytics", description: "Understand what works with detailed insights. Track growth across all platforms." },
    { icon: RiGroupLine, title: "Team Workspaces", description: "Collaborate seamlessly with your team. Approvals, comments, and version history." },
    { icon: RiShieldFlashLine, title: "Enterprise Security", description: "SOC 2 certified with end-to-end encryption. Your data stays yours." },
  ];

  const testimonials = [
    { quote: "The clean analytics dashboard is a breath of fresh air. I've never seen data presented so elegantly.", author: "Maya Chen", role: "Marketing Director, Lumina", avatar: "M" },
    { quote: "Heimdall helps us manage 50+ accounts without breaking a sweat. It's genuinely magical.", author: "Alex Rivera", role: "Agency Founder", avatar: "A" },
    { quote: "Went from posting randomly to having a real strategy. My engagement tripled in two months.", author: "Jordan Park", role: "Content Creator", avatar: "J" },
  ];

  const pricing = [
    { name: "Starter", price: "$19", period: "month", description: "Perfect for solopreneurs", features: ["3 social accounts", "50 scheduled posts", "Basic analytics", "Email support"] },
    { name: "Growth", price: "$59", period: "month", description: "For growing teams", features: ["15 social accounts", "Unlimited posts", "Advanced analytics", "Team collaboration", "Priority support", "AI assistance"], isPopular: true },
    { name: "Scale", price: "$149", period: "month", description: "For agencies & enterprise", features: ["Unlimited accounts", "White-label options", "Custom integrations", "Dedicated manager", "SLA guarantee", "API access"] },
  ];

  const faqs = [
    { question: "How does the AI content generation work?", answer: "Our AI analyzes your brand voice, past content performance, and industry trends to generate content suggestions. You maintain full control and can edit everything before posting." },
    { question: "Can I connect accounts from multiple brands?", answer: "Yes! Growth and Scale plans support organizing accounts into separate brand workspaces, each with their own team members and settings." },
    { question: "What happens to my scheduled content if I cancel?", answer: "Your scheduled posts will remain queued until their scheduled time. You can export all your content and data at any time." },
    { question: "Do you offer annual billing discounts?", answer: "Yes, annual billing saves you 20%. All plans include our standard feature set with additional perks for yearly subscribers." },
    { question: "Is there a free trial?", answer: "Every plan comes with a 14-day free trial. No credit card required to start." },
  ];

  const integrations = ["X/Twitter", "Instagram", "LinkedIn", "Facebook", "TikTok", "YouTube", "Pinterest", "Threads"];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8fafa] via-white to-[#f0fdf9] text-zinc-900 font-['Space_Grotesk',sans-serif] relative overflow-hidden">
      <NoiseOverlay />
      <CursorGlow />
      
      {/* Blurry gradient orbs - soft and subtle */}
      <div className="fixed top-0 right-0 w-[900px] h-[900px] bg-gradient-to-br from-teal-100/40 via-cyan-100/30 to-emerald-100/20 rounded-full blur-[120px] -z-10 translate-x-1/3 -translate-y-1/3" />
      <div className="fixed bottom-0 left-0 w-[700px] h-[700px] bg-gradient-to-tr from-emerald-100/30 via-teal-100/20 to-cyan-100/10 rounded-full blur-[100px] -z-10 -translate-x-1/3 translate-y-1/3" />
      <div className="fixed top-1/2 left-1/2 w-[500px] h-[500px] bg-gradient-to-r from-cyan-100/20 to-teal-100/20 rounded-full blur-[80px] -z-10 -translate-x-1/2 -translate-y-1/2" />
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-2xl border-b border-white/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-teal-500/20">
              <span className="text-white font-bold text-sm">H</span>
            </div>
            <span className="font-semibold text-xl text-zinc-800">heimdall</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-zinc-500 hover:text-teal-600 transition-colors">Features</a>
            <a href="#pricing" className="text-sm text-zinc-500 hover:text-teal-600 transition-colors">Pricing</a>
            <a href="#testimonials" className="text-sm text-zinc-500 hover:text-teal-600 transition-colors">Customers</a>
            <a href="#faq" className="text-sm text-zinc-500 hover:text-teal-600 transition-colors">FAQ</a>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="text-zinc-600 hover:text-teal-600">Sign In</Button>
            <Button className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white border-0 shadow-lg shadow-teal-500/20">
              Try Free
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-6 relative">
        <div className="max-w-4xl mx-auto text-center relative">
          <SectionLabel>Social Media Management, Reimagined</SectionLabel>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.1] text-zinc-800">
            Clarity meets<br />
            <GradientText>social excellence</GradientText>
          </h1>
          
          <p className="text-xl text-zinc-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Where elegance meets efficiency. Heimdall transforms how you create, 
            schedule, and analyze social content with crystal-clear precision.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button className="h-14 px-8 text-lg bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white border-0 shadow-xl shadow-teal-500/25">
              Start Free Trial
              <RiArrowRightLine className="ml-2 w-5 h-5" />
            </Button>
            <Button variant="outline" className="h-14 px-8 text-lg bg-white/60 backdrop-blur-xl border-white/50 hover:bg-white/80 text-zinc-600">
              <RiPlayCircleLine className="mr-2 w-5 h-5" />
              Watch Demo
            </Button>
          </div>
          
          {/* Mock dashboard preview - glass morphism */}
          <GlassCard className="max-w-3xl mx-auto" hover={false}>
            <div className="p-6 rounded-xl">
              <div className="flex gap-2 mb-6">
                <div className="w-3 h-3 rounded-full bg-teal-400" />
                <div className="w-3 h-3 rounded-full bg-cyan-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 h-40 rounded-xl bg-gradient-to-br from-teal-100/60 to-cyan-100/60 backdrop-blur-sm border border-white/50" />
                <div className="h-40 rounded-xl bg-gradient-to-br from-cyan-100/60 to-emerald-100/60 backdrop-blur-sm border border-white/50" />
                <div className="h-24 rounded-xl bg-gradient-to-br from-emerald-100/60 to-teal-100/60 backdrop-blur-sm border border-white/50" />
                <div className="h-24 rounded-xl bg-gradient-to-br from-teal-100/60 to-cyan-100/60 backdrop-blur-sm border border-white/50" />
                <div className="h-24 rounded-xl bg-gradient-to-br from-cyan-100/60 to-teal-100/60 backdrop-blur-sm border border-white/50" />
              </div>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <GlassCard hover={false}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard value="50K+" label="Active Users" />
              <StatCard value="10M+" label="Posts Scheduled" />
              <StatCard value="99.9%" label="Uptime SLA" />
              <StatCard value="4.9★" label="App Store Rating" />
            </div>
          </GlassCard>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <SectionLabel>Powerful Features</SectionLabel>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-zinc-800">Everything you need to shine</h2>
            <p className="text-xl text-zinc-500 max-w-2xl mx-auto">
              A complete toolkit for social media excellence, designed with clarity and power in mind.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <SectionLabel>Integrations</SectionLabel>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-zinc-800">Connect your entire stack</h2>
          <p className="text-lg text-zinc-500 mb-12">
            Seamlessly integrate with all major platforms and tools you already use.
          </p>
          
          <div className="flex flex-wrap justify-center gap-3">
            {integrations.map((name) => (
              <div key={name} className="px-5 py-2.5 rounded-full bg-white/60 backdrop-blur-xl border border-white/50 text-zinc-600 text-sm font-medium hover:bg-white/80 hover:border-teal-200 hover:shadow-lg hover:shadow-teal-500/10 transition-all">
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <SectionLabel>Simple Pricing</SectionLabel>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-zinc-800">Plans that scale with you</h2>
            <p className="text-xl text-zinc-500">
              Start free. Upgrade when you're ready. No hidden fees.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 items-start">
            {pricing.map((plan) => (
              <PricingCard key={plan.name} {...plan} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <SectionLabel>Customer Love</SectionLabel>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-zinc-800">Trusted by thousands</h2>
            <p className="text-xl text-zinc-500">
              See why creators and teams choose Heimdall.
            </p>
          </div>
          
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
          <div className="text-center mb-16">
            <SectionLabel>FAQ</SectionLabel>
            <h2 className="text-4xl font-bold mb-4 text-zinc-800">Common questions</h2>
          </div>
          
          <GlassCard hover={false}>
            {faqs.map((faq, index) => (
              <FaqItem
                key={faq.question}
                {...faq}
                isOpen={openFaq === index}
                onToggle={() => setOpenFaq(openFaq === index ? null : index)}
              />
            ))}
          </GlassCard>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/90 via-cyan-500/90 to-emerald-500/90" />
        <NoiseOverlay />
        
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to bring clarity to your brand?
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-xl mx-auto">
            Join 50,000+ creators and marketers who've transformed their social presence.
          </p>
          
          <form className="max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="sr-only">Name</Label>
                  <Input
                    id="name"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-12 bg-white/15 backdrop-blur-xl border-white/30 text-white placeholder:text-white/60 focus:border-white/50"
                  />
                </div>
                <div>
                  <Label htmlFor="company" className="sr-only">Company</Label>
                  <Input
                    id="company"
                    placeholder="Company"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="h-12 bg-white/15 backdrop-blur-xl border-white/30 text-white placeholder:text-white/60 focus:border-white/50"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email-cta" className="sr-only">Email</Label>
                <Input
                  id="email-cta"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 bg-white/15 backdrop-blur-xl border-white/30 text-white placeholder:text-white/60 focus:border-white/50"
                />
              </div>
              <Button className="h-12 bg-white hover:bg-zinc-100 text-teal-600 font-semibold shadow-xl">
                Start Your Free Trial
                <RiArrowRightLine className="ml-2" />
              </Button>
            </div>
          </form>
          
          <p className="mt-4 text-sm text-white/60">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 bg-white/50 backdrop-blur-xl border-t border-white/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-5 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-teal-500/20">
                  <span className="text-white font-bold text-sm">H</span>
                </div>
                <span className="font-semibold text-xl text-zinc-800">heimdall</span>
              </div>
              <p className="text-sm text-zinc-500 leading-relaxed max-w-xs">
                Bring clarity to your social presence with the most elegant management platform for modern teams.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-zinc-800 mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-zinc-500">
                <li><a href="/features" className="hover:text-teal-600 transition-colors">Features</a></li>
                <li><a href="/pricing" className="hover:text-teal-600 transition-colors">Pricing</a></li>
                <li><a href="/api" className="hover:text-teal-600 transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-zinc-800 mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-zinc-500">
                <li><a href="/about" className="hover:text-teal-600 transition-colors">About</a></li>
                <li><a href="/blog" className="hover:text-teal-600 transition-colors">Blog</a></li>
                <li><a href="/careers" className="hover:text-teal-600 transition-colors">Careers</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-zinc-800 mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-zinc-500">
                <li><a href="/privacy" className="hover:text-teal-600 transition-colors">Privacy</a></li>
                <li><a href="/terms" className="hover:text-teal-600 transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-zinc-200/50 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-zinc-400">© 2026 Heimdall. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <a href="https://x.com" className="text-zinc-400 hover:text-teal-600 transition-colors">
                <RiTwitterXLine className="w-5 h-5" />
              </a>
              <a href="https://instagram.com" className="text-zinc-400 hover:text-teal-600 transition-colors">
                <RiInstagramLine className="w-5 h-5" />
              </a>
              <a href="https://linkedin.com" className="text-zinc-400 hover:text-teal-600 transition-colors">
                <RiLinkedinBoxLine className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default MarketingPrismMist;
