/**
 * WARM AMBER - Marketing Page Design 2
 * 
 * Aesthetic: Luxury, premium, warm, refined
 * Colors: Rich amber, warm gold, cream, deep espresso
 * Typography: Playfair Display (elegant serif) + DM Sans
 * Key features: Elegant gradients, subtle grain texture, refined animations, warm shadows
 */

import { Link } from "react-router";
import {
  ArrowRight,
  BarChart3,
  Calendar,
  Crown,
  Gem,
  Globe2,
  Layers,
  Sparkles,
  Target,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Premium card with warm glow
function PremiumCard({ children, className, hover = true }: { children: React.ReactNode; className?: string; hover?: boolean }) {
  return (
    <div
      className={cn(
        "relative rounded-2xl bg-gradient-to-br from-[#1a1510] to-[#0d0b09] border border-amber-900/30",
        hover && "hover:border-amber-700/50 hover:shadow-[0_0_40px_rgba(217,119,6,0.15)] transition-all duration-500",
        className
      )}
    >
      {children}
    </div>
  );
}

// Feature item with golden accent
function FeatureItem({ 
  icon: Icon, 
  title, 
  description 
}: { 
  icon: React.ElementType; 
  title: string; 
  description: string 
}) {
  return (
    <PremiumCard className="group p-8">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-600/20 to-amber-800/10 flex items-center justify-center border border-amber-700/30">
          <Icon className="w-6 h-6 text-amber-500" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-amber-50 mb-2 font-serif">{title}</h3>
          <p className="text-sm text-amber-100/40 leading-relaxed">{description}</p>
        </div>
      </div>
    </PremiumCard>
  );
}

// Decorative divider
function GoldenDivider() {
  return (
    <div className="flex items-center justify-center gap-4 py-8">
      <div className="h-px w-20 bg-gradient-to-r from-transparent to-amber-700/50" />
      <Gem className="w-4 h-4 text-amber-600/60" />
      <div className="h-px w-20 bg-gradient-to-l from-transparent to-amber-700/50" />
    </div>
  );
}

export function MarketingAmber() {
  const features = [
    {
      icon: Calendar,
      title: "Refined Scheduling",
      description: "Curated posting times optimized for each platform's peak engagement windows.",
    },
    {
      icon: Sparkles,
      title: "Artisanal Content",
      description: "Craft compelling narratives with AI-assisted copywriting that speaks to your audience.",
    },
    {
      icon: BarChart3,
      title: "Bespoke Analytics",
      description: "Custom reports and insights tailored to your brand's unique success metrics.",
    },
    {
      icon: Users,
      title: "Concierge Collaboration",
      description: "White-glove team workflows with role-based permissions and approval processes.",
    },
    {
      icon: Zap,
      title: "Automated Excellence",
      description: "Set-and-forget automation rules that maintain your brand's premium presence.",
    },
    {
      icon: Layers,
      title: "Curated Library",
      description: "A sophisticated asset management system for your finest content.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0908] text-amber-50">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=DM+Sans:wght@400;500;600;700&display=swap');
        
        .font-serif { font-family: 'Playfair Display', serif; }
        .font-sans { font-family: 'DM Sans', sans-serif; }
        
        /* Grain texture overlay */
        .grain::before {
          content: "";
          position: fixed;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          opacity: 0.03;
          pointer-events: none;
          z-index: 100;
        }
        
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        
        .text-shimmer {
          background: linear-gradient(90deg, #f59e0b, #fbbf24, #f59e0b);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }
      `}</style>

      <div className="grain" />

      {/* Background gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[800px] h-[400px] bg-amber-900/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[300px] bg-amber-800/5 blur-[120px] rounded-full" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0908]/80 backdrop-blur-xl border-b border-amber-900/20">
        <div className="mx-auto max-w-6xl px-8">
          <div className="flex h-20 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center">
                <Crown className="w-5 h-5 text-amber-100" />
              </div>
              <span className="font-serif text-xl font-semibold tracking-tight">Heimdall</span>
            </div>
            
            <div className="hidden md:flex items-center gap-10">
              <a href="#features" className="text-sm text-amber-100/50 hover:text-amber-400 transition-colors font-medium">Features</a>
              <a href="#about" className="text-sm text-amber-100/50 hover:text-amber-400 transition-colors font-medium">About</a>
              <a href="#pricing" className="text-sm text-amber-100/50 hover:text-amber-400 transition-colors font-medium">Pricing</a>
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="ghost" className="text-amber-100/60 hover:text-amber-400 hover:bg-transparent">
                Sign in
              </Button>
              <Link to="/dashboard">
                <Button className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white border-0 shadow-lg shadow-amber-900/30">
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-44 pb-32">
        <div className="mx-auto max-w-6xl px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Content */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-900/20 border border-amber-800/30 mb-8">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-xs text-amber-400/80 font-medium uppercase tracking-wider">Exclusive Early Access</span>
              </div>

              <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-semibold leading-[1.1] mb-8">
                <span className="block text-amber-50">Elevate your</span>
                <span className="block text-shimmer">social presence</span>
              </h1>

              <p className="text-lg text-amber-100/40 max-w-lg mb-10 leading-relaxed">
                A refined platform for discerning brands who demand excellence in every interaction, every post, every moment.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/dashboard">
                  <Button 
                    size="lg" 
                    className="h-14 px-8 text-base bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white border-0 shadow-xl shadow-amber-900/40"
                  >
                    Begin Your Journey
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="h-14 px-8 text-base border-amber-800/50 text-amber-400 hover:bg-amber-900/20 hover:text-amber-300"
                >
                  Schedule a Demo
                </Button>
              </div>
            </div>

            {/* Right: Decorative elements */}
            <div className="relative hidden lg:block">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-600/10 to-transparent rounded-full blur-3xl" />
              
              {/* Stats cards */}
              <div className="relative space-y-6">
                <PremiumCard className="p-6 ml-12" hover={false}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-600/30 to-amber-800/20 flex items-center justify-center">
                      <Target className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-3xl font-serif font-semibold text-amber-50">2.4M+</p>
                      <p className="text-sm text-amber-100/40">Posts Scheduled</p>
                    </div>
                  </div>
                </PremiumCard>
                
                <PremiumCard className="p-6 mr-12" hover={false}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-600/30 to-amber-800/20 flex items-center justify-center">
                      <Users className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-3xl font-serif font-semibold text-amber-50">180K+</p>
                      <p className="text-sm text-amber-100/40">Premium Brands</p>
                    </div>
                  </div>
                </PremiumCard>
                
                <PremiumCard className="p-6 ml-20" hover={false}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-600/30 to-amber-800/20 flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-3xl font-serif font-semibold text-amber-50">340%</p>
                      <p className="text-sm text-amber-100/40">Avg. Engagement Growth</p>
                    </div>
                  </div>
                </PremiumCard>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platforms */}
      <section className="py-16 border-y border-amber-900/20">
        <div className="mx-auto max-w-6xl px-8">
          <p className="text-center text-sm text-amber-100/30 mb-8 uppercase tracking-widest font-medium">
            Seamlessly Integrated
          </p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-12">
            {["X", "Instagram", "LinkedIn", "Facebook", "TikTok", "YouTube"].map((platform) => (
              <div key={platform} className="flex items-center gap-2 text-amber-100/30 hover:text-amber-400/80 transition-colors cursor-default">
                <Globe2 className="w-4 h-4" />
                <span className="text-sm font-medium">{platform}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <GoldenDivider />

      {/* Features Section */}
      <section id="features" className="py-24">
        <div className="mx-auto max-w-6xl px-8">
          <div className="text-center mb-20">
            <p className="text-sm text-amber-500 uppercase tracking-widest mb-4 font-medium">Capabilities</p>
            <h2 className="font-serif text-4xl md:text-5xl font-semibold mb-6">
              <span className="text-amber-50">Crafted for </span>
              <span className="text-shimmer">excellence</span>
            </h2>
            <p className="text-lg text-amber-100/40 max-w-2xl mx-auto">
              Every feature meticulously designed to elevate your brand's digital presence.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature) => (
              <FeatureItem key={feature.title} {...feature} />
            ))}
          </div>
        </div>
      </section>

      <GoldenDivider />

      {/* CTA Section */}
      <section className="py-24">
        <div className="mx-auto max-w-4xl px-8">
          <PremiumCard className="p-12 md:p-20 text-center" hover={false}>
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-600/30 to-amber-800/20 flex items-center justify-center mx-auto mb-8 border border-amber-700/30">
              <Crown className="w-7 h-7 text-amber-400" />
            </div>
            
            <h2 className="font-serif text-3xl md:text-4xl font-semibold mb-6">
              <span className="text-amber-50">Join the </span>
              <span className="text-shimmer">elite</span>
            </h2>
            <p className="text-amber-100/40 max-w-lg mx-auto mb-10">
              Experience the difference that premium social management makes for brands that refuse to settle.
            </p>
            <Link to="/dashboard">
              <Button 
                size="lg" 
                className="h-14 px-10 text-base bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white border-0 shadow-xl shadow-amber-900/50"
              >
                Request Early Access
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </PremiumCard>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-amber-900/20">
        <div className="mx-auto max-w-6xl px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center">
                <Crown className="w-4 h-4 text-amber-100" />
              </div>
              <span className="font-serif text-lg font-medium">Heimdall</span>
            </div>
            <p className="text-sm text-amber-100/20">
              © {new Date().getFullYear()} Heimdall. Crafted with excellence.
            </p>
            <div className="flex items-center gap-8">
              <a href="#" className="text-sm text-amber-100/30 hover:text-amber-400 transition-colors">Privacy</a>
              <a href="#" className="text-sm text-amber-100/30 hover:text-amber-400 transition-colors">Terms</a>
              <a href="http://localhost:8080/reference" target="_blank" rel="noopener noreferrer" className="text-sm text-amber-100/30 hover:text-amber-400 transition-colors">API</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
