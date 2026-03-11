/**
 * MERIDIAN - Nautical Navigation Theme
 * 
 * Design Philosophy: Vintage cartography meets modern SaaS. "Chart your social course."
 * 
 * Brand Identity:
 * - Deep navy (#0a1628) as primary dark
 * - Antique gold (#c9a227) as signature accent
 * - Cream parchment (#f4f1e8) for contrast
 * - Compass rose as recurring motif
 * - Longitude/latitude grid as subtle texture
 * 
 * Typography: Crimson Pro (serif headlines) + Source Sans 3 (body)
 * Signature: Navigation metaphors, coordinate markers, "waypoint" terminology
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  RiCompass3Line,
  RiMapPinLine,
  RiTimeLine,
  RiBarChartBoxLine,
  RiTeamLine,
  RiShieldCheckLine,
  RiArrowRightLine,
  RiCheckLine,
  RiStarFill,
  RiAddLine,
  RiSubtractLine,
  RiTwitterXLine,
  RiInstagramLine,
  RiLinkedinBoxLine,
  RiFacebookCircleLine,
  RiAnchorLine,
  RiSailboatLine,
  RiNavigationLine,
} from "@remixicon/react";

// === DESIGN SYSTEM ===
const colors = {
  navy: {
    950: "#0a1628",
    900: "#0f1f35",
    800: "#162a45",
    700: "#1e3a5f",
    600: "#2a4a73",
  },
  gold: {
    500: "#c9a227",
    400: "#d4b445",
    300: "#e0c76a",
    600: "#a88820",
  },
  cream: {
    100: "#f4f1e8",
    200: "#e8e4d8",
    300: "#d4cfc0",
  },
};

// === COMPONENTS ===

// Compass Rose SVG - Signature brand element
function CompassRose({ className = "", size = 200 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Compass Rose</title>
      {/* Outer ring */}
      <circle cx="100" cy="100" r="95" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
      <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
      
      {/* Cardinal points */}
      <path d="M100 5 L105 100 L100 40 L95 100 Z" fill="currentColor" opacity="0.8" />
      <path d="M100 195 L95 100 L100 160 L105 100 Z" fill="currentColor" opacity="0.4" />
      <path d="M5 100 L100 95 L40 100 L100 105 Z" fill="currentColor" opacity="0.4" />
      <path d="M195 100 L100 105 L160 100 L100 95 Z" fill="currentColor" opacity="0.4" />
      
      {/* Intercardinal points */}
      <path d="M30 30 L100 100 L50 50 Z" fill="currentColor" opacity="0.3" />
      <path d="M170 30 L100 100 L150 50 Z" fill="currentColor" opacity="0.3" />
      <path d="M30 170 L100 100 L50 150 Z" fill="currentColor" opacity="0.3" />
      <path d="M170 170 L100 100 L150 150 Z" fill="currentColor" opacity="0.3" />
      
      {/* Center circle */}
      <circle cx="100" cy="100" r="8" fill="currentColor" opacity="0.6" />
      <circle cx="100" cy="100" r="4" fill="currentColor" />
    </svg>
  );
}

// Grid background pattern
function NavigationGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Longitude lines */}
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={`lon-${i}`}
          className="absolute top-0 bottom-0 w-px bg-gold-500/5"
          style={{ left: `${(i + 1) * 8.33}%` }}
        />
      ))}
      {/* Latitude lines */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={`lat-${i}`}
          className="absolute left-0 right-0 h-px bg-gold-500/5"
          style={{ top: `${(i + 1) * 12.5}%` }}
        />
      ))}
      {/* Coordinate markers at intersections */}
      <div className="absolute top-[25%] left-[25%] w-2 h-2 border border-[#c9a227]/20 rotate-45" />
      <div className="absolute top-[25%] right-[25%] w-2 h-2 border border-[#c9a227]/20 rotate-45" />
      <div className="absolute bottom-[25%] left-[25%] w-2 h-2 border border-[#c9a227]/20 rotate-45" />
      <div className="absolute bottom-[25%] right-[25%] w-2 h-2 border border-[#c9a227]/20 rotate-45" />
    </div>
  );
}

// Card with nautical styling
function WaypointCard({
  children,
  className = "",
  variant = "default",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "elevated" | "gold";
}) {
  const variants = {
    default: "bg-[#0f1f35] border border-[#c9a227]/10",
    elevated: "bg-[#162a45] border border-[#c9a227]/20 shadow-lg shadow-black/20",
    gold: "bg-gradient-to-br from-[#c9a227]/10 to-[#a88820]/5 border border-[#c9a227]/30",
  };

  return (
    <div className={`rounded-sm ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
}

// Section heading with coordinate marker
function SectionHeading({
  coordinate,
  title,
  subtitle,
  align = "center",
}: {
  coordinate: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={`mb-16 ${align === "center" ? "text-center" : "text-left"}`}>
      <div className={`flex items-center gap-3 mb-4 ${align === "center" ? "justify-center" : ""}`}>
        <div className="w-8 h-px bg-[#c9a227]/40" />
        <span className="font-mono text-xs tracking-[0.3em] text-[#c9a227]">{coordinate}</span>
        <div className="w-8 h-px bg-[#c9a227]/40" />
      </div>
      <h2 className="font-['Crimson_Pro',serif] text-4xl md:text-5xl font-light text-[#f4f1e8] tracking-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-lg text-[#f4f1e8]/60 font-light max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  );
}

// FAQ Accordion
function AccordionItem({
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
    <div className="border-b border-[#c9a227]/10">
      <button
        onClick={onToggle}
        className="w-full py-6 flex items-center justify-between text-left group"
      >
        <span className="font-['Crimson_Pro',serif] text-xl text-[#f4f1e8] group-hover:text-[#c9a227] transition-colors">
          {question}
        </span>
        {isOpen ? (
          <RiSubtractLine className="w-5 h-5 text-[#c9a227] shrink-0" />
        ) : (
          <RiAddLine className="w-5 h-5 text-[#c9a227]/50 group-hover:text-[#c9a227] transition-colors shrink-0" />
        )}
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-96 pb-6" : "max-h-0"
        }`}
      >
        <p className="text-[#f4f1e8]/60 leading-relaxed">{answer}</p>
      </div>
    </div>
  );
}

// Testimonial card
function TestimonialCard({
  quote,
  author,
  role,
  company,
  rating,
}: {
  quote: string;
  author: string;
  role: string;
  company: string;
  rating: number;
}) {
  return (
    <WaypointCard variant="elevated" className="p-8">
      <div className="flex gap-1 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <RiStarFill
            key={`star-${i}`}
            className={`w-4 h-4 ${i < rating ? "text-[#c9a227]" : "text-[#c9a227]/20"}`}
          />
        ))}
      </div>
      <blockquote className="font-['Crimson_Pro',serif] text-xl text-[#f4f1e8] italic leading-relaxed mb-6">
        "{quote}"
      </blockquote>
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#c9a227]/30 to-[#c9a227]/10 flex items-center justify-center">
          <span className="font-['Crimson_Pro',serif] text-lg text-[#c9a227]">
            {author.charAt(0)}
          </span>
        </div>
        <div>
          <div className="font-medium text-[#f4f1e8]">{author}</div>
          <div className="text-sm text-[#f4f1e8]/50">
            {role} · {company}
          </div>
        </div>
      </div>
    </WaypointCard>
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
  cta,
}: {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  cta: string;
}) {
  return (
    <WaypointCard
      variant={isPopular ? "gold" : "elevated"}
      className={`p-8 relative ${isPopular ? "ring-1 ring-[#c9a227]/50" : ""}`}
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#c9a227] text-[#0a1628] text-xs font-medium tracking-wider uppercase">
          Most Popular
        </div>
      )}
      <div className="mb-6">
        <h3 className="font-['Crimson_Pro',serif] text-2xl text-[#f4f1e8] mb-2">{name}</h3>
        <p className="text-sm text-[#f4f1e8]/50">{description}</p>
      </div>
      <div className="mb-8">
        <span className="font-['Crimson_Pro',serif] text-5xl text-[#f4f1e8]">{price}</span>
        <span className="text-[#f4f1e8]/50 ml-2">/{period}</span>
      </div>
      <ul className="space-y-4 mb-8">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-3">
            <RiCheckLine className="w-5 h-5 text-[#c9a227] mt-0.5 shrink-0" />
            <span className="text-[#f4f1e8]/80">{feature}</span>
          </li>
        ))}
      </ul>
      <Button
        className={`w-full h-12 ${
          isPopular
            ? "bg-[#c9a227] hover:bg-[#d4b445] text-[#0a1628]"
            : "bg-transparent border border-[#c9a227]/30 text-[#c9a227] hover:bg-[#c9a227]/10"
        }`}
      >
        {cta}
      </Button>
    </WaypointCard>
  );
}

// Feature card with icon
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
    <WaypointCard variant="default" className="p-6 group hover:border-[#c9a227]/30 transition-colors">
      <div className="w-12 h-12 mb-4 border border-[#c9a227]/20 flex items-center justify-center group-hover:border-[#c9a227]/40 transition-colors">
        <Icon className="w-6 h-6 text-[#c9a227]" />
      </div>
      <h3 className="font-['Crimson_Pro',serif] text-xl text-[#f4f1e8] mb-2">{title}</h3>
      <p className="text-[#f4f1e8]/60 leading-relaxed">{description}</p>
    </WaypointCard>
  );
}

// Stat display
function StatBlock({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="font-['Crimson_Pro',serif] text-5xl md:text-6xl text-[#c9a227] mb-2">{value}</div>
      <div className="text-sm text-[#f4f1e8]/50 tracking-wider uppercase">{label}</div>
    </div>
  );
}

// Integration logo placeholder
function IntegrationLogo({ name }: { name: string }) {
  return (
    <div className="h-12 px-6 flex items-center justify-center border border-[#c9a227]/10 bg-[#0f1f35]/50 hover:border-[#c9a227]/30 transition-colors">
      <span className="text-[#f4f1e8]/40 font-medium">{name}</span>
    </div>
  );
}

// === MAIN COMPONENT ===
export function MarketingMeridian() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [email, setEmail] = useState("");
  const [formStatus, setFormStatus] = useState<"idle" | "loading" | "success">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus("loading");
    setTimeout(() => {
      setFormStatus("success");
      setEmail("");
    }, 1500);
  };

  const features = [
    {
      icon: RiCompass3Line,
      title: "Navigate All Platforms",
      description: "Chart your course across X, Instagram, LinkedIn, Facebook, TikTok, and more from a single command center.",
    },
    {
      icon: RiTimeLine,
      title: "Precision Scheduling",
      description: "Plot your posts with chronometer accuracy. Schedule months ahead or publish in the moment.",
    },
    {
      icon: RiBarChartBoxLine,
      title: "Voyage Analytics",
      description: "Track your expedition metrics with detailed charts showing engagement, reach, and growth trajectories.",
    },
    {
      icon: RiTeamLine,
      title: "Crew Collaboration",
      description: "Bring your entire team aboard. Assign roles, manage approvals, and coordinate campaigns seamlessly.",
    },
    {
      icon: RiShieldCheckLine,
      title: "Safe Harbor Security",
      description: "Enterprise-grade encryption keeps your accounts and data protected in our secure harbor.",
    },
    {
      icon: RiMapPinLine,
      title: "Content Waypoints",
      description: "Organize your content library with intelligent tagging. Find any asset instantly when you need it.",
    },
  ];

  const testimonials = [
    {
      quote: "Heimdall has transformed how we navigate the social media seas. What took hours now takes minutes.",
      author: "Sarah Chen",
      role: "Marketing Director",
      company: "Northwind Co.",
      rating: 5,
    },
    {
      quote: "The analytics alone have helped us chart a course to 3x engagement. Essential for any serious brand.",
      author: "Marcus Williams",
      role: "Head of Social",
      company: "Coastal Media",
      rating: 5,
    },
    {
      quote: "Finally, a tool that lets our team work in harmony. Collaboration has never been smoother.",
      author: "Elena Rodriguez",
      role: "Content Lead",
      company: "Maritime Digital",
      rating: 5,
    },
  ];

  const pricing = [
    {
      name: "Dinghy",
      price: "$29",
      period: "month",
      description: "For solo navigators and small crews",
      features: [
        "3 social accounts",
        "100 scheduled posts/month",
        "Basic analytics",
        "24-hour support",
      ],
      cta: "Start Sailing",
    },
    {
      name: "Schooner",
      price: "$79",
      period: "month",
      description: "For growing fleets and agencies",
      features: [
        "15 social accounts",
        "Unlimited scheduling",
        "Advanced analytics",
        "Team collaboration (5 seats)",
        "Priority support",
        "Custom reporting",
      ],
      isPopular: true,
      cta: "Set Course",
    },
    {
      name: "Galleon",
      price: "$199",
      period: "month",
      description: "For enterprise armadas",
      features: [
        "Unlimited social accounts",
        "Unlimited everything",
        "White-label options",
        "Dedicated success manager",
        "Custom integrations",
        "SLA guarantee",
      ],
      cta: "Contact Sales",
    },
  ];

  const faqs = [
    {
      question: "How quickly can I get started with Heimdall?",
      answer: "You can set sail within minutes. Connect your social accounts, and you'll have your first post scheduled before your coffee gets cold. Our onboarding process is designed for speed without sacrificing understanding.",
    },
    {
      question: "Can I bring my existing content and scheduled posts?",
      answer: "Absolutely. We offer seamless migration from most major platforms including Buffer, Hootsuite, and Sprout Social. Your content voyage continues uninterrupted.",
    },
    {
      question: "What happens if I need to change plans mid-voyage?",
      answer: "Upgrade or downgrade anytime. Changes take effect on your next billing cycle, and we'll prorate accordingly. No penalties, no hassle.",
    },
    {
      question: "Is my data secure in your harbor?",
      answer: "We take security seriously. SOC 2 Type II certified, end-to-end encryption, and we never sell your data. Your content stays yours, always.",
    },
    {
      question: "Do you offer training for my crew?",
      answer: "Yes! All plans include access to our Navigation Academy with video tutorials and guides. Schooner and Galleon plans include live onboarding sessions.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a1628] text-[#f4f1e8] font-['Source_Sans_3',sans-serif]">
      <NavigationGrid />
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a1628]/90 backdrop-blur-sm border-b border-[#c9a227]/10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CompassRose size={32} className="text-[#c9a227]" />
            <span className="font-['Crimson_Pro',serif] text-xl tracking-wide">HEIMDALL</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-[#f4f1e8]/70 hover:text-[#c9a227] transition-colors">Features</a>
            <a href="#pricing" className="text-sm text-[#f4f1e8]/70 hover:text-[#c9a227] transition-colors">Pricing</a>
            <a href="#testimonials" className="text-sm text-[#f4f1e8]/70 hover:text-[#c9a227] transition-colors">Testimonials</a>
            <a href="#faq" className="text-sm text-[#f4f1e8]/70 hover:text-[#c9a227] transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="text-[#f4f1e8]/70 hover:text-[#c9a227]">
              Sign In
            </Button>
            <Button className="bg-[#c9a227] hover:bg-[#d4b445] text-[#0a1628]">
              Start Free
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        <CompassRose className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#c9a227]/5 pointer-events-none" size={800} />
        
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-px bg-[#c9a227]/40" />
            <span className="font-mono text-xs tracking-[0.3em] text-[#c9a227]">45°N · 122°W</span>
            <div className="w-12 h-px bg-[#c9a227]/40" />
          </div>
          
          <h1 className="font-['Crimson_Pro',serif] text-5xl md:text-7xl lg:text-8xl font-light tracking-tight mb-6">
            Chart Your<br />
            <span className="text-[#c9a227]">Social Course</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-[#f4f1e8]/60 font-light max-w-2xl mx-auto mb-12 leading-relaxed">
            Navigate the vast waters of social media with precision. 
            Heimdall is your command center for scheduling, analytics, and growth.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button className="h-14 px-8 text-lg bg-[#c9a227] hover:bg-[#d4b445] text-[#0a1628]">
              Begin Your Voyage
              <RiArrowRightLine className="ml-2 w-5 h-5" />
            </Button>
            <Button variant="ghost" className="h-14 px-8 text-lg text-[#f4f1e8]/70 hover:text-[#c9a227]">
              View Demo
            </Button>
          </div>
          
          {/* Social proof */}
          <div className="flex items-center justify-center gap-8 text-sm text-[#f4f1e8]/40">
            <div className="flex items-center gap-2">
              <RiAnchorLine className="w-4 h-4 text-[#c9a227]/50" />
              <span>10,000+ Navigators</span>
            </div>
            <div className="flex items-center gap-2">
              <RiSailboatLine className="w-4 h-4 text-[#c9a227]/50" />
              <span>2M+ Posts Scheduled</span>
            </div>
            <div className="flex items-center gap-2">
              <RiNavigationLine className="w-4 h-4 text-[#c9a227]/50" />
              <span>50+ Countries</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 px-6 border-y border-[#c9a227]/10">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            <StatBlock value="10K+" label="Active Navigators" />
            <StatBlock value="2.5M" label="Posts Scheduled" />
            <StatBlock value="99.9%" label="Uptime Guaranteed" />
            <StatBlock value="4.9" label="Average Rating" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <SectionHeading
            coordinate="WAYPOINT 01"
            title="Your Navigation Instruments"
            subtitle="Everything you need to conquer the social seas, precisely calibrated for maximum impact."
          />
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6 bg-[#0f1f35]/50">
        <div className="max-w-6xl mx-auto">
          <SectionHeading
            coordinate="WAYPOINT 02"
            title="Choose Your Vessel"
            subtitle="Select the plan that matches your expedition scale. All vessels come fully equipped."
          />
          
          <div className="grid md:grid-cols-3 gap-8">
            {pricing.map((plan) => (
              <PricingCard key={plan.name} {...plan} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <SectionHeading
            coordinate="WAYPOINT 03"
            title="From Fellow Navigators"
            subtitle="Hear from those who've charted their course with Heimdall."
          />
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <TestimonialCard key={testimonial.author} {...testimonial} />
            ))}
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section className="py-24 px-6 border-y border-[#c9a227]/10">
        <div className="max-w-6xl mx-auto">
          <SectionHeading
            coordinate="WAYPOINT 04"
            title="Charted Territories"
            subtitle="Connect with all major platforms and tools. Your fleet, unified."
          />
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {["X/Twitter", "Instagram", "LinkedIn", "Facebook", "TikTok", "YouTube", "Pinterest", "Threads", "Slack", "Zapier", "HubSpot", "Salesforce"].map((platform) => (
              <IntegrationLogo key={platform} name={platform} />
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <SectionHeading
            coordinate="WAYPOINT 05"
            title="Navigation Guide"
            subtitle="Common questions from fellow navigators."
          />
          
          <div className="divide-y divide-[#c9a227]/10">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={faq.question}
                question={faq.question}
                answer={faq.answer}
                isOpen={openFaq === index}
                onToggle={() => setOpenFaq(openFaq === index ? null : index)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA / Newsletter Section */}
      <section className="py-24 px-6 bg-gradient-to-b from-[#0f1f35] to-[#0a1628] relative overflow-hidden">
        <CompassRose className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#c9a227]/5 pointer-events-none" size={600} />
        
        <div className="max-w-2xl mx-auto text-center relative">
          <SectionHeading
            coordinate="EMBARKATION POINT"
            title="Ready to Set Sail?"
            subtitle="Join thousands of navigators who've transformed their social media strategy."
          />
          
          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex flex-col gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="sr-only">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-14 bg-[#0f1f35] border-[#c9a227]/20 text-[#f4f1e8] placeholder:text-[#f4f1e8]/30 focus:border-[#c9a227]/50 focus:ring-[#c9a227]/20"
                />
              </div>
              <Button
                type="submit"
                disabled={formStatus === "loading"}
                className="h-14 bg-[#c9a227] hover:bg-[#d4b445] text-[#0a1628] font-medium"
              >
                {formStatus === "loading" ? (
                  "Preparing your vessel..."
                ) : formStatus === "success" ? (
                  <span className="flex items-center gap-2">
                    <RiCheckLine className="w-5 h-5" />
                    Welcome aboard!
                  </span>
                ) : (
                  "Request Early Access"
                )}
              </Button>
            </div>
            <p className="mt-4 text-sm text-[#f4f1e8]/40">
              No credit card required. Start with 14 days free.
            </p>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 border-t border-[#c9a227]/10">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <CompassRose size={28} className="text-[#c9a227]" />
                <span className="font-['Crimson_Pro',serif] text-lg tracking-wide">HEIMDALL</span>
              </div>
              <p className="text-sm text-[#f4f1e8]/50 leading-relaxed">
                Your command center for navigating the social media seas.
              </p>
            </div>
            
            {/* Product */}
            <div>
              <h4 className="font-medium text-[#f4f1e8] mb-4">Product</h4>
              <ul className="space-y-3 text-sm text-[#f4f1e8]/50">
                <li><a href="/features" className="hover:text-[#c9a227] transition-colors">Features</a></li>
                <li><a href="/pricing" className="hover:text-[#c9a227] transition-colors">Pricing</a></li>
                <li><a href="/integrations" className="hover:text-[#c9a227] transition-colors">Integrations</a></li>
                <li><a href="/changelog" className="hover:text-[#c9a227] transition-colors">Changelog</a></li>
              </ul>
            </div>
            
            {/* Company */}
            <div>
              <h4 className="font-medium text-[#f4f1e8] mb-4">Company</h4>
              <ul className="space-y-3 text-sm text-[#f4f1e8]/50">
                <li><a href="/about" className="hover:text-[#c9a227] transition-colors">About</a></li>
                <li><a href="/blog" className="hover:text-[#c9a227] transition-colors">Blog</a></li>
                <li><a href="/careers" className="hover:text-[#c9a227] transition-colors">Careers</a></li>
                <li><a href="/contact" className="hover:text-[#c9a227] transition-colors">Contact</a></li>
              </ul>
            </div>
            
            {/* Legal */}
            <div>
              <h4 className="font-medium text-[#f4f1e8] mb-4">Legal</h4>
              <ul className="space-y-3 text-sm text-[#f4f1e8]/50">
                <li><a href="/privacy" className="hover:text-[#c9a227] transition-colors">Privacy Policy</a></li>
                <li><a href="/terms" className="hover:text-[#c9a227] transition-colors">Terms of Service</a></li>
                <li><a href="/security" className="hover:text-[#c9a227] transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          
          {/* Bottom */}
          <div className="pt-8 border-t border-[#c9a227]/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-[#f4f1e8]/30">
              © 2026 Heimdall. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <a href="https://x.com" className="text-[#f4f1e8]/30 hover:text-[#c9a227] transition-colors">
                <RiTwitterXLine className="w-5 h-5" />
              </a>
              <a href="https://instagram.com" className="text-[#f4f1e8]/30 hover:text-[#c9a227] transition-colors">
                <RiInstagramLine className="w-5 h-5" />
              </a>
              <a href="https://linkedin.com" className="text-[#f4f1e8]/30 hover:text-[#c9a227] transition-colors">
                <RiLinkedinBoxLine className="w-5 h-5" />
              </a>
              <a href="https://facebook.com" className="text-[#f4f1e8]/30 hover:text-[#c9a227] transition-colors">
                <RiFacebookCircleLine className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default MarketingMeridian;
