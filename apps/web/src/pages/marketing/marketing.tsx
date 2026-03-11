/**
 * HEIMDALL - Aurora Marketing Page
 * 
 * Production-ready marketing page with light/dark mode support.
 * Based on the Aurora design - Northern lights inspired ethereal aesthetic.
 * 
 * All design tokens are centralized in @/lib/design-tokens
 * Theme switching via @/lib/theme-context
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
  RiSunLine,
  RiMoonLine,
  RiMenuLine,
  RiCloseLine,
} from "@remixicon/react";
import {
  colors,
  effects,
  generateNoiseTexture,
  generateCursorGlow,
} from "@/lib/design-tokens";
import { useTheme, ThemeProvider } from "@/lib/theme-context";

// =============================================================================
// NOISE TEXTURE OVERLAY
// =============================================================================

function NoiseOverlay() {
  const { theme } = useTheme();
  const opacity = theme === "dark" 
    ? effects.grain.opacity.default 
    : effects.grain.opacity.subtle;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-1"
      style={{
        backgroundImage: generateNoiseTexture(),
        opacity,
      }}
    />
  );
}

// =============================================================================
// AURORA GRADIENT ORBS
// =============================================================================

function AuroraOrbs() {
  const { theme } = useTheme();
  const opacities = effects.gradient.orb[theme];

  return (
    <>
      {/* Top-left primary orb */}
      <div
        className="fixed top-0 left-1/4 w-250 h-150 rounded-full -z-10 -translate-y-1/2"
        style={{
          background: `linear-gradient(to bottom, ${colors.primary[500]}, ${colors.secondary[500]}, transparent)`,
          opacity: opacities.primary,
          filter: `blur(${effects.orbBlur.primary})`,
        }}
      />
      {/* Right secondary orb */}
      <div
        className="fixed top-1/3 right-0 w-200 h-125 rounded-full -z-10 translate-x-1/3"
        style={{
          background: `linear-gradient(to bottom left, ${colors.secondary[500]}, ${colors.primary[500]}, transparent)`,
          opacity: opacities.secondary,
          filter: `blur(${effects.orbBlur.secondary})`,
        }}
      />
      {/* Bottom tertiary orb */}
      <div
        className="fixed bottom-0 left-1/3 w-150 h-100 rounded-full -z-10 translate-y-1/2"
        style={{
          background: `linear-gradient(to top, ${colors.primary[500]}, ${colors.accent[500]}, transparent)`,
          opacity: opacities.tertiary,
          filter: `blur(${effects.orbBlur.tertiary})`,
        }}
      />
    </>
  );
}

// =============================================================================
// CURSOR GLOW EFFECT
// =============================================================================

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
      className="fixed w-150 h-150 pointer-events-none z-0 -translate-x-1/2 -translate-y-1/2"
      style={{
        background: generateCursorGlow(),
        opacity: effects.cursorGlow.opacity,
      }}
    />
  );
}

// =============================================================================
// GLASS CARD COMPONENT
// =============================================================================

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: "none" | "sm" | "default" | "lg";
}

function GlassCard({ children, className = "", hover = true, padding = "default" }: GlassCardProps) {
  const { theme } = useTheme();
  const paddingClass = {
    none: "",
    sm: "p-4",
    default: "p-6",
    lg: "p-8",
  }[padding];

  return (
    <div className={`relative group ${className}`}>
      {hover && (
        <div
          className="absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-all duration-700"
          style={{
            background: `linear-gradient(to bottom right, ${colors.primary[500]}4d, ${colors.secondary[500]}33, ${colors.accent[500]}33)`,
          }}
        />
      )}
      <div
        className={`relative backdrop-blur-2xl rounded-2xl shadow-2xl ${paddingClass} ${
          theme === "dark"
            ? "bg-slate-800/40 border border-slate-700/50"
            : "bg-white/70 border border-slate-200/60"
        }`}
        style={{
          boxShadow: theme === "dark" 
            ? `0 25px 50px -12px ${colors.primary[500]}0d`
            : `0 25px 50px -12px ${colors.slate[500]}0d`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

// =============================================================================
// SECTION LABEL
// =============================================================================

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div
        className="h-px w-8"
        style={{
          background: `linear-gradient(to right, ${colors.primary[500]}, ${colors.secondary[500]})`,
          opacity: 0.6,
        }}
      />
      <span
        className="text-xs font-medium tracking-[0.2em] uppercase"
        style={{ color: `${colors.primary[400]}b3` }}
      >
        {children}
      </span>
    </div>
  );
}

// =============================================================================
// AURORA GRADIENT TEXT
// =============================================================================

function AuroraText({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={`bg-clip-text text-transparent ${className}`}
      style={{
        backgroundImage: `linear-gradient(to right, ${colors.primary[400]}, ${colors.secondary[400]}, ${colors.accent[400]})`,
      }}
    >
      {children}
    </span>
  );
}

// =============================================================================
// THEME TOGGLE BUTTON
// =============================================================================

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
        theme === "dark"
          ? "bg-slate-800/60 hover:bg-slate-700/80 text-slate-400 hover:text-white"
          : "bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900"
      }`}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "dark" ? (
        <RiSunLine className="w-4 h-4" />
      ) : (
        <RiMoonLine className="w-4 h-4" />
      )}
    </button>
  );
}

// =============================================================================
// NAVIGATION
// =============================================================================

function Navigation() {
  const { theme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "#features", label: "Features" },
    { href: "#pricing", label: "Pricing" },
    { href: "#testimonials", label: "Customers" },
    { href: "#faq", label: "FAQ" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-2xl border-b ${
        theme === "dark"
          ? "bg-slate-900/60 border-slate-800/50"
          : "bg-white/80 border-slate-200/60"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg"
            style={{
              background: `linear-gradient(to bottom right, ${colors.primary[400]}, ${colors.secondary[500]})`,
              boxShadow: `0 10px 40px -10px ${colors.primary[500]}40`,
            }}
          >
            <span className="text-white font-bold text-sm">H</span>
          </div>
          <span className={`font-semibold text-xl ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
            heimdall
          </span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`text-sm transition-colors ${
                theme === "dark"
                  ? "text-slate-400 hover:text-emerald-400"
                  : "text-slate-600 hover:text-emerald-600"
              }`}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          
          <Button
            variant="ghost"
            className={`hidden sm:flex ${
              theme === "dark"
                ? "text-slate-300 hover:text-emerald-400 hover:bg-transparent"
                : "text-slate-600 hover:text-emerald-600 hover:bg-transparent"
            }`}
          >
            Sign In
          </Button>
          
          <Button
            className="hidden sm:flex text-white border-0 shadow-lg"
            style={{
              background: `linear-gradient(to right, ${colors.primary[500]}, ${colors.secondary[500]})`,
              boxShadow: `0 10px 40px -10px ${colors.primary[500]}40`,
            }}
          >
            Try Free
          </Button>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden w-9 h-9 rounded-lg flex items-center justify-center ${
              theme === "dark"
                ? "bg-slate-800/60 text-slate-400"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {mobileMenuOpen ? <RiCloseLine className="w-5 h-5" /> : <RiMenuLine className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div
          className={`md:hidden border-t ${
            theme === "dark"
              ? "bg-slate-900/95 border-slate-800/50"
              : "bg-white/95 border-slate-200/60"
          }`}
        >
          <div className="px-6 py-4 space-y-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block text-base ${
                  theme === "dark" ? "text-slate-300" : "text-slate-700"
                }`}
              >
                {link.label}
              </a>
            ))}
            <div className="pt-4 flex flex-col gap-2">
              <Button
                variant="outline"
                className={`w-full ${
                  theme === "dark"
                    ? "bg-slate-800/50 border-slate-700"
                    : "bg-slate-100 border-slate-200"
                }`}
              >
                Sign In
              </Button>
              <Button
                className="w-full text-white border-0"
                style={{
                  background: `linear-gradient(to right, ${colors.primary[500]}, ${colors.secondary[500]})`,
                }}
              >
                Try Free
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

// =============================================================================
// HERO SECTION
// =============================================================================

function HeroSection() {
  const { theme } = useTheme();

  return (
    <section className="pt-32 pb-24 px-6 relative">
      <div className="max-w-4xl mx-auto text-center relative">
        <SectionLabel>Social Media Management, Reimagined</SectionLabel>

        <h1
          className={`text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight ${
            theme === "dark" ? "text-white" : "text-slate-900"
          }`}
        >
          Light up your
          <br />
          <AuroraText>social presence</AuroraText>
        </h1>

        <p
          className={`text-xl max-w-2xl mx-auto mb-10 leading-relaxed ${
            theme === "dark" ? "text-slate-400" : "text-slate-600"
          }`}
        >
          Like the northern lights, your content should captivate. Heimdall transforms
          how you create, schedule, and analyze with ethereal precision.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Button
            className="h-14 px-8 text-lg text-white border-0 shadow-xl"
            style={{
              background: `linear-gradient(to right, ${colors.primary[500]}, ${colors.secondary[500]})`,
              boxShadow: `0 20px 50px -12px ${colors.primary[500]}50`,
            }}
          >
            Start Free Trial
            <RiArrowRightLine className="ml-2 w-5 h-5" />
          </Button>
          <Button
            variant="outline"
            className={`h-14 px-8 text-lg backdrop-blur-xl ${
              theme === "dark"
                ? "bg-slate-800/50 border-slate-700/50 text-slate-200 hover:bg-slate-800"
                : "bg-white/60 border-slate-200 text-slate-700 hover:bg-white"
            }`}
          >
            <RiPlayCircleLine className="mr-2 w-5 h-5" />
            Watch Demo
          </Button>
        </div>

        {/* Dashboard Preview */}
        <GlassCard className="max-w-3xl mx-auto" hover={false}>
          <div className="p-6 rounded-xl">
            <div className="flex gap-2 mb-6">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors.primary[400] }} />
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors.secondary[400] }} />
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors.accent[400] }} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div
                className={`col-span-2 h-40 rounded-xl backdrop-blur-sm border ${
                  theme === "dark"
                    ? "border-emerald-500/20"
                    : "border-emerald-200/60"
                }`}
                style={{
                  background: `linear-gradient(to bottom right, ${colors.primary[500]}33, ${colors.secondary[500]}1a)`,
                }}
              />
              <div
                className={`h-40 rounded-xl backdrop-blur-sm border ${
                  theme === "dark"
                    ? "border-teal-500/20"
                    : "border-teal-200/60"
                }`}
                style={{
                  background: `linear-gradient(to bottom right, ${colors.secondary[500]}33, ${colors.accent[500]}1a)`,
                }}
              />
              <div
                className={`h-24 rounded-xl backdrop-blur-sm border ${
                  theme === "dark"
                    ? "border-lime-500/20"
                    : "border-lime-200/60"
                }`}
                style={{
                  background: `linear-gradient(to bottom right, ${colors.accent[500]}33, ${colors.primary[500]}1a)`,
                }}
              />
              <div
                className={`h-24 rounded-xl backdrop-blur-sm border ${
                  theme === "dark"
                    ? "border-emerald-500/20"
                    : "border-emerald-200/60"
                }`}
                style={{
                  background: `linear-gradient(to bottom right, ${colors.primary[500]}33, ${colors.secondary[500]}1a)`,
                }}
              />
              <div
                className={`h-24 rounded-xl backdrop-blur-sm border ${
                  theme === "dark"
                    ? "border-teal-500/20"
                    : "border-teal-200/60"
                }`}
                style={{
                  background: `linear-gradient(to bottom right, ${colors.secondary[500]}33, ${colors.primary[500]}1a)`,
                }}
              />
            </div>
          </div>
        </GlassCard>
      </div>
    </section>
  );
}

// =============================================================================
// STATS SECTION
// =============================================================================

function StatCard({ value, label }: { value: string; label: string }) {
  const { theme } = useTheme();

  return (
    <div className="text-center p-6">
      <div
        className="text-4xl md:text-5xl font-bold mb-2 bg-clip-text text-transparent"
        style={{
          backgroundImage: `linear-gradient(to right, ${colors.primary[400]}, ${colors.secondary[400]})`,
        }}
      >
        {value}
      </div>
      <div className={`text-sm ${theme === "dark" ? "text-slate-500" : "text-slate-500"}`}>
        {label}
      </div>
    </div>
  );
}

function StatsSection() {
  const stats = [
    { value: "50K+", label: "Active Users" },
    { value: "10M+", label: "Posts Scheduled" },
    { value: "99.9%", label: "Uptime SLA" },
    { value: "4.9★", label: "App Store Rating" },
  ];

  return (
    <section className="py-16 px-6">
      <div className="max-w-5xl mx-auto">
        <GlassCard hover={false}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>
        </GlassCard>
      </div>
    </section>
  );
}

// =============================================================================
// FEATURES SECTION
// =============================================================================

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
}

function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  const { theme } = useTheme();

  return (
    <GlassCard>
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 border"
        style={{
          background: `linear-gradient(to bottom right, ${colors.primary[500]}33, ${colors.secondary[500]}33)`,
          borderColor: `${colors.primary[500]}4d`,
        }}
      >
        <Icon className="w-5 h-5" style={{ color: colors.primary[400] }} />
      </div>
      <h3 className={`text-lg font-semibold mb-2 ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
        {title}
      </h3>
      <p className={`leading-relaxed ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}>
        {description}
      </p>
    </GlassCard>
  );
}

function FeaturesSection() {
  const { theme } = useTheme();

  const features = [
    {
      icon: RiSparkling2Line,
      title: "AI Content Generation",
      description: "Let AI craft your posts while maintaining your unique voice. Generate weeks of content in minutes.",
    },
    {
      icon: RiPaletteLine,
      title: "Visual Design Suite",
      description: "Create stunning graphics with our built-in editor. No design skills required.",
    },
    {
      icon: RiTimeLine,
      title: "Smart Scheduling",
      description: "Our algorithm finds your optimal posting times. Maximize reach automatically.",
    },
    {
      icon: RiLineChartLine,
      title: "Deep Analytics",
      description: "Understand what works with detailed insights. Track growth across all platforms.",
    },
    {
      icon: RiGroupLine,
      title: "Team Workspaces",
      description: "Collaborate seamlessly with your team. Approvals, comments, and version history.",
    },
    {
      icon: RiShieldFlashLine,
      title: "Enterprise Security",
      description: "SOC 2 certified with end-to-end encryption. Your data stays yours.",
    },
  ];

  return (
    <section id="features" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <SectionLabel>Powerful Features</SectionLabel>
          <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
            Everything you need to shine
          </h2>
          <p className={`text-xl max-w-2xl mx-auto ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}>
            A complete toolkit for social media excellence, designed with ethereal precision.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}

// =============================================================================
// INTEGRATIONS SECTION
// =============================================================================

function IntegrationsSection() {
  const { theme } = useTheme();

  const integrations = [
    "X/Twitter",
    "Instagram",
    "LinkedIn",
    "Facebook",
    "TikTok",
    "YouTube",
    "Pinterest",
    "Threads",
  ];

  return (
    <section className="py-24 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <SectionLabel>Integrations</SectionLabel>
        <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
          Connect your entire stack
        </h2>
        <p className={`text-lg mb-12 ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}>
          Seamlessly integrate with all major platforms and tools you already use.
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          {integrations.map((name) => (
            <div
              key={name}
              className={`px-5 py-2.5 rounded-full backdrop-blur-xl text-sm font-medium transition-all cursor-default ${
                theme === "dark"
                  ? "bg-slate-800/60 border border-slate-700/50 text-slate-300 hover:bg-slate-800 hover:border-emerald-500/30"
                  : "bg-white/70 border border-slate-200/60 text-slate-700 hover:bg-white hover:border-emerald-400/50"
              }`}
              style={{
                boxShadow: theme === "dark" ? undefined : `0 4px 20px -4px ${colors.primary[500]}1a`,
              }}
            >
              {name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// =============================================================================
// PRICING SECTION
// =============================================================================

interface PricingPlan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  isPopular?: boolean;
}

function PricingCard({ name, price, period, description, features, isPopular }: PricingPlan) {
  const { theme } = useTheme();

  return (
    <div className={`relative ${isPopular ? "scale-105 z-10" : ""}`}>
      {isPopular && (
        <div
          className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-white text-xs font-medium shadow-lg"
          style={{
            background: `linear-gradient(to right, ${colors.primary[500]}, ${colors.secondary[500]})`,
            boxShadow: `0 10px 40px -10px ${colors.primary[500]}50`,
          }}
        >
          Most Popular
        </div>
      )}
      <GlassCard hover={isPopular}>
        <div className="p-2">
          <h3 className={`text-xl font-semibold mb-1 ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
            {name}
          </h3>
          <p className={`text-sm mb-6 ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
            {description}
          </p>

          <div className="mb-6">
            <span className={`text-4xl font-bold ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
              {price}
            </span>
            <span className={theme === "dark" ? "text-slate-500" : "text-slate-400"}>
              /{period}
            </span>
          </div>

          <ul className="space-y-3 mb-8">
            {features.map((feature) => (
              <li key={feature} className="flex items-start gap-3">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{
                    background: `linear-gradient(to right, ${colors.primary[500]}, ${colors.secondary[500]})`,
                  }}
                >
                  <RiCheckLine className="w-3 h-3 text-white" />
                </div>
                <span className={theme === "dark" ? "text-slate-300" : "text-slate-600"}>
                  {feature}
                </span>
              </li>
            ))}
          </ul>

          <Button
            className={`w-full h-12 ${
              isPopular
                ? "text-white border-0 shadow-lg"
                : theme === "dark"
                ? "bg-slate-700/50 hover:bg-slate-700 text-slate-200 border border-slate-600/50"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
            }`}
            style={
              isPopular
                ? {
                    background: `linear-gradient(to right, ${colors.primary[500]}, ${colors.secondary[500]})`,
                    boxShadow: `0 10px 40px -10px ${colors.primary[500]}50`,
                  }
                : undefined
            }
          >
            Get Started
          </Button>
        </div>
      </GlassCard>
    </div>
  );
}

function PricingSection() {
  const { theme } = useTheme();

  const plans: PricingPlan[] = [
    {
      name: "Starter",
      price: "$19",
      period: "month",
      description: "Perfect for solopreneurs",
      features: ["3 social accounts", "50 scheduled posts", "Basic analytics", "Email support"],
    },
    {
      name: "Growth",
      price: "$59",
      period: "month",
      description: "For growing teams",
      features: [
        "15 social accounts",
        "Unlimited posts",
        "Advanced analytics",
        "Team collaboration",
        "Priority support",
        "AI assistance",
      ],
      isPopular: true,
    },
    {
      name: "Scale",
      price: "$149",
      period: "month",
      description: "For agencies & enterprise",
      features: [
        "Unlimited accounts",
        "White-label options",
        "Custom integrations",
        "Dedicated manager",
        "SLA guarantee",
        "API access",
      ],
    },
  ];

  return (
    <section id="pricing" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <SectionLabel>Simple Pricing</SectionLabel>
          <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
            Plans that scale with you
          </h2>
          <p className={`text-xl ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}>
            Start free. Upgrade when you're ready. No hidden fees.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 items-start">
          {plans.map((plan) => (
            <PricingCard key={plan.name} {...plan} />
          ))}
        </div>
      </div>
    </section>
  );
}

// =============================================================================
// TESTIMONIALS SECTION
// =============================================================================

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  avatar: string;
}

function TestimonialCard({ quote, author, role, avatar }: Testimonial) {
  const { theme } = useTheme();

  return (
    <GlassCard>
      <div className="flex gap-1 mb-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <RiStarLine
            key={i}
            className="w-4 h-4"
            style={{ fill: colors.primary[400], color: colors.primary[400] }}
          />
        ))}
      </div>
      <blockquote className={`leading-relaxed mb-6 ${theme === "dark" ? "text-slate-300" : "text-slate-600"}`}>
        "{quote}"
      </blockquote>
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium"
          style={{
            background: `linear-gradient(to bottom right, ${colors.primary[500]}, ${colors.secondary[500]})`,
          }}
        >
          {avatar}
        </div>
        <div>
          <div className={`font-medium ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
            {author}
          </div>
          <div className={`text-sm ${theme === "dark" ? "text-slate-500" : "text-slate-500"}`}>
            {role}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

function TestimonialsSection() {
  const { theme } = useTheme();

  const testimonials: Testimonial[] = [
    {
      quote: "The aurora-inspired interface makes managing social media feel almost meditative. Beautiful and functional.",
      author: "Maya Chen",
      role: "Marketing Director, Lumina",
      avatar: "M",
    },
    {
      quote: "Heimdall helps us manage 50+ accounts without breaking a sweat. It's genuinely magical.",
      author: "Alex Rivera",
      role: "Agency Founder",
      avatar: "A",
    },
    {
      quote: "Went from posting randomly to having a real strategy. My engagement tripled in two months.",
      author: "Jordan Park",
      role: "Content Creator",
      avatar: "J",
    },
  ];

  return (
    <section id="testimonials" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <SectionLabel>Customer Love</SectionLabel>
          <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
            Trusted by thousands
          </h2>
          <p className={`text-xl ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}>
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
  );
}

// =============================================================================
// FAQ SECTION
// =============================================================================

interface FAQ {
  question: string;
  answer: string;
}

function FaqItem({
  question,
  answer,
  isOpen,
  onToggle,
}: FAQ & { isOpen: boolean; onToggle: () => void }) {
  const { theme } = useTheme();

  return (
    <div className={`border-b last:border-0 ${theme === "dark" ? "border-slate-700/50" : "border-slate-200/60"}`}>
      <button
        type="button"
        onClick={onToggle}
        className="w-full py-5 flex items-center justify-between text-left group"
      >
        <span
          className={`font-medium pr-8 transition-colors ${
            theme === "dark"
              ? "text-slate-200 group-hover:text-emerald-400"
              : "text-slate-700 group-hover:text-emerald-600"
          }`}
        >
          {question}
        </span>
        <div
          className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all ${
            isOpen
              ? "text-white"
              : theme === "dark"
              ? "bg-slate-700/50 text-slate-400"
              : "bg-slate-100 text-slate-500"
          }`}
          style={isOpen ? { background: colors.primary[500] } : undefined}
        >
          {isOpen ? <RiSubtractLine className="w-4 h-4" /> : <RiAddLine className="w-4 h-4" />}
        </div>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-96 pb-5" : "max-h-0"}`}>
        <p className={`leading-relaxed ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}>
          {answer}
        </p>
      </div>
    </div>
  );
}

function FaqSection() {
  const { theme } = useTheme();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs: FAQ[] = [
    {
      question: "How does the AI content generation work?",
      answer:
        "Our AI analyzes your brand voice, past content performance, and industry trends to generate content suggestions. You maintain full control and can edit everything before posting.",
    },
    {
      question: "Can I connect accounts from multiple brands?",
      answer:
        "Yes! Growth and Scale plans support organizing accounts into separate brand workspaces, each with their own team members and settings.",
    },
    {
      question: "What happens to my scheduled content if I cancel?",
      answer:
        "Your scheduled posts will remain queued until their scheduled time. You can export all your content and data at any time.",
    },
    {
      question: "Do you offer annual billing discounts?",
      answer:
        "Yes, annual billing saves you 20%. All plans include our standard feature set with additional perks for yearly subscribers.",
    },
    {
      question: "Is there a free trial?",
      answer: "Every plan comes with a 14-day free trial. No credit card required to start.",
    },
  ];

  return (
    <section id="faq" className="py-24 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-16">
          <SectionLabel>FAQ</SectionLabel>
          <h2 className={`text-4xl font-bold mb-4 ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
            Common questions
          </h2>
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
  );
}

// =============================================================================
// CTA SECTION
// =============================================================================

function CtaSection() {
  const { theme } = useTheme();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");

  return (
    <section className="py-24 px-6 relative overflow-hidden">
      {/* Background gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            theme === "dark"
              ? `linear-gradient(to bottom right, ${colors.primary[500]}33, ${colors.secondary[500]}26, ${colors.slate[900]})`
              : `linear-gradient(to bottom right, ${colors.primary[500]}26, ${colors.secondary[500]}1a, ${colors.slate[50]})`,
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            theme === "dark"
              ? `linear-gradient(to top, ${colors.slate[900]}cc, transparent)`
              : `linear-gradient(to top, ${colors.slate[50]}cc, transparent)`,
        }}
      />
      <NoiseOverlay />

      <div className="max-w-3xl mx-auto text-center relative z-10">
        <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
          Ready to light up your brand?
        </h2>
        <p
          className={`text-xl mb-10 max-w-xl mx-auto ${
            theme === "dark" ? "text-slate-300/80" : "text-slate-600"
          }`}
        >
          Join 50,000+ creators and marketers who've transformed their social presence.
        </p>

        <form className="max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="sr-only">
                  Name
                </Label>
                <Input
                  id="name"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`h-12 backdrop-blur-xl ${
                    theme === "dark"
                      ? "bg-slate-800/60 border-slate-700/50 text-white placeholder:text-slate-500"
                      : "bg-white/70 border-slate-200 text-slate-900 placeholder:text-slate-400"
                  }`}
                />
              </div>
              <div>
                <Label htmlFor="company" className="sr-only">
                  Company
                </Label>
                <Input
                  id="company"
                  placeholder="Company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className={`h-12 backdrop-blur-xl ${
                    theme === "dark"
                      ? "bg-slate-800/60 border-slate-700/50 text-white placeholder:text-slate-500"
                      : "bg-white/70 border-slate-200 text-slate-900 placeholder:text-slate-400"
                  }`}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email-cta" className="sr-only">
                Email
              </Label>
              <Input
                id="email-cta"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`h-12 backdrop-blur-xl ${
                  theme === "dark"
                    ? "bg-slate-800/60 border-slate-700/50 text-white placeholder:text-slate-500"
                    : "bg-white/70 border-slate-200 text-slate-900 placeholder:text-slate-400"
                }`}
              />
            </div>
            <Button
              className="h-12 text-white font-semibold shadow-xl"
              style={{
                background: `linear-gradient(to right, ${colors.primary[500]}, ${colors.secondary[500]})`,
                boxShadow: `0 20px 50px -12px ${colors.primary[500]}50`,
              }}
            >
              Start Your Free Trial
              <RiArrowRightLine className="ml-2" />
            </Button>
          </div>
        </form>

        <p className={`mt-4 text-sm ${theme === "dark" ? "text-slate-500" : "text-slate-500"}`}>
          No credit card required • 14-day free trial • Cancel anytime
        </p>
      </div>
    </section>
  );
}

// =============================================================================
// FOOTER
// =============================================================================

function Footer() {
  const { theme } = useTheme();

  const footerLinks = {
    product: [
      { href: "/features", label: "Features" },
      { href: "/pricing", label: "Pricing" },
      { href: "/api", label: "API" },
    ],
    company: [
      { href: "/about", label: "About" },
      { href: "/blog", label: "Blog" },
      { href: "/careers", label: "Careers" },
    ],
    legal: [
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  };

  return (
    <footer
      className={`py-16 px-6 backdrop-blur-xl border-t ${
        theme === "dark"
          ? "bg-slate-900/80 border-slate-800/50"
          : "bg-white/80 border-slate-200/60"
      }`}
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-5 gap-12 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg"
                style={{
                  background: `linear-gradient(to bottom right, ${colors.primary[400]}, ${colors.secondary[500]})`,
                  boxShadow: `0 10px 40px -10px ${colors.primary[500]}40`,
                }}
              >
                <span className="text-white font-bold text-sm">H</span>
              </div>
              <span className={`font-semibold text-xl ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                heimdall
              </span>
            </div>
            <p
              className={`text-sm leading-relaxed max-w-xs ${
                theme === "dark" ? "text-slate-500" : "text-slate-500"
              }`}
            >
              Light up your social presence with the most ethereal management platform for modern teams.
            </p>
          </div>

          <div>
            <h4 className={`font-semibold mb-4 ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
              Product
            </h4>
            <ul className={`space-y-2 text-sm ${theme === "dark" ? "text-slate-500" : "text-slate-500"}`}>
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className={`transition-colors ${
                      theme === "dark" ? "hover:text-emerald-400" : "hover:text-emerald-600"
                    }`}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className={`font-semibold mb-4 ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
              Company
            </h4>
            <ul className={`space-y-2 text-sm ${theme === "dark" ? "text-slate-500" : "text-slate-500"}`}>
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className={`transition-colors ${
                      theme === "dark" ? "hover:text-emerald-400" : "hover:text-emerald-600"
                    }`}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className={`font-semibold mb-4 ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
              Legal
            </h4>
            <ul className={`space-y-2 text-sm ${theme === "dark" ? "text-slate-500" : "text-slate-500"}`}>
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className={`transition-colors ${
                      theme === "dark" ? "hover:text-emerald-400" : "hover:text-emerald-600"
                    }`}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div
          className={`pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4 ${
            theme === "dark" ? "border-slate-800/50" : "border-slate-200/60"
          }`}
        >
          <p className={`text-sm ${theme === "dark" ? "text-slate-600" : "text-slate-400"}`}>
            © 2026 Heimdall. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {[
              { href: "https://x.com", icon: RiTwitterXLine },
              { href: "https://instagram.com", icon: RiInstagramLine },
              { href: "https://linkedin.com", icon: RiLinkedinBoxLine },
            ].map(({ href, icon: Icon }) => (
              <a
                key={href}
                href={href}
                className={`transition-colors ${
                  theme === "dark"
                    ? "text-slate-600 hover:text-emerald-400"
                    : "text-slate-400 hover:text-emerald-600"
                }`}
              >
                <Icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

// =============================================================================
// MAIN MARKETING PAGE COMPONENT
// =============================================================================

function MarketingPageContent() {
  const { theme } = useTheme();

  return (
    <div
      className={`min-h-screen font-['Space_Grotesk',sans-serif] relative overflow-hidden ${
        theme === "dark" ? "text-white" : "text-slate-900"
      }`}
      style={{
        background:
          theme === "dark"
            ? `linear-gradient(to bottom, ${colors.slate[950]}, ${colors.slate[900]}, ${colors.slate[950]})`
            : `linear-gradient(to bottom, #fafafa, #ffffff, #f5f5f5)`,
      }}
    >
      <NoiseOverlay />
      <CursorGlow />
      <AuroraOrbs />

      <Navigation />
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <IntegrationsSection />
      <PricingSection />
      <TestimonialsSection />
      <FaqSection />
      <CtaSection />
      <Footer />
    </div>
  );
}

// Export with ThemeProvider wrapper
export function MarketingPage() {
  return (
    <ThemeProvider>
      <MarketingPageContent />
    </ThemeProvider>
  );
}

export default MarketingPage;
