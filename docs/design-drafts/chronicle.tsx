/**
 * CHRONICLE - Timeline & History Theme
 * 
 * Design Philosophy: Your social story, documented. Chapters of growth, pages of engagement.
 * 
 * Brand Identity:
 * - Aged paper (#faf8f5) as primary canvas
 * - Deep ink (#1a1a1a) for contrast
 * - Burgundy (#8b2635) as signature accent
 * - Sepia tones for vintage warmth
 * - Timeline dots and chapter markers
 * 
 * Typography: Playfair Display (elegant serif headlines) + Source Serif 4 (readable body)
 * Signature: Timeline visualizations, chapter numbering, manuscript aesthetics
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  RiBookOpenLine,
  RiQuillPenLine,
  RiTimeLine,
  RiLineChartLine,
  RiTeamLine,
  RiArchiveLine,
  RiArrowRightLine,
  RiCheckLine,
  RiStarFill,
  RiAddLine,
  RiSubtractLine,
  RiTwitterXLine,
  RiInstagramLine,
  RiLinkedinBoxLine,
  RiBookmarkLine,
  RiHistoryLine,
} from "@remixicon/react";

// === COMPONENTS ===

// Timeline dot marker
function TimelineDot({ active = false, size = "md" }: { active?: boolean; size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  };

  return (
    <div className={`${sizes[size]} rounded-full border-2 ${
      active ? "bg-[#8b2635] border-[#8b2635]" : "bg-transparent border-[#8b2635]/30"
    }`} />
  );
}

// Chapter number badge
function ChapterBadge({ number }: { number: string }) {
  return (
    <div className="inline-flex items-center gap-2">
      <span className="font-['Playfair_Display',serif] text-xs tracking-[0.3em] text-[#8b2635] uppercase">
        Chapter {number}
      </span>
      <div className="w-12 h-px bg-[#8b2635]/30" />
    </div>
  );
}

// Manuscript card
function ManuscriptCard({
  children,
  className = "",
  variant = "default",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "highlighted" | "aged";
}) {
  const variants = {
    default: "bg-white border border-[#e8e4dc] shadow-sm",
    highlighted: "bg-[#8b2635]/5 border border-[#8b2635]/20",
    aged: "bg-[#f5f0e6] border border-[#d4cfc0]",
  };

  return (
    <div className={`rounded-sm ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
}

// Decorative divider
function ChapterDivider() {
  return (
    <div className="flex items-center justify-center gap-4 py-8">
      <div className="w-24 h-px bg-gradient-to-r from-transparent to-[#8b2635]/20" />
      <div className="w-1.5 h-1.5 rotate-45 border border-[#8b2635]/30" />
      <div className="w-24 h-px bg-gradient-to-l from-transparent to-[#8b2635]/20" />
    </div>
  );
}

// Section heading
function SectionHeading({
  chapter,
  title,
  subtitle,
}: {
  chapter: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="text-center mb-16">
      <ChapterBadge number={chapter} />
      <h2 className="font-['Playfair_Display',serif] text-4xl md:text-5xl text-[#1a1a1a] mt-4 mb-4">
        {title}
      </h2>
      {subtitle && (
        <p className="font-['Source_Serif_4',serif] text-lg text-[#1a1a1a]/60 max-w-2xl mx-auto italic">
          {subtitle}
        </p>
      )}
    </div>
  );
}

// Feature card with timeline marker
function FeatureCard({
  icon: Icon,
  title,
  description,
  isLast = false,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  isLast?: boolean;
}) {
  return (
    <div className="flex gap-6">
      {/* Timeline */}
      <div className="flex flex-col items-center">
        <TimelineDot active />
        {!isLast && <div className="flex-1 w-px bg-[#8b2635]/20 my-2" />}
      </div>
      
      {/* Content */}
      <ManuscriptCard variant="default" className="flex-1 p-6 mb-4">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded bg-[#8b2635]/5 flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5 text-[#8b2635]" />
          </div>
          <div>
            <h3 className="font-['Playfair_Display',serif] text-xl text-[#1a1a1a] mb-2">{title}</h3>
            <p className="font-['Source_Serif_4',serif] text-[#1a1a1a]/60 leading-relaxed">{description}</p>
          </div>
        </div>
      </ManuscriptCard>
    </div>
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
  edition,
}: {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  edition: string;
}) {
  return (
    <ManuscriptCard
      variant={isPopular ? "highlighted" : "default"}
      className={`p-8 relative ${isPopular ? "ring-1 ring-[#8b2635]/30" : ""}`}
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#8b2635] text-white text-xs font-medium tracking-wider uppercase">
          Recommended
        </div>
      )}
      
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-['Playfair_Display',serif] text-2xl text-[#1a1a1a]">{name}</h3>
        <span className="font-mono text-xs text-[#8b2635]/60 tracking-wider">{edition}</span>
      </div>
      
      <p className="font-['Source_Serif_4',serif] text-sm text-[#1a1a1a]/50 mb-6 italic">{description}</p>
      
      <div className="mb-8">
        <span className="font-['Playfair_Display',serif] text-5xl text-[#1a1a1a]">{price}</span>
        <span className="font-['Source_Serif_4',serif] text-[#1a1a1a]/50 ml-2">/{period}</span>
      </div>
      
      <ul className="space-y-3 mb-8">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-3">
            <RiCheckLine className="w-5 h-5 text-[#8b2635] mt-0.5 shrink-0" />
            <span className="font-['Source_Serif_4',serif] text-[#1a1a1a]/80">{feature}</span>
          </li>
        ))}
      </ul>
      
      <Button
        className={`w-full h-12 ${
          isPopular
            ? "bg-[#8b2635] hover:bg-[#701e2b] text-white"
            : "bg-transparent border border-[#8b2635]/30 text-[#8b2635] hover:bg-[#8b2635]/5"
        }`}
      >
        Begin Your Story
      </Button>
    </ManuscriptCard>
  );
}

// Testimonial quote
function TestimonialQuote({
  quote,
  author,
  role,
  page,
}: {
  quote: string;
  author: string;
  role: string;
  page: string;
}) {
  return (
    <ManuscriptCard variant="aged" className="p-8 relative">
      {/* Quote mark */}
      <div className="absolute top-4 left-6 font-['Playfair_Display',serif] text-6xl text-[#8b2635]/10 leading-none">
        "
      </div>
      
      <div className="relative">
        <blockquote className="font-['Source_Serif_4',serif] text-xl text-[#1a1a1a]/80 italic leading-relaxed mb-6 pl-4">
          {quote}
        </blockquote>
        
        <div className="flex items-center justify-between">
          <div>
            <div className="font-['Playfair_Display',serif] text-[#1a1a1a]">{author}</div>
            <div className="font-['Source_Serif_4',serif] text-sm text-[#1a1a1a]/50 italic">{role}</div>
          </div>
          <span className="font-mono text-xs text-[#8b2635]/40">p. {page}</span>
        </div>
      </div>
    </ManuscriptCard>
  );
}

// FAQ Accordion (annotated style)
function FaqItem({
  question,
  answer,
  isOpen,
  onToggle,
  annotation,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
  annotation: string;
}) {
  return (
    <div className="border-b border-[#e8e4dc] last:border-0">
      <button
        onClick={onToggle}
        className="w-full py-6 flex items-start justify-between text-left group"
      >
        <div className="flex items-start gap-4">
          <span className="font-mono text-xs text-[#8b2635]/40 mt-1">{annotation}</span>
          <span className="font-['Playfair_Display',serif] text-xl text-[#1a1a1a] group-hover:text-[#8b2635] transition-colors">
            {question}
          </span>
        </div>
        <div className={`shrink-0 mt-1 transition-transform ${isOpen ? "rotate-45" : ""}`}>
          <RiAddLine className={`w-5 h-5 ${isOpen ? "text-[#8b2635]" : "text-[#1a1a1a]/30"}`} />
        </div>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-96 pb-6" : "max-h-0"}`}>
        <div className="pl-12">
          <p className="font-['Source_Serif_4',serif] text-[#1a1a1a]/60 leading-relaxed">{answer}</p>
        </div>
      </div>
    </div>
  );
}

// Stat display with vintage styling
function StatBlock({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center p-6">
      <div className="font-['Playfair_Display',serif] text-4xl md:text-5xl text-[#8b2635] mb-2">{value}</div>
      <div className="font-['Source_Serif_4',serif] text-sm text-[#1a1a1a]/50 italic">{label}</div>
    </div>
  );
}

// Integration listing
function IntegrationRow({ platforms }: { platforms: string[] }) {
  return (
    <div className="flex flex-wrap justify-center gap-4">
      {platforms.map((platform) => (
        <div
          key={platform}
          className="px-4 py-2 bg-white border border-[#e8e4dc] text-[#1a1a1a]/70 font-['Source_Serif_4',serif] text-sm"
        >
          {platform}
        </div>
      ))}
    </div>
  );
}

// === MAIN COMPONENT ===
export function MarketingChronicle() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  const features = [
    { icon: RiBookOpenLine, title: "The Content Library", description: "Every post, every story, every milestone – catalogued and searchable. Your brand's complete narrative at your fingertips." },
    { icon: RiQuillPenLine, title: "The Composer", description: "Craft your messages with precision. Our editor supports rich formatting, media embeds, and collaborative annotations." },
    { icon: RiTimeLine, title: "The Timeline", description: "Visualize your entire content calendar as a living timeline. See how your story unfolds across weeks and months." },
    { icon: RiLineChartLine, title: "The Analytics Chronicle", description: "Every metric tells a story. Track your growth narrative with beautiful, insightful visualizations." },
    { icon: RiTeamLine, title: "The Scribe's Guild", description: "Collaborate with your team like master chroniclers. Assign chapters, review drafts, approve final manuscripts." },
    { icon: RiArchiveLine, title: "The Archive", description: "Nothing is ever lost. Every version, every edit, every published piece – preserved for posterity." },
  ];

  const testimonials = [
    { quote: "Heimdall helped us write our brand's most successful chapter yet. Our engagement story has never been more compelling.", author: "Margaret Liu", role: "Director of Brand, Heritage Media", page: "127" },
    { quote: "The timeline view changed everything. We finally see our content as part of a larger narrative, not isolated posts.", author: "Thomas Whitmore", role: "Content Strategist, Chronicle Inc.", page: "243" },
    { quote: "A beautifully crafted tool that respects the art of storytelling while delivering powerful results.", author: "Isabella Chen", role: "Head of Social, Manuscript Digital", page: "89" },
  ];

  const pricing = [
    { name: "First Draft", price: "$29", period: "month", description: "For individual storytellers beginning their journey", features: ["3 publishing channels", "100 scheduled entries", "Basic chronicle analytics", "Email correspondence"], edition: "Vol. I" },
    { name: "Published", price: "$79", period: "month", description: "For established voices and growing teams", features: ["15 publishing channels", "Unlimited entries", "Advanced analytics", "Guild collaboration (5 scribes)", "Priority support", "AI writing assistant"], isPopular: true, edition: "Vol. II" },
    { name: "Archive", price: "$199", period: "month", description: "For institutions preserving vast stories", features: ["Unlimited channels", "White-label publishing", "Custom integrations", "Dedicated archivist", "Complete audit trail", "API access"], edition: "Vol. III" },
  ];

  const faqs = [
    { question: "How does the content archive work?", answer: "Every piece of content you create is automatically preserved with full version history. You can view, restore, or reference any past entry – nothing is ever truly deleted from your chronicle.", annotation: "§1" },
    { question: "Can I import my existing content history?", answer: "Yes, our migration scribes can import your complete history from most major platforms. Your past chapters become part of your unified story.", annotation: "§2" },
    { question: "What makes the timeline different?", answer: "Unlike simple calendar views, our timeline shows your content as an interconnected narrative. See patterns, plan story arcs, and ensure your brand voice stays consistent across chapters.", annotation: "§3" },
    { question: "How does team collaboration work?", answer: "Assign roles like Editor, Author, and Reviewer. Content flows through your approval process before publication, with every contribution and edit attributed and timestamped.", annotation: "§4" },
    { question: "Is there a trial chapter available?", answer: "Every plan includes a 14-day trial with full access. Write your first chapter with us and see if the story fits.", annotation: "§5" },
  ];

  const integrations = ["X/Twitter", "Instagram", "LinkedIn", "Facebook", "TikTok", "YouTube", "Pinterest", "Threads", "Medium", "Substack", "WordPress", "Ghost"];

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#1a1a1a] font-['Source_Serif_4',serif] relative">
      {/* Subtle paper texture */}
      <div className="fixed inset-0 pointer-events-none opacity-30 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNmNWYwZTYiLz48cmVjdCB3aWR0aD0iMSIgaGVpZ2h0PSIxIiBmaWxsPSIjZThlNGRjIiBvcGFjaXR5PSIwLjEiLz48L3N2Zz4=')]" />
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#faf8f5]/95 backdrop-blur-sm border-b border-[#e8e4dc]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <RiBookOpenLine className="w-6 h-6 text-[#8b2635]" />
            <span className="font-['Playfair_Display',serif] text-xl tracking-wide">HEIMDALL</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-[#1a1a1a]/60 hover:text-[#8b2635] transition-colors">Features</a>
            <a href="#pricing" className="text-sm text-[#1a1a1a]/60 hover:text-[#8b2635] transition-colors">Editions</a>
            <a href="#testimonials" className="text-sm text-[#1a1a1a]/60 hover:text-[#8b2635] transition-colors">Testimonials</a>
            <a href="#faq" className="text-sm text-[#1a1a1a]/60 hover:text-[#8b2635] transition-colors">Reference</a>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="text-[#1a1a1a]/60 hover:text-[#8b2635]">Sign In</Button>
            <Button className="bg-[#8b2635] hover:bg-[#701e2b] text-white">
              Begin Writing
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <ChapterBadge number="Prologue" />
          
          <h1 className="font-['Playfair_Display',serif] text-5xl md:text-7xl text-[#1a1a1a] mt-8 mb-6 leading-[1.1]">
            Your Brand's Story,<br />
            <span className="italic text-[#8b2635]">Beautifully Told</span>
          </h1>
          
          <p className="font-['Source_Serif_4',serif] text-xl text-[#1a1a1a]/60 max-w-2xl mx-auto mb-10 leading-relaxed italic">
            Every post is a page. Every campaign, a chapter. Heimdall helps you craft, 
            schedule, and chronicle your social media story with timeless elegance.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button className="h-14 px-8 text-lg bg-[#8b2635] hover:bg-[#701e2b] text-white">
              Start Your Chronicle
              <RiArrowRightLine className="ml-2 w-5 h-5" />
            </Button>
            <Button variant="ghost" className="h-14 px-8 text-lg text-[#1a1a1a]/60 hover:text-[#8b2635]">
              <RiHistoryLine className="mr-2 w-5 h-5" />
              View Sample Stories
            </Button>
          </div>
          
          {/* Preview card */}
          <ManuscriptCard variant="default" className="max-w-2xl mx-auto p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <TimelineDot active size="lg" />
                <span className="font-['Playfair_Display',serif] text-sm text-[#8b2635]">Today's Chapter</span>
              </div>
              <span className="font-mono text-xs text-[#1a1a1a]/30">March 7, 2026</span>
            </div>
            
            <div className="space-y-4 text-left">
              <div className="flex items-center gap-3">
                <TimelineDot active size="sm" />
                <div className="flex-1 h-10 bg-[#8b2635]/5 rounded flex items-center px-4">
                  <span className="text-sm text-[#1a1a1a]/60">Twitter — Launch announcement (10:00 AM)</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <TimelineDot size="sm" />
                <div className="flex-1 h-10 bg-[#f5f0e6] rounded flex items-center px-4">
                  <span className="text-sm text-[#1a1a1a]/40">Instagram — Behind the scenes (2:00 PM)</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <TimelineDot size="sm" />
                <div className="flex-1 h-10 bg-[#f5f0e6] rounded flex items-center px-4">
                  <span className="text-sm text-[#1a1a1a]/40">LinkedIn — Thought leadership (4:00 PM)</span>
                </div>
              </div>
            </div>
          </ManuscriptCard>
        </div>
      </section>

      <ChapterDivider />

      {/* Stats Section */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatBlock value="30K+" label="Chroniclers" />
            <StatBlock value="5M+" label="Stories Written" />
            <StatBlock value="99.9%" label="Uptime" />
            <StatBlock value="4.9★" label="Rating" />
          </div>
        </div>
      </section>

      <ChapterDivider />

      {/* Features Section */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <SectionHeading
            chapter="I"
            title="The Writer's Toolkit"
            subtitle="Every instrument needed to compose your magnum opus"
          />
          
          <div className="space-y-0">
            {features.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                {...feature}
                isLast={index === features.length - 1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section className="py-24 px-6 bg-[#f5f0e6]">
        <div className="max-w-4xl mx-auto">
          <SectionHeading
            chapter="II"
            title="Publishing Houses"
            subtitle="Distribute your stories across all major channels"
          />
          
          <IntegrationRow platforms={integrations} />
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <SectionHeading
            chapter="III"
            title="Choose Your Edition"
            subtitle="Select the volume that matches your storytelling ambitions"
          />
          
          <div className="grid md:grid-cols-3 gap-8">
            {pricing.map((plan) => (
              <PricingCard key={plan.name} {...plan} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 px-6 bg-[#f5f0e6]">
        <div className="max-w-6xl mx-auto">
          <SectionHeading
            chapter="IV"
            title="Reader Reviews"
            subtitle="Voices from our community of chroniclers"
          />
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <TestimonialQuote key={testimonial.author} {...testimonial} />
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 px-6">
        <div className="max-w-2xl mx-auto">
          <SectionHeading
            chapter="V"
            title="Reference Section"
            subtitle="Answers to frequently posed inquiries"
          />
          
          <ManuscriptCard variant="default" className="p-8">
            {faqs.map((faq, index) => (
              <FaqItem
                key={faq.question}
                {...faq}
                isOpen={openFaq === index}
                onToggle={() => setOpenFaq(openFaq === index ? null : index)}
              />
            ))}
          </ManuscriptCard>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-[#1a1a1a] relative">
        <div className="max-w-2xl mx-auto text-center">
          <RiQuillPenLine className="w-12 h-12 text-[#8b2635] mx-auto mb-6" />
          
          <h2 className="font-['Playfair_Display',serif] text-4xl md:text-5xl text-white mb-6">
            Ready to Begin<br />
            <span className="italic text-[#8b2635]">Your Story?</span>
          </h2>
          
          <p className="font-['Source_Serif_4',serif] text-xl text-white/60 mb-10 italic">
            Join thousands of storytellers crafting their social narratives with Heimdall.
          </p>
          
          <form className="max-w-md mx-auto space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="author-name" className="sr-only">Name</Label>
                <Input
                  id="author-name"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#8b2635]"
                />
              </div>
              <div>
                <Label htmlFor="author-email" className="sr-only">Email</Label>
                <Input
                  id="author-email"
                  type="email"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#8b2635]"
                />
              </div>
            </div>
            <Button className="w-full h-12 bg-[#8b2635] hover:bg-[#701e2b] text-white font-['Source_Serif_4',serif]">
              Begin Your Chronicle
              <RiArrowRightLine className="ml-2" />
            </Button>
          </form>
          
          <p className="mt-4 text-sm text-white/40 font-['Source_Serif_4',serif] italic">
            14-day free trial · No credit card required
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 border-t border-[#e8e4dc]">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <RiBookOpenLine className="w-5 h-5 text-[#8b2635]" />
                <span className="font-['Playfair_Display',serif] text-lg">HEIMDALL</span>
              </div>
              <p className="text-sm text-[#1a1a1a]/50 leading-relaxed italic">
                Where every brand tells its story beautifully.
              </p>
            </div>
            
            <div>
              <h4 className="font-['Playfair_Display',serif] text-[#1a1a1a] mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-[#1a1a1a]/50">
                <li><a href="/features" className="hover:text-[#8b2635] transition-colors">Features</a></li>
                <li><a href="/pricing" className="hover:text-[#8b2635] transition-colors">Editions</a></li>
                <li><a href="/integrations" className="hover:text-[#8b2635] transition-colors">Integrations</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-['Playfair_Display',serif] text-[#1a1a1a] mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-[#1a1a1a]/50">
                <li><a href="/about" className="hover:text-[#8b2635] transition-colors">About</a></li>
                <li><a href="/blog" className="hover:text-[#8b2635] transition-colors">The Journal</a></li>
                <li><a href="/careers" className="hover:text-[#8b2635] transition-colors">Careers</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-['Playfair_Display',serif] text-[#1a1a1a] mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-[#1a1a1a]/50">
                <li><a href="/privacy" className="hover:text-[#8b2635] transition-colors">Privacy</a></li>
                <li><a href="/terms" className="hover:text-[#8b2635] transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-[#e8e4dc] flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-[#1a1a1a]/30 italic">© MMXXVI Heimdall. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <a href="https://x.com" className="text-[#1a1a1a]/30 hover:text-[#8b2635] transition-colors">
                <RiTwitterXLine className="w-5 h-5" />
              </a>
              <a href="https://instagram.com" className="text-[#1a1a1a]/30 hover:text-[#8b2635] transition-colors">
                <RiInstagramLine className="w-5 h-5" />
              </a>
              <a href="https://linkedin.com" className="text-[#1a1a1a]/30 hover:text-[#8b2635] transition-colors">
                <RiLinkedinBoxLine className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default MarketingChronicle;
