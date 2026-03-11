/**
 * VOLTAGE - Electric Energy Theme
 * 
 * Design Philosophy: Harness the current. Clean energy meets powerful performance.
 * 
 * Brand Identity:
 * - Pure white (#ffffff) as primary canvas
 * - Deep charcoal (#0a0a0a) for contrast
 * - Electric blue (#0066ff) as signature accent
 * - Subtle yellow (#ffd500) for sparks/highlights
 * - Energy flow lines and pulse animations
 * 
 * Typography: Inter (clean, modern)
 * Signature: Circuit patterns, energy pulses, power terminology
 */

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  RiFlashlightLine,
  RiBattery2ChargeLine,
  RiPulseLine,
  RiRadarLine,
  RiCpuLine,
  RiShieldCheckLine,
  RiArrowRightLine,
  RiCheckLine,
  RiStarFill,
  RiAddLine,
  RiSubtractLine,
  RiTwitterXLine,
  RiInstagramLine,
  RiLinkedinBoxLine,
  RiThunderstormsLine,
  RiSparklingLine,
} from "@remixicon/react";

// === COMPONENTS ===

// Energy pulse line
function EnergyPulse() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Horizontal energy lines */}
      <div className="absolute top-1/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#0066ff]/20 to-transparent animate-pulse" />
      <div className="absolute top-2/3 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#0066ff]/10 to-transparent animate-pulse delay-500" />
      
      {/* Vertical pulses */}
      <div className="absolute left-1/4 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#0066ff]/10 to-transparent" />
      <div className="absolute right-1/3 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#0066ff]/10 to-transparent" />
    </div>
  );
}

// Animated circuit node
function CircuitNode({ x, y, size = 4, delay = 0 }: { x: string; y: string; size?: number; delay?: number }) {
  return (
    <div
      className="absolute w-1 h-1 rounded-full bg-[#0066ff] animate-ping"
      style={{
        left: x,
        top: y,
        width: size,
        height: size,
        animationDelay: `${delay}ms`,
        animationDuration: "2s",
      }}
    />
  );
}

// Power indicator
function PowerBadge({ label }: { label: string }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#0066ff]/5 border border-[#0066ff]/20 rounded-full">
      <div className="w-2 h-2 rounded-full bg-[#0066ff] animate-pulse" />
      <span className="text-xs font-medium text-[#0066ff] tracking-wide">{label}</span>
    </div>
  );
}

// Electric card
function VoltageCard({
  children,
  className = "",
  variant = "default",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "charged" | "highlight";
}) {
  const variants = {
    default: "bg-white border border-zinc-200 hover:border-[#0066ff]/30 hover:shadow-lg hover:shadow-[#0066ff]/5",
    charged: "bg-zinc-900 border border-zinc-800 text-white",
    highlight: "bg-gradient-to-br from-[#0066ff] to-[#0044cc] border-0 text-white shadow-xl shadow-[#0066ff]/25",
  };

  return (
    <div className={`rounded-xl transition-all duration-300 ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
}

// Section heading
function SectionHeading({
  badge,
  title,
  subtitle,
  dark = false,
}: {
  badge: string;
  title: string;
  subtitle?: string;
  dark?: boolean;
}) {
  return (
    <div className="text-center mb-16">
      <PowerBadge label={badge} />
      <h2 className={`text-4xl md:text-5xl font-bold tracking-tight mt-6 mb-4 ${dark ? "text-white" : "text-zinc-900"}`}>
        {title}
      </h2>
      {subtitle && (
        <p className={`text-lg max-w-2xl mx-auto ${dark ? "text-zinc-400" : "text-zinc-500"}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

// Feature card
function FeatureCard({
  icon: Icon,
  title,
  description,
  metric,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  metric?: string;
}) {
  return (
    <VoltageCard variant="default" className="p-6 group">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-[#0066ff]/5 flex items-center justify-center group-hover:bg-[#0066ff]/10 transition-colors">
          <Icon className="w-6 h-6 text-[#0066ff]" />
        </div>
        {metric && (
          <span className="text-xs font-mono text-[#0066ff]/60 bg-[#0066ff]/5 px-2 py-1 rounded">
            {metric}
          </span>
        )}
      </div>
      <h3 className="text-lg font-semibold text-zinc-900 mb-2">{title}</h3>
      <p className="text-zinc-500 leading-relaxed">{description}</p>
    </VoltageCard>
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
  power,
}: {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  power: string;
}) {
  return (
    <VoltageCard
      variant={isPopular ? "highlight" : "default"}
      className={`p-8 relative ${!isPopular ? "bg-white" : ""}`}
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#ffd500] text-zinc-900 text-xs font-bold tracking-wider uppercase rounded-full flex items-center gap-1">
          <RiThunderstormsLine className="w-3 h-3" />
          Most Power
        </div>
      )}
      
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-xl font-bold ${isPopular ? "text-white" : "text-zinc-900"}`}>{name}</h3>
        <span className={`text-xs font-mono ${isPopular ? "text-white/60" : "text-[#0066ff]"}`}>{power}</span>
      </div>
      <p className={`text-sm mb-6 ${isPopular ? "text-white/70" : "text-zinc-500"}`}>{description}</p>
      
      <div className="mb-8">
        <span className={`text-5xl font-bold ${isPopular ? "text-white" : "text-zinc-900"}`}>{price}</span>
        <span className={`ml-2 ${isPopular ? "text-white/60" : "text-zinc-400"}`}>/{period}</span>
      </div>
      
      <ul className="space-y-3 mb-8">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-3">
            <RiCheckLine className={`w-5 h-5 mt-0.5 shrink-0 ${isPopular ? "text-[#ffd500]" : "text-[#0066ff]"}`} />
            <span className={isPopular ? "text-white/90" : "text-zinc-600"}>{feature}</span>
          </li>
        ))}
      </ul>
      
      <Button
        className={`w-full h-12 font-semibold ${
          isPopular
            ? "bg-white hover:bg-zinc-100 text-[#0066ff]"
            : "bg-[#0066ff] hover:bg-[#0055dd] text-white"
        }`}
      >
        Activate
        <RiFlashlightLine className="ml-2 w-4 h-4" />
      </Button>
    </VoltageCard>
  );
}

// Testimonial card
function TestimonialCard({
  quote,
  author,
  role,
  company,
  avatar,
}: {
  quote: string;
  author: string;
  role: string;
  company: string;
  avatar: string;
}) {
  return (
    <VoltageCard variant="charged" className="p-6">
      <div className="flex gap-1 mb-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <RiStarFill key={i} className="w-4 h-4 text-[#ffd500]" />
        ))}
      </div>
      <blockquote className="text-white/90 leading-relaxed mb-6">
        "{quote}"
      </blockquote>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#0066ff] flex items-center justify-center text-white font-bold">
          {avatar}
        </div>
        <div>
          <div className="font-medium text-white">{author}</div>
          <div className="text-sm text-white/50">{role} · {company}</div>
        </div>
      </div>
    </VoltageCard>
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
    <div className="border-b border-zinc-100 last:border-0">
      <button
        onClick={onToggle}
        className="w-full py-5 flex items-center justify-between text-left group"
      >
        <span className="font-medium text-zinc-900 group-hover:text-[#0066ff] transition-colors pr-8">
          {question}
        </span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all ${
          isOpen ? "bg-[#0066ff] text-white rotate-0" : "bg-zinc-100 text-zinc-400 group-hover:bg-[#0066ff]/10 group-hover:text-[#0066ff]"
        }`}>
          {isOpen ? <RiSubtractLine className="w-4 h-4" /> : <RiAddLine className="w-4 h-4" />}
        </div>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-96 pb-5" : "max-h-0"}`}>
        <p className="text-zinc-500 leading-relaxed">{answer}</p>
      </div>
    </div>
  );
}

// Stat display
function StatDisplay({ value, label, suffix = "" }: { value: string; label: string; suffix?: string }) {
  return (
    <div className="text-center p-6">
      <div className="flex items-baseline justify-center">
        <span className="text-4xl md:text-5xl font-bold text-[#0066ff]">{value}</span>
        {suffix && <span className="text-2xl font-bold text-[#0066ff]">{suffix}</span>}
      </div>
      <div className="text-sm text-zinc-500 mt-2 uppercase tracking-wider">{label}</div>
    </div>
  );
}

// Integration chip
function IntegrationChip({ name, active = false }: { name: string; active?: boolean }) {
  return (
    <div className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
      active
        ? "bg-[#0066ff] text-white shadow-lg shadow-[#0066ff]/25"
        : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
    }`}>
      {name}
    </div>
  );
}

// Live power meter
function PowerMeter() {
  const [power, setPower] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPower((prev) => {
        const next = prev + Math.random() * 10 - 3;
        return Math.max(0, Math.min(100, next));
      });
    }, 100);

    // Initialize with a starting value
    setPower(75);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-4">
      <div className="flex-1 h-2 bg-zinc-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#0066ff] to-[#00ccff] transition-all duration-100 rounded-full"
          style={{ width: `${power}%` }}
        />
      </div>
      <span className="font-mono text-sm text-[#0066ff] w-12">{power.toFixed(0)}%</span>
    </div>
  );
}

// === MAIN COMPONENT ===
export function MarketingVoltage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [email, setEmail] = useState("");

  const features = [
    { icon: RiFlashlightLine, title: "Instant Power", description: "Schedule months of content in seconds. Our engine processes posts 10x faster than competitors.", metric: "10x FASTER" },
    { icon: RiBattery2ChargeLine, title: "Always Charged", description: "99.99% uptime guaranteed. Your content flows even when other platforms stumble.", metric: "99.99% UP" },
    { icon: RiPulseLine, title: "Live Analytics", description: "Real-time performance monitoring. Watch your engagement surge as it happens.", metric: "REAL-TIME" },
    { icon: RiRadarLine, title: "Smart Targeting", description: "AI-powered audience detection. Reach the right people at the right moment.", metric: "AI POWERED" },
    { icon: RiCpuLine, title: "Auto Optimization", description: "Machine learning adjusts your posting schedule for maximum voltage.", metric: "ML TUNED" },
    { icon: RiShieldCheckLine, title: "Surge Protection", description: "Enterprise-grade security keeps your accounts safe from threats.", metric: "SOC 2" },
  ];

  const testimonials = [
    { quote: "Heimdall supercharged our social strategy. Our engagement metrics practically doubled overnight.", author: "Sarah Kim", role: "Marketing Lead", company: "Ampere Tech", avatar: "S" },
    { quote: "The real-time analytics are incredible. We can see exactly when our content peaks.", author: "Marcus Chen", role: "Growth Manager", company: "CurrentFlow", avatar: "M" },
    { quote: "Finally, a tool with the power to handle our enterprise scale. Heimdall delivers.", author: "Elena Volkov", role: "CMO", company: "Dynamo Corp", avatar: "E" },
  ];

  const pricing = [
    { name: "Spark", price: "$29", period: "mo", description: "For individuals and side projects", features: ["3 power channels", "100 scheduled posts", "Basic analytics", "Email support"], power: "100W" },
    { name: "Surge", price: "$79", period: "mo", description: "For growing teams and brands", features: ["15 power channels", "Unlimited posts", "Real-time analytics", "Team access (5 seats)", "Priority support", "AI optimization"], isPopular: true, power: "500W" },
    { name: "Grid", price: "$199", period: "mo", description: "For agencies and enterprise", features: ["Unlimited channels", "White-label options", "Custom integrations", "Dedicated engineer", "99.99% SLA", "API access"], power: "∞W" },
  ];

  const faqs = [
    { question: "How fast can I get started?", answer: "Connect your accounts and you'll be powered up in under 2 minutes. Our quick-start wizard handles all the setup so you can start scheduling immediately." },
    { question: "What platforms do you support?", answer: "We support all major social platforms including X, Instagram, LinkedIn, Facebook, TikTok, YouTube, Pinterest, Threads, and more. New integrations added monthly." },
    { question: "Can I migrate from another tool?", answer: "Yes! Our migration assistant transfers your scheduled content, analytics history, and settings from Buffer, Hootsuite, Sprout Social, and others in one click." },
    { question: "Is there a free trial?", answer: "Every plan includes a 14-day free trial with full features. No credit card required to start. Experience full power before committing." },
    { question: "What's your uptime guarantee?", answer: "Surge and Grid plans include a 99.99% uptime SLA. If we don't meet it, you get credits back. We've maintained 100% uptime for the past 18 months." },
  ];

  const integrations = [
    { name: "X/Twitter", active: true },
    { name: "Instagram", active: true },
    { name: "LinkedIn", active: true },
    { name: "Facebook", active: false },
    { name: "TikTok", active: true },
    { name: "YouTube", active: false },
    { name: "Threads", active: false },
    { name: "Pinterest", active: false },
  ];

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-['Inter',sans-serif] relative overflow-hidden">
      <EnergyPulse />
      
      {/* Circuit nodes */}
      <CircuitNode x="10%" y="20%" delay={0} />
      <CircuitNode x="85%" y="15%" delay={500} />
      <CircuitNode x="5%" y="60%" delay={1000} />
      <CircuitNode x="90%" y="70%" delay={1500} />
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-zinc-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#0066ff] flex items-center justify-center">
              <RiFlashlightLine className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl">heimdall</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-zinc-500 hover:text-[#0066ff] transition-colors">Features</a>
            <a href="#pricing" className="text-sm text-zinc-500 hover:text-[#0066ff] transition-colors">Pricing</a>
            <a href="#testimonials" className="text-sm text-zinc-500 hover:text-[#0066ff] transition-colors">Customers</a>
            <a href="#faq" className="text-sm text-zinc-500 hover:text-[#0066ff] transition-colors">FAQ</a>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="text-zinc-600 hover:text-[#0066ff]">Sign In</Button>
            <Button className="bg-[#0066ff] hover:bg-[#0055dd] text-white">
              Power Up
              <RiFlashlightLine className="ml-1 w-4 h-4" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-6 relative">
        <div className="max-w-4xl mx-auto text-center relative">
          <PowerBadge label="NOW WITH AI" />
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mt-8 mb-6 leading-[1.1]">
            Supercharge Your<br />
            <span className="text-[#0066ff]">Social Presence</span>
          </h1>
          
          <p className="text-xl text-zinc-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Harness the full power of social media. Heimdall delivers lightning-fast 
            scheduling, real-time analytics, and AI-powered optimization.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button className="h-14 px-8 text-lg bg-[#0066ff] hover:bg-[#0055dd] text-white shadow-lg shadow-[#0066ff]/25">
              Start Free Trial
              <RiArrowRightLine className="ml-2 w-5 h-5" />
            </Button>
            <Button variant="outline" className="h-14 px-8 text-lg border-zinc-200 text-zinc-600">
              Watch Demo
            </Button>
          </div>
          
          {/* Power meter demo */}
          <VoltageCard variant="default" className="max-w-md mx-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="font-medium text-zinc-900">Live Power Output</span>
              <RiSparklingLine className="w-5 h-5 text-[#0066ff]" />
            </div>
            <PowerMeter />
          </VoltageCard>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6 bg-zinc-50">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatDisplay value="50" suffix="K+" label="Powered Users" />
            <StatDisplay value="1" suffix="B+" label="Posts Delivered" />
            <StatDisplay value="99.99" suffix="%" label="Uptime" />
            <StatDisplay value="10" suffix="x" label="Faster" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <SectionHeading
            badge="CAPABILITIES"
            title="Full Power Features"
            subtitle="Everything you need to electrify your social media strategy."
          />
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section className="py-24 px-6 bg-zinc-900 relative">
        <EnergyPulse />
        
        <div className="max-w-4xl mx-auto text-center relative">
          <SectionHeading
            badge="INTEGRATIONS"
            title="Connect Your Grid"
            subtitle="Seamlessly integrate with all major platforms. One dashboard, total control."
            dark
          />
          
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {integrations.map((int) => (
              <IntegrationChip key={int.name} {...int} />
            ))}
          </div>
          
          <p className="text-zinc-400 text-sm">
            + 50 more integrations including Slack, Notion, HubSpot, Zapier, and custom webhooks
          </p>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <SectionHeading
            badge="PRICING"
            title="Choose Your Power Level"
            subtitle="Scale up or down anytime. All plans include core features."
          />
          
          <div className="grid md:grid-cols-3 gap-8">
            {pricing.map((plan) => (
              <PricingCard key={plan.name} {...plan} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 px-6 bg-zinc-50">
        <div className="max-w-6xl mx-auto">
          <SectionHeading
            badge="TESTIMONIALS"
            title="Powered by Our Users"
            subtitle="See why thousands of teams have made the switch."
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
            badge="FAQ"
            title="Quick Answers"
          />
          
          <VoltageCard variant="default" className="p-8">
            {faqs.map((faq, index) => (
              <FaqItem
                key={faq.question}
                {...faq}
                isOpen={openFaq === index}
                onToggle={() => setOpenFaq(openFaq === index ? null : index)}
              />
            ))}
          </VoltageCard>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-[#0066ff] relative overflow-hidden">
        {/* Electric pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="electric-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="1" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#electric-grid)" />
          </svg>
        </div>
        
        <div className="max-w-2xl mx-auto text-center relative">
          <RiThunderstormsLine className="w-16 h-16 text-white/20 mx-auto mb-6" />
          
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Power Up?
          </h2>
          <p className="text-xl text-white/80 mb-10">
            Join 50,000+ users who've supercharged their social presence.
          </p>
          
          <form className="max-w-md mx-auto flex gap-3">
            <div className="flex-1">
              <Label htmlFor="email-cta" className="sr-only">Email</Label>
              <Input
                id="email-cta"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-14 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/50"
              />
            </div>
            <Button className="h-14 px-8 bg-white hover:bg-zinc-100 text-[#0066ff] font-semibold">
              Get Started
            </Button>
          </form>
          
          <p className="mt-4 text-sm text-white/60">
            Free 14-day trial • No credit card required
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 bg-zinc-900">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-5 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#0066ff] flex items-center justify-center">
                  <RiFlashlightLine className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl text-white">heimdall</span>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed max-w-xs">
                Supercharge your social media presence with the most powerful management platform.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li><a href="/features" className="hover:text-[#0066ff] transition-colors">Features</a></li>
                <li><a href="/pricing" className="hover:text-[#0066ff] transition-colors">Pricing</a></li>
                <li><a href="/api" className="hover:text-[#0066ff] transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li><a href="/about" className="hover:text-[#0066ff] transition-colors">About</a></li>
                <li><a href="/blog" className="hover:text-[#0066ff] transition-colors">Blog</a></li>
                <li><a href="/careers" className="hover:text-[#0066ff] transition-colors">Careers</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li><a href="/privacy" className="hover:text-[#0066ff] transition-colors">Privacy</a></li>
                <li><a href="/terms" className="hover:text-[#0066ff] transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-zinc-500">© 2026 Heimdall. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <a href="https://x.com" className="text-zinc-500 hover:text-[#0066ff] transition-colors">
                <RiTwitterXLine className="w-5 h-5" />
              </a>
              <a href="https://instagram.com" className="text-zinc-500 hover:text-[#0066ff] transition-colors">
                <RiInstagramLine className="w-5 h-5" />
              </a>
              <a href="https://linkedin.com" className="text-zinc-500 hover:text-[#0066ff] transition-colors">
                <RiLinkedinBoxLine className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default MarketingVoltage;
