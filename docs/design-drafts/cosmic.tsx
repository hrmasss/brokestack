/**
 * COSMIC DARK - Marketing Page Design 1
 * 
 * Aesthetic: Deep space, ethereal, cosmic
 * Colors: Deep indigo, purple nebula, cyan accents, star white
 * Typography: Clash Display (bold, modern) + Work Sans
 * Key features: Animated star particles, glass morphism, floating orbs, gradient mesh
 */

import { Link } from "react-router";
import {
  ArrowRight,
  BarChart3,
  Calendar,
  ChevronRight,
  Globe2,
  Layers,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Animated star background
function StarField() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Large gradient orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-purple-600/20 blur-[120px] animate-pulse" />
      <div className="absolute top-[40%] right-[-5%] w-[500px] h-[500px] rounded-full bg-indigo-500/15 blur-[100px]" />
      <div className="absolute bottom-[-10%] left-[30%] w-[400px] h-[400px] rounded-full bg-cyan-500/10 blur-[80px]" />
      
      {/* Static stars */}
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-0.5 h-0.5 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.7 + 0.3,
              animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>
      
      {/* Shooting stars */}
      <div className="absolute w-px h-20 bg-gradient-to-b from-white/80 to-transparent rotate-[35deg] top-[10%] left-[80%] animate-[shooting_4s_ease-in-out_infinite]" />
      <div className="absolute w-px h-16 bg-gradient-to-b from-cyan-400/60 to-transparent rotate-[35deg] top-[30%] left-[20%] animate-[shooting_6s_ease-in-out_infinite_2s]" />
    </div>
  );
}

// Glass card component
function GlassCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl",
        "before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br before:from-white/10 before:to-transparent before:opacity-50",
        className
      )}
    >
      <div className="relative">{children}</div>
    </div>
  );
}

// Animated feature card
function FeatureCard({ 
  icon: Icon, 
  title, 
  description,
  delay = 0 
}: { 
  icon: React.ElementType; 
  title: string; 
  description: string;
  delay?: number;
}) {
  return (
    <GlassCard className="group p-6 hover:border-purple-500/30 transition-all duration-500 hover:-translate-y-1">
      <div className="mb-4 w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center group-hover:from-purple-500/40 group-hover:to-cyan-500/40 transition-all duration-500">
        <Icon className="w-6 h-6 text-cyan-400" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-white/60 leading-relaxed">{description}</p>
    </GlassCard>
  );
}

// Platform logo pills
function PlatformPill({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-default">
      <Globe2 className="w-4 h-4 text-purple-400" />
      <span className="text-sm text-white/70 font-medium">{name}</span>
    </div>
  );
}

export function MarketingCosmic() {
  const features = [
    {
      icon: Calendar,
      title: "Intelligent Scheduling",
      description: "AI-powered timing suggestions that optimize your reach across every timezone.",
    },
    {
      icon: Sparkles,
      title: "Content Alchemy",
      description: "Transform ideas into compelling posts with our neural content engine.",
    },
    {
      icon: BarChart3,
      title: "Unified Analytics",
      description: "See the bigger picture with cross-platform insights in one cosmic dashboard.",
    },
    {
      icon: Users,
      title: "Team Constellation",
      description: "Collaborate seamlessly with approval workflows and role-based access.",
    },
    {
      icon: Zap,
      title: "Automation Orbits",
      description: "Set up intelligent automation that works while you sleep.",
    },
    {
      icon: Layers,
      title: "Content Vault",
      description: "Your best content, organized and ready to deploy at any moment.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#050510] text-white overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
        
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        
        @keyframes shooting {
          0% { transform: translateX(0) translateY(0) rotate(35deg); opacity: 1; }
          70% { opacity: 1; }
          100% { transform: translateX(-200px) translateY(200px) rotate(35deg); opacity: 0; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.3); }
          50% { box-shadow: 0 0 40px rgba(139, 92, 246, 0.6); }
        }
      `}</style>
      
      <StarField />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <GlassCard className="!rounded-full px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">H</span>
                </div>
                <span className="font-bold text-lg tracking-tight">Heimdall</span>
              </div>
              
              <div className="hidden md:flex items-center gap-8">
                <a href="#features" className="text-sm text-white/60 hover:text-white transition-colors">Features</a>
                <a href="#platforms" className="text-sm text-white/60 hover:text-white transition-colors">Platforms</a>
                <a href="#pricing" className="text-sm text-white/60 hover:text-white transition-colors">Pricing</a>
              </div>
              
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10">
                  Sign in
                </Button>
                <Link to="/dashboard">
                  <Button size="sm" className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white border-0">
                    Launch App
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </GlassCard>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
              </span>
              <span className="text-xs text-purple-300 font-medium tracking-wide uppercase">
                Now in Early Access
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight leading-[0.9] mb-8">
              <span className="block text-white">Your social</span>
              <span className="block bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent animate-[gradient_3s_ease-in-out_infinite]">
                command center
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl text-white/60 max-w-2xl mb-12 leading-relaxed">
              Unite every platform. Amplify every message. Navigate the social cosmos with precision and power.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-20">
              <Link to="/dashboard">
                <Button 
                  size="lg" 
                  className="h-14 px-8 text-lg bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white border-0 rounded-full"
                  style={{ animation: 'glow 2s ease-in-out infinite' }}
                >
                  Begin Your Journey
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="lg"
                className="h-14 px-8 text-lg rounded-full border-white/20 text-white hover:bg-white/10 hover:border-white/40"
              >
                Watch Demo
              </Button>
            </div>

            {/* Social Proof */}
            <div className="flex flex-col items-center gap-4">
              <div className="flex -space-x-3">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/50 to-cyan-500/50 border-2 border-[#050510] flex items-center justify-center"
                    style={{ animation: `float ${3 + i * 0.2}s ease-in-out infinite`, animationDelay: `${i * 0.1}s` }}
                  >
                    <span className="text-xs font-medium">{String.fromCharCode(65 + i)}</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-white/40">
                Trusted by <span className="text-cyan-400 font-semibold">2,000+</span> cosmic marketers
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Platforms Section */}
      <section id="platforms" className="py-20 border-y border-white/5">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-center text-sm text-white/40 mb-8 uppercase tracking-wider">
            Connect your universe
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {["X", "Instagram", "LinkedIn", "Facebook", "TikTok", "YouTube", "Pinterest", "Threads"].map((platform) => (
              <PlatformPill key={platform} name={platform} />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              <span className="text-white">Stellar </span>
              <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">capabilities</span>
            </h2>
            <p className="text-lg text-white/50 max-w-2xl mx-auto">
              Everything you need to dominate every platform, unified in one interface.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <FeatureCard key={feature.title} {...feature} delay={index * 100} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32">
        <div className="mx-auto max-w-7xl px-6">
          <GlassCard className="p-12 md:p-20 text-center overflow-hidden">
            {/* Background decorations */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-purple-500/20 to-transparent blur-[100px]" />
            
            <div className="relative">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                Ready for <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">liftoff</span>?
              </h2>
              <p className="text-lg text-white/50 max-w-xl mx-auto mb-10">
                Join the constellation of marketers already saving hours every week with Heimdall.
              </p>
              <Link to="/dashboard">
                <Button 
                  size="lg" 
                  className="h-14 px-10 text-lg bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white border-0 rounded-full"
                >
                  Start Free Trial
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center">
                <span className="text-white font-bold text-xs">H</span>
              </div>
              <span className="font-semibold">Heimdall</span>
            </div>
            <p className="text-sm text-white/30">
              © {new Date().getFullYear()} Heimdall. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-white/30 hover:text-white/60 transition-colors">Privacy</a>
              <a href="#" className="text-sm text-white/30 hover:text-white/60 transition-colors">Terms</a>
              <a href="http://localhost:8080/reference" target="_blank" rel="noopener noreferrer" className="text-sm text-white/30 hover:text-white/60 transition-colors">API</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
