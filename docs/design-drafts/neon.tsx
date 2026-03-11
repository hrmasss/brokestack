/**
 * NEON CYBER - Marketing Page Design 3
 * 
 * Aesthetic: Cyberpunk, electric, futuristic, bold
 * Colors: Electric cyan, hot magenta, neon yellow, deep black
 * Typography: Orbitron (tech display) + Space Grotesk
 * Key features: Glitch effects, scanlines, neon glows, geometric shapes
 */

import { Link } from "react-router";
import {
  ArrowRight,
  BarChart3,
  Calendar,
  Cpu,
  Globe2,
  Layers,
  Network,
  Sparkles,
  Terminal,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

// Scanline effect overlay
function Scanlines() {
  return (
    <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.03]">
      <div 
        className="w-full h-full"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,255,0.1) 2px, rgba(0,255,255,0.1) 4px)',
        }}
      />
    </div>
  );
}

// Glitch text effect
function GlitchText({ children, className }: { children: string; className?: string }) {
  return (
    <span className={cn("relative inline-block", className)}>
      <span className="relative z-10">{children}</span>
      <span 
        className="absolute top-0 left-0 text-cyan-400 animate-[glitch1_2s_infinite] clip-path-glitch"
        aria-hidden="true"
      >
        {children}
      </span>
      <span 
        className="absolute top-0 left-0 text-magenta-400 animate-[glitch2_2s_infinite] clip-path-glitch"
        style={{ color: '#ff00ff' }}
        aria-hidden="true"
      >
        {children}
      </span>
    </span>
  );
}

// Neon card with border glow
function NeonCard({ 
  children, 
  className, 
  glow = "cyan" 
}: { 
  children: React.ReactNode; 
  className?: string;
  glow?: "cyan" | "magenta" | "yellow";
}) {
  const glowColors = {
    cyan: "shadow-[0_0_20px_rgba(0,255,255,0.3)] hover:shadow-[0_0_40px_rgba(0,255,255,0.5)] border-cyan-500/30 hover:border-cyan-400/60",
    magenta: "shadow-[0_0_20px_rgba(255,0,255,0.3)] hover:shadow-[0_0_40px_rgba(255,0,255,0.5)] border-pink-500/30 hover:border-pink-400/60",
    yellow: "shadow-[0_0_20px_rgba(255,255,0,0.2)] hover:shadow-[0_0_40px_rgba(255,255,0,0.4)] border-yellow-500/30 hover:border-yellow-400/60",
  };

  return (
    <div
      className={cn(
        "relative rounded-lg bg-black/50 border backdrop-blur-sm transition-all duration-300",
        glowColors[glow],
        className
      )}
    >
      {children}
    </div>
  );
}

// Animated counter
function AnimatedNumber({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [target]);
  
  return <span>{count.toLocaleString()}{suffix}</span>;
}

// Feature card with icon
function FeatureCard({ 
  icon: Icon, 
  title, 
  description,
  index 
}: { 
  icon: React.ElementType; 
  title: string; 
  description: string;
  index: number;
}) {
  const glows: Array<"cyan" | "magenta" | "yellow"> = ["cyan", "magenta", "yellow"];
  
  return (
    <NeonCard className="p-6 group" glow={glows[index % 3]}>
      <div className="flex items-start gap-4">
        <div className={cn(
          "w-12 h-12 rounded-lg flex items-center justify-center border transition-colors",
          index % 3 === 0 && "border-cyan-500/50 bg-cyan-950/50 text-cyan-400 group-hover:bg-cyan-900/50",
          index % 3 === 1 && "border-pink-500/50 bg-pink-950/50 text-pink-400 group-hover:bg-pink-900/50",
          index % 3 === 2 && "border-yellow-500/50 bg-yellow-950/50 text-yellow-400 group-hover:bg-yellow-900/50",
        )}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h3 className="text-base font-bold text-white mb-1 uppercase tracking-wider">{title}</h3>
          <p className="text-sm text-zinc-500 leading-relaxed">{description}</p>
        </div>
      </div>
    </NeonCard>
  );
}

export function MarketingNeon() {
  const features = [
    {
      icon: Calendar,
      title: "Neural Scheduling",
      description: "AI-optimized post timing based on real-time engagement patterns.",
    },
    {
      icon: Sparkles,
      title: "Gen AI Content",
      description: "Next-gen content generation powered by advanced language models.",
    },
    {
      icon: BarChart3,
      title: "Data Matrix",
      description: "Real-time analytics dashboard with predictive insights.",
    },
    {
      icon: Users,
      title: "Team Network",
      description: "Distributed collaboration with encrypted communication.",
    },
    {
      icon: Zap,
      title: "Auto Protocol",
      description: "Smart automation rules that adapt to your brand voice.",
    },
    {
      icon: Layers,
      title: "Asset Vault",
      description: "Secure cloud storage for all your digital assets.",
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
        
        .font-display { font-family: 'Orbitron', sans-serif; }
        .font-body { font-family: 'Space Grotesk', sans-serif; }
        
        @keyframes glitch1 {
          0%, 100% { clip-path: inset(0 0 0 0); transform: translate(0); }
          20% { clip-path: inset(20% 0 60% 0); transform: translate(-2px, 2px); }
          40% { clip-path: inset(80% 0 5% 0); transform: translate(2px, -2px); }
          60% { clip-path: inset(10% 0 70% 0); transform: translate(-1px, 1px); }
          80% { clip-path: inset(50% 0 30% 0); transform: translate(1px, -1px); }
        }
        
        @keyframes glitch2 {
          0%, 100% { clip-path: inset(0 0 0 0); transform: translate(0); }
          20% { clip-path: inset(60% 0 20% 0); transform: translate(2px, -2px); }
          40% { clip-path: inset(5% 0 80% 0); transform: translate(-2px, 2px); }
          60% { clip-path: inset(70% 0 10% 0); transform: translate(1px, -1px); }
          80% { clip-path: inset(30% 0 50% 0); transform: translate(-1px, 1px); }
        }
        
        @keyframes pulse-neon {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(1deg); }
        }
        
        .clip-path-glitch {
          clip-path: inset(0 0 0 0);
        }
        
        .bg-grid {
          background-image: 
            linear-gradient(rgba(0,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,255,0.03) 1px, transparent 1px);
          background-size: 50px 50px;
        }
      `}</style>

      <Scanlines />

      {/* Background */}
      <div className="fixed inset-0 bg-grid" />
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-cyan-500/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-pink-500/10 blur-[150px] rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-yellow-500/5 blur-[200px] rounded-full" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-xl border-b border-cyan-900/30">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 border-2 border-cyan-400 rounded-lg flex items-center justify-center bg-black">
                  <Terminal className="w-5 h-5 text-cyan-400" />
                </div>
                <div className="absolute inset-0 border-2 border-cyan-400/50 rounded-lg blur-sm" />
              </div>
              <span className="font-display text-lg font-bold tracking-wider text-white">
                HEIMDALL
              </span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-body text-zinc-500 hover:text-cyan-400 transition-colors uppercase tracking-wider">Features</a>
              <a href="#stats" className="text-sm font-body text-zinc-500 hover:text-cyan-400 transition-colors uppercase tracking-wider">Stats</a>
              <a href="#network" className="text-sm font-body text-zinc-500 hover:text-cyan-400 transition-colors uppercase tracking-wider">Network</a>
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="ghost" className="font-body text-zinc-400 hover:text-cyan-400 hover:bg-transparent uppercase text-xs tracking-wider">
                Login
              </Button>
              <Link to="/dashboard">
                <Button className="font-body bg-cyan-500 hover:bg-cyan-400 text-black font-bold uppercase text-xs tracking-wider border-0">
                  Initialize
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center text-center">
            {/* Status Badge */}
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-950/20 mb-8">
              <span className="flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
              </span>
              <span className="font-body text-xs text-cyan-400 uppercase tracking-widest font-medium">
                System Online • Version 2.0
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.9] mb-8">
              <span className="block text-white">SOCIAL MEDIA</span>
              <GlitchText className="block text-cyan-400">
                COMMAND CENTER
              </GlitchText>
            </h1>

            {/* Subheadline */}
            <p className="font-body text-lg text-zinc-500 max-w-2xl mb-12">
              Next-generation platform for digital dominance. Automate. Analyze. Amplify.
              Break through the noise with precision-engineered social strategy.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-20">
              <Link to="/dashboard">
                <Button 
                  size="lg" 
                  className="h-14 px-8 font-body bg-cyan-500 hover:bg-cyan-400 text-black font-bold uppercase tracking-wider border-0 shadow-[0_0_30px_rgba(0,255,255,0.5)]"
                >
                  <Cpu className="w-5 h-5" />
                  Initialize Protocol
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="lg"
                className="h-14 px-8 font-body border-pink-500/50 text-pink-400 hover:bg-pink-950/30 hover:border-pink-400 uppercase tracking-wider"
              >
                <Network className="w-5 h-5" />
                View Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 md:gap-16" id="stats">
              <div className="text-center">
                <p className="font-display text-4xl md:text-5xl font-black text-cyan-400">
                  <AnimatedNumber target={2847} />
                </p>
                <p className="font-body text-xs text-zinc-600 uppercase tracking-wider mt-2">Active Nodes</p>
              </div>
              <div className="text-center">
                <p className="font-display text-4xl md:text-5xl font-black text-pink-400">
                  <AnimatedNumber target={12} suffix="M" />
                </p>
                <p className="font-body text-xs text-zinc-600 uppercase tracking-wider mt-2">Posts Processed</p>
              </div>
              <div className="text-center">
                <p className="font-display text-4xl md:text-5xl font-black text-yellow-400">
                  99.9<span className="text-2xl">%</span>
                </p>
                <p className="font-body text-xs text-zinc-600 uppercase tracking-wider mt-2">Uptime</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platforms Section */}
      <section className="py-16 border-y border-zinc-900" id="network">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-center font-body text-xs text-zinc-600 mb-8 uppercase tracking-widest">
            Connected Networks
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            {["X", "Instagram", "LinkedIn", "Facebook", "TikTok", "YouTube", "Discord", "Threads"].map((platform, i) => (
              <NeonCard 
                key={platform} 
                className="px-5 py-3 flex items-center gap-2"
                glow={["cyan", "magenta", "yellow"][i % 3] as "cyan" | "magenta" | "yellow"}
              >
                <Globe2 className="w-4 h-4" />
                <span className="font-body text-sm font-medium uppercase tracking-wider">{platform}</span>
              </NeonCard>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <p className="font-body text-xs text-cyan-400 uppercase tracking-widest mb-4">System Modules</p>
            <h2 className="font-display text-4xl md:text-5xl font-black text-white">
              CORE <span className="text-cyan-400">CAPABILITIES</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <FeatureCard key={feature.title} {...feature} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-4xl">
          <NeonCard className="p-12 md:p-16 text-center" glow="cyan">
            <div className="w-20 h-20 rounded-xl border-2 border-cyan-500 bg-cyan-950/30 flex items-center justify-center mx-auto mb-8">
              <Terminal className="w-10 h-10 text-cyan-400" />
            </div>
            
            <h2 className="font-display text-3xl md:text-4xl font-black text-white mb-4">
              READY TO <span className="text-cyan-400">CONNECT</span>?
            </h2>
            <p className="font-body text-zinc-500 max-w-lg mx-auto mb-10">
              Join the network of operators who are redefining social media management.
            </p>
            <Link to="/dashboard">
              <Button 
                size="lg" 
                className="h-14 px-10 font-body bg-cyan-500 hover:bg-cyan-400 text-black font-bold uppercase tracking-wider border-0 shadow-[0_0_40px_rgba(0,255,255,0.5)]"
              >
                Access Terminal
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </NeonCard>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-zinc-900">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 border border-cyan-500/50 rounded flex items-center justify-center">
                <Terminal className="w-4 h-4 text-cyan-400" />
              </div>
              <span className="font-display text-sm font-bold tracking-wider">HEIMDALL</span>
            </div>
            <p className="font-body text-xs text-zinc-700">
              © {new Date().getFullYear()} Heimdall Systems. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="font-body text-xs text-zinc-600 hover:text-cyan-400 transition-colors uppercase tracking-wider">Privacy</a>
              <a href="#" className="font-body text-xs text-zinc-600 hover:text-cyan-400 transition-colors uppercase tracking-wider">Terms</a>
              <a href="http://localhost:8080/reference" target="_blank" rel="noopener noreferrer" className="font-body text-xs text-zinc-600 hover:text-cyan-400 transition-colors uppercase tracking-wider">API</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
