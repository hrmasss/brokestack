/**
 * BRUTALIST BOLD - Marketing Page Design 5
 * 
 * Aesthetic: Raw, bold, intentional, powerful
 * Colors: Pure black, pure white, single accent (electric red)
 * Typography: Bebas Neue (ultra bold) + IBM Plex Mono
 * Key features: Massive typography, grid-breaking layouts, harsh contrasts, no-nonsense
 */

import { Link } from "react-router";
import {
  ArrowRight,
  BarChart3,
  Calendar,
  ChevronRight,
  Globe2,
  Layers,
  Minus,
  Plus,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

// Harsh bordered box
function BrutalistBox({ 
  children, 
  className,
  border = true 
}: { 
  children: React.ReactNode; 
  className?: string;
  border?: boolean;
}) {
  return (
    <div
      className={cn(
        "bg-black",
        border && "border-2 border-white",
        className
      )}
    >
      {children}
    </div>
  );
}

// Accordion/FAQ item
function AccordionItem({ 
  number, 
  title, 
  content,
  isOpen,
  onToggle
}: { 
  number: string;
  title: string; 
  content: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b-2 border-white">
      <button
        onClick={onToggle}
        className="w-full py-6 flex items-center justify-between gap-4 text-left hover:bg-white/5 transition-colors px-6"
      >
        <div className="flex items-center gap-6">
          <span className="font-mono text-sm text-white/50">{number}</span>
          <span className="font-display text-xl md:text-2xl font-bold uppercase tracking-wider">{title}</span>
        </div>
        {isOpen ? (
          <Minus className="w-6 h-6 text-red-500 flex-shrink-0" />
        ) : (
          <Plus className="w-6 h-6 text-white flex-shrink-0" />
        )}
      </button>
      {isOpen && (
        <div className="px-6 pb-6 pl-[72px]">
          <p className="font-mono text-sm text-white/60 leading-relaxed max-w-2xl">{content}</p>
        </div>
      )}
    </div>
  );
}

// Marquee text
function MarqueeText({ text }: { text: string }) {
  return (
    <div className="overflow-hidden whitespace-nowrap border-y-2 border-white py-4 bg-red-600">
      <div className="animate-[marquee_20s_linear_infinite] inline-block">
        {[...Array(4)].map((_, i) => (
          <span key={i} className="font-display text-2xl font-bold uppercase tracking-wider mx-8 text-white">
            {text} •
          </span>
        ))}
      </div>
    </div>
  );
}

export function MarketingBrutalist() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const features = [
    {
      icon: Calendar,
      title: "SCHEDULING",
      description: "Post. When. You. Want.",
    },
    {
      icon: Sparkles,
      title: "AI CONTENT",
      description: "Generate. Don't hesitate.",
    },
    {
      icon: BarChart3,
      title: "ANALYTICS",
      description: "Numbers. No fluff.",
    },
    {
      icon: Users,
      title: "TEAM",
      description: "Collaborate. Dominate.",
    },
    {
      icon: Zap,
      title: "AUTOMATION",
      description: "Set. Forget. Win.",
    },
    {
      icon: Layers,
      title: "LIBRARY",
      description: "Store. Reuse. Scale.",
    },
  ];

  const faqs = [
    {
      title: "What makes Heimdall different",
      content: "No gimmicks. No fluff. Just raw power for managing your social presence. We built tools that work, stripped of everything that doesn't matter.",
    },
    {
      title: "How does pricing work",
      content: "Simple. One price. All features. No hidden costs. No 'enterprise' upsells. You pay for what you need, nothing more.",
    },
    {
      title: "Which platforms supported",
      content: "All of them. X, Instagram, LinkedIn, Facebook, TikTok, YouTube, Pinterest, Threads. If it exists, we connect to it.",
    },
    {
      title: "Can I try it free",
      content: "Yes. 14 days. Full access. No credit card. No strings. Either it works for you or it doesn't.",
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=IBM+Plex+Mono:wght@400;500;600;700&display=swap');
        
        .font-display { font-family: 'Bebas Neue', sans-serif; }
        .font-mono { font-family: 'IBM Plex Mono', monospace; }
        
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        
        .cursor-blink::after {
          content: "_";
          animation: blink 1s infinite;
        }
      `}</style>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black border-b-2 border-white">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-red-600 flex items-center justify-center">
              <span className="font-display text-2xl text-white">H</span>
            </div>
            <span className="font-display text-2xl tracking-wider hidden sm:block">HEIMDALL</span>
          </div>
          
          <div className="hidden md:flex items-center">
            <a href="#features" className="font-mono text-xs uppercase tracking-wider px-6 py-2 border-l-2 border-white hover:bg-white hover:text-black transition-colors">Features</a>
            <a href="#faq" className="font-mono text-xs uppercase tracking-wider px-6 py-2 border-l-2 border-white hover:bg-white hover:text-black transition-colors">FAQ</a>
            <a href="#" className="font-mono text-xs uppercase tracking-wider px-6 py-2 border-l-2 border-white hover:bg-white hover:text-black transition-colors">Pricing</a>
          </div>
          
          <div className="flex items-center">
            <Link to="/dashboard">
              <Button className="font-mono text-xs uppercase tracking-wider bg-red-600 hover:bg-red-500 text-white border-0 rounded-none h-10 px-6">
                ENTER →
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-16 min-h-screen flex flex-col">
        <div className="flex-1 flex flex-col justify-center px-6 py-20">
          <div className="max-w-[1400px] mx-auto w-full">
            {/* Eyebrow */}
            <div className="mb-8">
              <span className="font-mono text-sm text-red-500 uppercase tracking-widest cursor-blink">
                Social media. Simplified
              </span>
            </div>

            {/* Main headline - MASSIVE */}
            <h1 className="font-display text-[12vw] md:text-[15vw] lg:text-[18vw] leading-[0.85] tracking-tight mb-8">
              <span className="block">TAKE</span>
              <span className="block text-red-600">CONTROL</span>
            </h1>

            {/* Subtext */}
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div />
              <div>
                <p className="font-mono text-sm text-white/60 leading-relaxed max-w-md">
                  One platform. All your social channels. No complexity. 
                  Just raw power to dominate your digital presence.
                </p>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4">
              <Link to="/dashboard">
                <Button className="font-mono text-sm uppercase tracking-wider bg-white text-black hover:bg-red-600 hover:text-white border-0 rounded-none h-14 px-8 transition-colors">
                  GET STARTED FREE
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Button 
                variant="outline" 
                className="font-mono text-sm uppercase tracking-wider border-2 border-white text-white hover:bg-white hover:text-black rounded-none h-14 px-8"
              >
                WATCH DEMO
              </Button>
            </div>
          </div>
        </div>

        {/* Platform strip */}
        <div className="border-t-2 border-white">
          <div className="flex flex-wrap">
            {["X", "INSTAGRAM", "LINKEDIN", "FACEBOOK", "TIKTOK", "YOUTUBE"].map((platform, i) => (
              <div 
                key={platform}
                className={cn(
                  "flex-1 min-w-[150px] py-6 flex items-center justify-center gap-2 border-r-2 border-white last:border-r-0",
                  "font-mono text-xs uppercase tracking-wider text-white/50 hover:text-white hover:bg-white/5 transition-colors"
                )}
              >
                <Globe2 className="w-4 h-4" />
                {platform}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Marquee */}
      <MarqueeText text="SCHEDULE • AUTOMATE • ANALYZE • COLLABORATE • DOMINATE" />

      {/* Features Grid */}
      <section id="features" className="border-b-2 border-white">
        <div className="grid md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <div 
              key={feature.title}
              className={cn(
                "p-8 md:p-12 border-b-2 md:border-b-0 border-white",
                "md:border-r-2 md:last:border-r-0",
                "lg:[&:nth-child(3)]:border-r-0 lg:[&:nth-child(4)]:border-r-2",
                i < 3 ? "lg:border-b-2" : "",
                "hover:bg-white/5 transition-colors group"
              )}
            >
              <div className="flex items-start justify-between mb-6">
                <feature.icon className="w-8 h-8 text-red-500" />
                <span className="font-mono text-xs text-white/30">{String(i + 1).padStart(2, '0')}</span>
              </div>
              <h3 className="font-display text-4xl mb-2 group-hover:text-red-500 transition-colors">{feature.title}</h3>
              <p className="font-mono text-sm text-white/50">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <BrutalistBox className="p-10">
              <p className="font-display text-[100px] leading-none text-red-600">2K+</p>
              <p className="font-mono text-sm text-white/50 mt-4 uppercase tracking-wider">Active Users</p>
            </BrutalistBox>
            <BrutalistBox className="p-10">
              <p className="font-display text-[100px] leading-none text-white">12M</p>
              <p className="font-mono text-sm text-white/50 mt-4 uppercase tracking-wider">Posts Scheduled</p>
            </BrutalistBox>
            <BrutalistBox className="p-10">
              <p className="font-display text-[100px] leading-none text-red-600">99%</p>
              <p className="font-mono text-sm text-white/50 mt-4 uppercase tracking-wider">Uptime</p>
            </BrutalistBox>
          </div>
        </div>
      </section>

      {/* Marquee 2 */}
      <MarqueeText text="NO FLUFF • JUST RESULTS • NO GIMMICKS • PURE POWER" />

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-6">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <p className="font-mono text-sm text-red-500 uppercase tracking-widest mb-4">FAQ</p>
              <h2 className="font-display text-6xl md:text-8xl leading-none mb-6">
                QUESTIONS?<br />
                <span className="text-red-600">ANSWERS.</span>
              </h2>
              <p className="font-mono text-sm text-white/50 max-w-md">
                No complicated support tickets. No waiting. 
                Here's what you need to know.
              </p>
            </div>
            
            <div className="border-2 border-white">
              {faqs.map((faq, i) => (
                <AccordionItem
                  key={faq.title}
                  number={String(i + 1).padStart(2, '0')}
                  title={faq.title}
                  content={faq.content}
                  isOpen={openFaq === i}
                  onToggle={() => setOpenFaq(openFaq === i ? null : i)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 border-t-2 border-white">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="font-display text-6xl md:text-8xl leading-none">
                START<br />
                <span className="text-red-600">NOW.</span>
              </h2>
            </div>
            <div className="flex flex-col items-start lg:items-end gap-6">
              <p className="font-mono text-sm text-white/50 max-w-md lg:text-right">
                14 days free. Full access. No credit card required.
                Stop wasting time. Start dominating.
              </p>
              <Link to="/dashboard">
                <Button className="font-mono text-sm uppercase tracking-wider bg-red-600 hover:bg-white hover:text-black text-white border-0 rounded-none h-16 px-12 transition-colors">
                  GET STARTED
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-2 border-white">
        <div className="flex flex-wrap">
          <div className="flex-1 min-w-[200px] p-6 border-r-2 border-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-red-600 flex items-center justify-center">
                <span className="font-display text-lg">H</span>
              </div>
              <span className="font-display text-xl">HEIMDALL</span>
            </div>
            <p className="font-mono text-xs text-white/40">
              © {new Date().getFullYear()}
            </p>
          </div>
          <a href="#" className="flex-1 min-w-[150px] p-6 border-r-2 border-white font-mono text-xs uppercase tracking-wider text-white/50 hover:bg-white/5 hover:text-white transition-colors flex items-center justify-center">
            Privacy
          </a>
          <a href="#" className="flex-1 min-w-[150px] p-6 border-r-2 border-white font-mono text-xs uppercase tracking-wider text-white/50 hover:bg-white/5 hover:text-white transition-colors flex items-center justify-center">
            Terms
          </a>
          <a href="http://localhost:8080/reference" target="_blank" rel="noopener noreferrer" className="flex-1 min-w-[150px] p-6 font-mono text-xs uppercase tracking-wider text-white/50 hover:bg-white/5 hover:text-white transition-colors flex items-center justify-center">
            API ↗
          </a>
        </div>
      </footer>
    </div>
  );
}
