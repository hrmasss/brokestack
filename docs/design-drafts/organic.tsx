/**
 * NATURE ORGANIC - Marketing Page Design 4
 * 
 * Aesthetic: Natural, organic, calming, sustainable
 * Colors: Sage green, warm cream, terracotta, forest deep
 * Typography: Fraunces (organic serif) + Nunito Sans
 * Key features: Organic shapes, flowing animations, natural textures, earth tones
 */

import { Link } from "react-router";
import {
  ArrowRight,
  BarChart3,
  Calendar,
  Feather,
  Globe2,
  Layers,
  Leaf,
  Mountain,
  Sparkles,
  Sprout,
  TreeDeciduous,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Organic blob shape
function OrganicBlob({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 200 200" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        fill="currentColor" 
        d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.5,90,-16.3,88.5,-0.9C87,14.5,81.3,29,71.4,39.7C61.5,50.4,47.3,57.3,33.4,64.3C19.5,71.3,5.8,78.4,-9.2,80.6C-24.2,82.8,-40.5,80.1,-54.1,72.6C-67.7,65.1,-78.6,52.7,-83.3,38.4C-88,24.1,-86.5,7.9,-82.7,-7.1C-78.8,-22.1,-72.6,-35.8,-62.6,-45.7C-52.6,-55.6,-38.9,-61.7,-25.5,-69.2C-12.2,-76.7,0.8,-85.7,14.2,-84.8C27.6,-83.9,41.5,-73.1,44.7,-76.4Z" 
        transform="translate(100 100)" 
      />
    </svg>
  );
}

// Natural card with organic styling
function NatureCard({ 
  children, 
  className,
  variant = "default"
}: { 
  children: React.ReactNode; 
  className?: string;
  variant?: "default" | "elevated";
}) {
  return (
    <div
      className={cn(
        "rounded-3xl transition-all duration-500",
        variant === "default" && "bg-[#1a1f1a] border border-[#2a352a]",
        variant === "elevated" && "bg-gradient-to-br from-[#1a2418] to-[#151a13] border border-[#2a3528]/50 shadow-xl",
        className
      )}
    >
      {children}
    </div>
  );
}

// Feature card with nature icon
function FeatureCard({ 
  icon: Icon, 
  title, 
  description,
  accent = "sage"
}: { 
  icon: React.ElementType; 
  title: string; 
  description: string;
  accent?: "sage" | "terracotta" | "cream";
}) {
  const accentStyles = {
    sage: "bg-emerald-900/30 text-emerald-400 border-emerald-800/50",
    terracotta: "bg-orange-900/30 text-orange-400 border-orange-800/50",
    cream: "bg-amber-900/30 text-amber-300 border-amber-800/50",
  };

  return (
    <NatureCard className="p-8 group hover:border-emerald-800/60 hover:-translate-y-1">
      <div className={cn(
        "w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border transition-all duration-300",
        accentStyles[accent],
        "group-hover:scale-110"
      )}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-semibold text-emerald-50 mb-2 font-serif">{title}</h3>
      <p className="text-sm text-emerald-100/40 leading-relaxed">{description}</p>
    </NatureCard>
  );
}

// Testimonial card
function TestimonialCard({ 
  quote, 
  author, 
  role 
}: { 
  quote: string; 
  author: string; 
  role: string;
}) {
  return (
    <NatureCard className="p-8" variant="elevated">
      <Leaf className="w-8 h-8 text-emerald-600/40 mb-4" />
      <p className="text-emerald-100/70 mb-6 leading-relaxed italic font-serif">"{quote}"</p>
      <div>
        <p className="font-semibold text-emerald-50">{author}</p>
        <p className="text-sm text-emerald-100/40">{role}</p>
      </div>
    </NatureCard>
  );
}

export function MarketingOrganic() {
  const features = [
    {
      icon: Calendar,
      title: "Mindful Scheduling",
      description: "Plan your content in harmony with your audience's natural rhythms and behaviors.",
      accent: "sage" as const,
    },
    {
      icon: Sparkles,
      title: "Authentic Content",
      description: "Generate genuine, heartfelt content that resonates with your community.",
      accent: "terracotta" as const,
    },
    {
      icon: BarChart3,
      title: "Growth Insights",
      description: "Watch your presence flourish with organic analytics and growth tracking.",
      accent: "cream" as const,
    },
    {
      icon: Users,
      title: "Community Care",
      description: "Nurture your team with thoughtful collaboration and shared values.",
      accent: "sage" as const,
    },
    {
      icon: Zap,
      title: "Natural Automation",
      description: "Let your processes flow effortlessly while maintaining authentic connections.",
      accent: "terracotta" as const,
    },
    {
      icon: Layers,
      title: "Content Garden",
      description: "Cultivate and organize your best ideas in a flourishing content library.",
      accent: "cream" as const,
    },
  ];

  return (
    <div className="min-h-screen bg-[#0d100d] text-emerald-50">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,400&family=Nunito+Sans:wght@400;500;600;700&display=swap');
        
        .font-serif { font-family: 'Fraunces', serif; }
        .font-sans { font-family: 'Nunito Sans', sans-serif; }
        
        @keyframes sway {
          0%, 100% { transform: rotate(-2deg); }
          50% { transform: rotate(2deg); }
        }
        
        @keyframes float-slow {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        
        @keyframes grow {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        .grain::before {
          content: "";
          position: fixed;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          opacity: 0.02;
          pointer-events: none;
          z-index: 100;
        }
      `}</style>

      <div className="grain" />

      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <OrganicBlob className="absolute -top-40 -right-40 w-[600px] h-[600px] text-emerald-950/50 animate-[sway_20s_ease-in-out_infinite]" />
        <OrganicBlob className="absolute -bottom-60 -left-40 w-[500px] h-[500px] text-emerald-950/30 animate-[sway_25s_ease-in-out_infinite_reverse]" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-orange-900/5 rounded-full blur-[100px]" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0d100d]/90 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-8">
          <div className="flex h-20 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center">
                <Sprout className="w-5 h-5 text-emerald-100" />
              </div>
              <span className="font-serif text-xl font-semibold text-emerald-50">Heimdall</span>
            </div>
            
            <div className="hidden md:flex items-center gap-10">
              <a href="#features" className="font-sans text-sm text-emerald-100/50 hover:text-emerald-400 transition-colors">Features</a>
              <a href="#philosophy" className="font-sans text-sm text-emerald-100/50 hover:text-emerald-400 transition-colors">Philosophy</a>
              <a href="#community" className="font-sans text-sm text-emerald-100/50 hover:text-emerald-400 transition-colors">Community</a>
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="ghost" className="font-sans text-emerald-100/60 hover:text-emerald-400 hover:bg-transparent">
                Sign in
              </Button>
              <Link to="/dashboard">
                <Button className="font-sans bg-emerald-600 hover:bg-emerald-500 text-white border-0 rounded-full px-6">
                  Get Started
                  <Feather className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-32">
        <div className="mx-auto max-w-6xl px-8">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-900/20 border border-emerald-800/30 mb-8">
              <Leaf className="w-4 h-4 text-emerald-500" />
              <span className="font-sans text-xs text-emerald-400/80 font-medium">Sustainable Social Growth</span>
            </div>

            {/* Headline */}
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-semibold leading-[1.1] mb-8">
              <span className="text-emerald-50">Cultivate your</span>
              <br />
              <span className="text-emerald-400">digital presence</span>
            </h1>

            {/* Subheadline */}
            <p className="font-sans text-lg text-emerald-100/50 max-w-xl mb-10 leading-relaxed">
              A mindful approach to social media management. Grow authentically, 
              connect genuinely, and nurture lasting relationships with your audience.
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/dashboard">
                <Button 
                  size="lg" 
                  className="h-14 px-8 font-sans bg-emerald-600 hover:bg-emerald-500 text-white border-0 rounded-full text-base"
                >
                  Plant Your Seeds
                  <Sprout className="w-5 h-5" />
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="lg"
                className="h-14 px-8 font-sans border-emerald-800/50 text-emerald-300 hover:bg-emerald-950/30 rounded-full text-base"
              >
                Learn Our Story
              </Button>
            </div>

            {/* Stats */}
            <div className="flex gap-12 mt-16">
              <div>
                <p className="font-serif text-4xl font-semibold text-emerald-400">2,400+</p>
                <p className="font-sans text-sm text-emerald-100/40 mt-1">Thriving brands</p>
              </div>
              <div>
                <p className="font-serif text-4xl font-semibold text-orange-400">89%</p>
                <p className="font-sans text-sm text-emerald-100/40 mt-1">Growth rate</p>
              </div>
              <div>
                <p className="font-serif text-4xl font-semibold text-amber-300">12M</p>
                <p className="font-sans text-sm text-emerald-100/40 mt-1">Posts nurtured</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platforms */}
      <section className="py-16 border-y border-emerald-900/30">
        <div className="mx-auto max-w-6xl px-8">
          <div className="flex flex-col items-center">
            <p className="font-sans text-sm text-emerald-100/30 mb-8 text-center">
              Nurture your presence across all platforms
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              {["X", "Instagram", "LinkedIn", "Facebook", "TikTok", "Pinterest"].map((platform) => (
                <div 
                  key={platform} 
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-950/30 border border-emerald-900/30 text-emerald-100/40 hover:text-emerald-400 hover:border-emerald-700/50 transition-all cursor-default"
                >
                  <Globe2 className="w-4 h-4" />
                  <span className="font-sans text-sm">{platform}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section id="philosophy" className="py-24">
        <div className="mx-auto max-w-6xl px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="font-sans text-sm text-emerald-500 uppercase tracking-wider mb-4">Our Philosophy</p>
              <h2 className="font-serif text-4xl font-semibold text-emerald-50 mb-6">
                Growth that honors
                <span className="text-emerald-400"> authenticity</span>
              </h2>
              <p className="font-sans text-emerald-100/50 leading-relaxed mb-8">
                We believe in sustainable social media practices. Like tending a garden, 
                your digital presence requires patience, care, and the right conditions 
                to flourish naturally.
              </p>
              <div className="space-y-4">
                {[
                  { icon: TreeDeciduous, text: "Organic growth over artificial inflation" },
                  { icon: Mountain, text: "Long-term strategy over quick fixes" },
                  { icon: Feather, text: "Authentic voice over trending templates" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-900/30 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-emerald-500" />
                    </div>
                    <span className="font-sans text-sm text-emerald-100/60">{text}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <NatureCard className="p-10" variant="elevated">
                <div className="absolute -top-6 -right-6 w-16 h-16 rounded-full bg-emerald-600/20 flex items-center justify-center animate-[float-slow_6s_ease-in-out_infinite]">
                  <Leaf className="w-8 h-8 text-emerald-500" />
                </div>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="font-sans text-sm text-emerald-100/40">Engagement Growth</span>
                    <span className="font-serif text-lg text-emerald-400">+127%</span>
                  </div>
                  <div className="h-2 bg-emerald-900/30 rounded-full overflow-hidden">
                    <div className="h-full w-[80%] bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-sans text-sm text-emerald-100/40">Authentic Reach</span>
                    <span className="font-serif text-lg text-orange-400">+89%</span>
                  </div>
                  <div className="h-2 bg-emerald-900/30 rounded-full overflow-hidden">
                    <div className="h-full w-[65%] bg-gradient-to-r from-orange-600 to-orange-400 rounded-full" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-sans text-sm text-emerald-100/40">Time Saved</span>
                    <span className="font-serif text-lg text-amber-300">12h/week</span>
                  </div>
                  <div className="h-2 bg-emerald-900/30 rounded-full overflow-hidden">
                    <div className="h-full w-[50%] bg-gradient-to-r from-amber-600 to-amber-400 rounded-full" />
                  </div>
                </div>
              </NatureCard>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24">
        <div className="mx-auto max-w-6xl px-8">
          <div className="text-center mb-16">
            <p className="font-sans text-sm text-emerald-500 uppercase tracking-wider mb-4">Features</p>
            <h2 className="font-serif text-4xl md:text-5xl font-semibold text-emerald-50 mb-6">
              Tools that <span className="text-emerald-400">nurture</span> growth
            </h2>
            <p className="font-sans text-emerald-100/50 max-w-2xl mx-auto">
              Everything you need to cultivate a thriving social presence, designed with care.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="mx-auto max-w-4xl px-8">
          <NatureCard className="p-12 md:p-16 text-center relative overflow-hidden" variant="elevated">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-600/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-orange-600/5 rounded-full blur-3xl" />
            
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-600/30 to-emerald-800/20 flex items-center justify-center mx-auto mb-8 border border-emerald-700/30">
                <Sprout className="w-9 h-9 text-emerald-400" />
              </div>
              
              <h2 className="font-serif text-3xl md:text-4xl font-semibold text-emerald-50 mb-6">
                Ready to <span className="text-emerald-400">grow</span>?
              </h2>
              <p className="font-sans text-emerald-100/50 max-w-lg mx-auto mb-10">
                Join thousands of mindful brands who are cultivating authentic 
                connections with their audience.
              </p>
              <Link to="/dashboard">
                <Button 
                  size="lg" 
                  className="h-14 px-10 font-sans bg-emerald-600 hover:bg-emerald-500 text-white border-0 rounded-full text-base"
                >
                  Start Growing Today
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </NatureCard>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-emerald-900/30">
        <div className="mx-auto max-w-6xl px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center">
                <Sprout className="w-4 h-4 text-emerald-100" />
              </div>
              <span className="font-serif text-lg">Heimdall</span>
            </div>
            <p className="font-sans text-sm text-emerald-100/30">
              © {new Date().getFullYear()} Heimdall. Nurturing digital presence.
            </p>
            <div className="flex items-center gap-8">
              <a href="#" className="font-sans text-sm text-emerald-100/30 hover:text-emerald-400 transition-colors">Privacy</a>
              <a href="#" className="font-sans text-sm text-emerald-100/30 hover:text-emerald-400 transition-colors">Terms</a>
              <a href="http://localhost:8080/reference" target="_blank" rel="noopener noreferrer" className="font-sans text-sm text-emerald-100/30 hover:text-emerald-400 transition-colors">API</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
