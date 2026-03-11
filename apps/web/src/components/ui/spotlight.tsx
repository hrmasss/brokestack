"use client";
import {
  createContext,
  useContext,
  useRef,
  useState,
  useEffect,
  type MouseEvent,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

interface MousePosition {
  x: number | null;
  y: number | null;
}

interface SpotLightContextType {
  ProximitySpotlight: boolean;
  HoverFocusSpotlight: boolean;
  CursorFlowGradient: boolean;
}

const SpotLightContext = createContext<SpotLightContextType | undefined>(undefined);

export const useSpotlight = () => {
  const context = useContext(SpotLightContext);
  if (!context) {
    throw new Error("useSpotlight must be used within a SpotlightProvider");
  }
  return context;
};

interface SpotlightProps {
  children: ReactNode;
  className?: string;
  ProximitySpotlight?: boolean;
  HoverFocusSpotlight?: boolean;
  CursorFlowGradient?: boolean;
}

export const Spotlight = ({
  children,
  className,
  ProximitySpotlight = true,
  HoverFocusSpotlight = false,
  CursorFlowGradient = true,
}: SpotlightProps) => {
  return (
    <SpotLightContext.Provider
      value={{
        ProximitySpotlight,
        HoverFocusSpotlight,
        CursorFlowGradient,
      }}
    >
      <div className={cn("group relative z-10 rounded-md", className)}>{children}</div>
    </SpotLightContext.Provider>
  );
};

interface SpotlightItemProps {
  children: ReactNode;
  className?: string;
}

export function SpotLightItem({ children, className }: SpotlightItemProps) {
  const { HoverFocusSpotlight, ProximitySpotlight, CursorFlowGradient } = useSpotlight();
  const boxWrapper = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState<MousePosition>({ x: null, y: null });
  const [overlayColor, setOverlayColor] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updateMousePosition = (ev: globalThis.MouseEvent) => {
      setMousePosition({ x: ev.clientX, y: ev.clientY });
    };
    window.addEventListener("mousemove", updateMousePosition);
    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
    };
  }, []);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const { left, top } = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;
    setOverlayColor({ x, y });
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseEnter={() => CursorFlowGradient && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      ref={boxWrapper}
      className={cn(
        className,
        "relative rounded-xl p-[1px] bg-border/40 overflow-hidden"
      )}
    >
      {isHovered && (
        <div
          className="pointer-events-none absolute opacity-0 z-50 rounded-xl w-full h-full group-hover:opacity-100 transition duration-300"
          style={{
            background: `radial-gradient(250px circle at ${overlayColor.x}px ${overlayColor.y}px, rgba(255, 255, 255, 0.1), transparent 80%)`,
          }}
        />
      )}
      {HoverFocusSpotlight && (
        <div
          className="absolute opacity-0 group-hover:opacity-100 z-10 inset-0 bg-fixed rounded-xl"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255, 255, 255, 0.4) 0%, transparent 20%, transparent) fixed`,
          }}
        />
      )}
      {ProximitySpotlight && (
        <div
          className="absolute inset-0 z-0 bg-fixed rounded-xl"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255, 255, 255, 0.3) 0%, transparent 20%, transparent) fixed`,
          }}
        />
      )}
      {children}
    </div>
  );
}

interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
}

export function SpotlightCard({ children, className = "" }: SpotlightCardProps) {
  return (
    <div
      className={cn(
        "relative h-full bg-card rounded-xl p-px",
        "before:absolute before:w-80 before:h-80 before:-left-40 before:-top-40 before:bg-muted-foreground/20 before:rounded-full before:opacity-0 before:pointer-events-none before:transition-opacity before:duration-500 group-hover:before:opacity-100 before:z-10 before:blur-[100px]",
        "after:absolute after:w-96 after:h-96 after:-left-48 after:-top-48 after:bg-primary/30 after:rounded-full after:opacity-0 after:pointer-events-none after:transition-opacity after:duration-500 hover:after:opacity-10 after:z-30 after:blur-[100px]",
        "overflow-hidden",
        className
      )}
    >
      {children}
    </div>
  );
}
