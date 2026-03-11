/**
 * EDITORIAL REFINED - Marketing Page Design 6
 * 
 * Aesthetic: Magazine, sophisticated, elegant, typographic
 * Colors: Off-white, charcoal, muted blue accent
 * Typography: Cormorant Garamond (editorial serif) + Inter
 * Key features: Strong typography hierarchy, elegant spacing, grid layouts, refined details
 */

import { Link } from "react-router";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Calendar,
  Circle,
  Globe2,
  Layers,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Editorial card with clean styling
function EditorialCard({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className?: string 
}) {
  return (
    <div
      className={cn(
        "bg-[#fafaf8] rounded-sm border border-[#e5e5e3]",
        className
      )}
    >
      {children}
    </div>
  );
}

// Feature row component
function FeatureRow({ 
  number,
  title, 
  description,
  icon: Icon
}: { 
  number: string;
  title: string; 
  description: string;
  icon: React.ElementType;
}) {
  return (
    <div className="group grid grid-cols-12 gap-6 py-8 border-b border-[#e5e5e3] hover:bg-[#fafaf8] transition-colors -mx-6 px-6 cursor-default">
      <div className="col-span-1 flex items-center">
        <span className="font-sans text-xs text-[#999] tabular-nums">{number}</span>
      </div>
      <div className="col-span-1 flex items-center">
        <Icon className="w-5 h-5 text-[#3b5998]" />
      </div>
      <div className="col-span-3 flex items-center">
        <h3 className="font-serif text-lg text-[#1a1a1a] group-hover:text-[#3b5998] transition-colors">{title}</h3>
      </div>
      <div className="col-span-6 flex items-center">
        <p className="font-sans text-sm text-[#666] leading-relaxed">{description}</p>
      </div>
      <div className="col-span-1 flex items-center justify-end">
        <ArrowUpRight className="w-4 h-4 text-[#ccc] group-hover:text-[#3b5998] transition-colors" />
      </div>
    </div>
  );
}

// Testimonial component
function Testimonial({ 
  quote, 
  author, 
  role, 
  publication 
}: { 
  quote: string; 
  author: string; 
  role: string;
  publication: string;
}) {
  return (
    <div className="py-8">
      <p className="font-serif text-2xl md:text-3xl text-[#1a1a1a] leading-snug mb-8 italic">
        "{quote}"
      </p>
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-[#e5e5e3]" />
        <div>
          <p className="font-sans text-sm font-medium text-[#1a1a1a]">{author}</p>
          <p className="font-sans text-xs text-[#999]">{role}, {publication}</p>
        </div>
      </div>
    </div>
  );
}

export function MarketingEditorial() {
  const features = [
    {
      icon: Calendar,
      title: "Content Calendar",
      description: "Plan and schedule your content with an elegant, intuitive calendar interface designed for clarity.",
    },
    {
      icon: Sparkles,
      title: "AI Writing Assistant",
      description: "Craft compelling narratives with an intelligent assistant that understands your brand voice.",
    },
    {
      icon: BarChart3,
      title: "Performance Insights",
      description: "Beautiful analytics dashboards that make data accessible and actionable at a glance.",
    },
    {
      icon: Users,
      title: "Team Workspace",
      description: "Collaborate seamlessly with shared workflows, approvals, and real-time editing capabilities.",
    },
    {
      icon: Zap,
      title: "Smart Automation",
      description: "Intelligent rules that learn your preferences and optimize your posting schedule automatically.",
    },
    {
      icon: Layers,
      title: "Asset Library",
      description: "Organize your media assets with smart tagging and instant search for quick content creation.",
    },
  ];

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long' });

  return (
    <div className="min-h-screen bg-[#f5f5f3] text-[#1a1a1a]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Inter:wght@400;500;600&display=swap');
        
        .font-serif { font-family: 'Cormorant Garamond', serif; }
        .font-sans { font-family: 'Inter', sans-serif; }
      `}</style>

      {/* Top bar */}
      <div className="border-b border-[#e5e5e3] bg-[#fafaf8]">
        <div className="mx-auto max-w-7xl px-8">
          <div className="h-10 flex items-center justify-between text-xs">
            <span className="font-sans text-[#999]">{currentMonth} {currentYear} Edition</span>
            <span className="font-sans text-[#999]">The future of social media management</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#fafaf8]/95 backdrop-blur-sm border-b border-[#e5e5e3]">
        <div className="mx-auto max-w-7xl px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-serif text-3xl font-semibold tracking-tight text-[#1a1a1a]">Heimdall</span>
            </div>
            
            <div className="hidden md:flex items-center gap-10">
              <a href="#features" className="font-sans text-sm text-[#666] hover:text-[#1a1a1a] transition-colors">Features</a>
              <a href="#about" className="font-sans text-sm text-[#666] hover:text-[#1a1a1a] transition-colors">About</a>
              <a href="#testimonials" className="font-sans text-sm text-[#666] hover:text-[#1a1a1a] transition-colors">Testimonials</a>
              <a href="#pricing" className="font-sans text-sm text-[#666] hover:text-[#1a1a1a] transition-colors">Pricing</a>
            </div>
            
            <div className="flex items-center gap-6">
              <a href="#" className="font-sans text-sm text-[#666] hover:text-[#1a1a1a] transition-colors">Sign in</a>
              <Link to="/dashboard">
                <Button className="font-sans text-sm bg-[#1a1a1a] hover:bg-[#333] text-white border-0 rounded-sm h-9 px-5">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-8">
          <div className="grid lg:grid-cols-12 gap-16">
            {/* Main headline */}
            <div className="lg:col-span-8">
              <p className="font-sans text-sm text-[#3b5998] uppercase tracking-widest mb-6">Issue No. 01</p>
              <h1 className="font-serif text-6xl md:text-7xl lg:text-8xl font-medium leading-[1.05] tracking-tight mb-8">
                The new standard for
                <br />
                <em className="text-[#3b5998]">social media</em>
                <br />
                management
              </h1>
            </div>
            
            {/* Side content */}
            <div className="lg:col-span-4 flex flex-col justify-end">
              <p className="font-sans text-sm text-[#666] leading-relaxed mb-8">
                Heimdall brings clarity to the chaos of social media. A thoughtfully designed 
                platform that helps brands communicate with consistency, measure with precision, 
                and grow with intention.
              </p>
              <div className="flex gap-4">
                <Link to="/dashboard">
                  <Button className="font-sans text-sm bg-[#1a1a1a] hover:bg-[#333] text-white border-0 rounded-sm h-12 px-6">
                    Start Free Trial
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Button variant="outline" className="font-sans text-sm border-[#1a1a1a] text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white rounded-sm h-12 px-6">
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platforms Strip */}
      <section className="border-y border-[#e5e5e3] py-6 bg-[#fafaf8]">
        <div className="mx-auto max-w-7xl px-8">
          <div className="flex items-center justify-between">
            <span className="font-sans text-xs text-[#999] uppercase tracking-widest">Platforms</span>
            <div className="flex items-center gap-8">
              {["X", "Instagram", "LinkedIn", "Facebook", "TikTok", "YouTube"].map((platform) => (
                <div key={platform} className="flex items-center gap-2 text-[#666] hover:text-[#1a1a1a] transition-colors cursor-default">
                  <Circle className="w-2 h-2 fill-current" />
                  <span className="font-sans text-sm">{platform}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Editorial intro */}
      <section id="about" className="py-24">
        <div className="mx-auto max-w-7xl px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <p className="font-sans text-xs text-[#999] uppercase tracking-widest mb-4">Editor's Letter</p>
              <h2 className="font-serif text-4xl md:text-5xl font-medium leading-tight mb-6">
                We designed Heimdall for creators who value <em>clarity</em> over complexity.
              </h2>
            </div>
            <div className="flex flex-col justify-center">
              <p className="font-sans text-[#666] leading-relaxed mb-6">
                In a landscape cluttered with feature-bloated tools, we've taken a different approach. 
                Every element of Heimdall has been carefully considered—stripped of excess, 
                refined for purpose, designed for the way you actually work.
              </p>
              <p className="font-sans text-[#666] leading-relaxed">
                The result is a platform that feels less like software and more like an 
                extension of your creative process. Intuitive. Elegant. Effective.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 border-y border-[#e5e5e3]">
        <div className="mx-auto max-w-7xl px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <p className="font-sans text-xs text-[#999] uppercase tracking-widest mb-2">Section II</p>
              <h2 className="font-serif text-4xl font-medium">Capabilities</h2>
            </div>
            <span className="font-sans text-xs text-[#999]">06 Features</span>
          </div>

          <div className="border-t border-[#e5e5e3]">
            {features.map((feature, i) => (
              <FeatureRow 
                key={feature.title} 
                number={String(i + 1).padStart(2, '0')}
                {...feature} 
              />
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-[#fafaf8]">
        <div className="mx-auto max-w-7xl px-8">
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { value: "2,400+", label: "Active Teams" },
              { value: "12M", label: "Posts Scheduled" },
              { value: "89%", label: "Time Saved" },
              { value: "4.9", label: "User Rating" },
            ].map((stat) => (
              <div key={stat.label} className="text-center py-8">
                <p className="font-serif text-5xl md:text-6xl font-medium text-[#1a1a1a] mb-2">{stat.value}</p>
                <p className="font-sans text-sm text-[#999] uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 border-y border-[#e5e5e3]">
        <div className="mx-auto max-w-7xl px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <p className="font-sans text-xs text-[#999] uppercase tracking-widest mb-2">Section III</p>
              <h2 className="font-serif text-4xl font-medium">What They Say</h2>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-16">
            <div className="border-r border-[#e5e5e3] pr-16">
              <Testimonial 
                quote="Heimdall has transformed how our editorial team approaches social. The clarity it brings to our workflow is remarkable."
                author="Sarah Chen"
                role="Head of Digital"
                publication="The Atlantic"
              />
            </div>
            <div className="pl-0 md:pl-16">
              <Testimonial 
                quote="Finally, a tool that doesn't get in the way. It's the elegant solution we've been searching for."
                author="Marcus Webb"
                role="Creative Director"
                publication="Condé Nast"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32">
        <div className="mx-auto max-w-4xl px-8 text-center">
          <p className="font-sans text-xs text-[#3b5998] uppercase tracking-widest mb-6">Subscribe</p>
          <h2 className="font-serif text-5xl md:text-6xl font-medium leading-tight mb-8">
            Ready to bring clarity
            <br />
            to your social presence?
          </h2>
          <p className="font-sans text-[#666] max-w-xl mx-auto mb-10">
            Start your 14-day free trial today. No credit card required.
            Join thousands of teams already using Heimdall.
          </p>
          <Link to="/dashboard">
            <Button className="font-sans text-sm bg-[#1a1a1a] hover:bg-[#333] text-white border-0 rounded-sm h-14 px-10">
              Begin Your Trial
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#e5e5e3] bg-[#fafaf8]">
        <div className="mx-auto max-w-7xl px-8">
          <div className="py-16 grid md:grid-cols-4 gap-12">
            <div className="md:col-span-2">
              <span className="font-serif text-2xl font-medium text-[#1a1a1a] block mb-4">Heimdall</span>
              <p className="font-sans text-sm text-[#999] max-w-xs">
                The thoughtful approach to social media management. 
                Designed for those who value clarity.
              </p>
            </div>
            <div>
              <p className="font-sans text-xs text-[#999] uppercase tracking-widest mb-4">Product</p>
              <div className="space-y-3">
                <a href="#" className="block font-sans text-sm text-[#666] hover:text-[#1a1a1a] transition-colors">Features</a>
                <a href="#" className="block font-sans text-sm text-[#666] hover:text-[#1a1a1a] transition-colors">Pricing</a>
                <a href="http://localhost:8080/reference" target="_blank" rel="noopener noreferrer" className="block font-sans text-sm text-[#666] hover:text-[#1a1a1a] transition-colors">API</a>
              </div>
            </div>
            <div>
              <p className="font-sans text-xs text-[#999] uppercase tracking-widest mb-4">Company</p>
              <div className="space-y-3">
                <a href="#" className="block font-sans text-sm text-[#666] hover:text-[#1a1a1a] transition-colors">About</a>
                <a href="#" className="block font-sans text-sm text-[#666] hover:text-[#1a1a1a] transition-colors">Privacy</a>
                <a href="#" className="block font-sans text-sm text-[#666] hover:text-[#1a1a1a] transition-colors">Terms</a>
              </div>
            </div>
          </div>
          <div className="py-6 border-t border-[#e5e5e3] flex items-center justify-between">
            <p className="font-sans text-xs text-[#999]">© {currentYear} Heimdall. All rights reserved.</p>
            <p className="font-sans text-xs text-[#999]">Made with care</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
