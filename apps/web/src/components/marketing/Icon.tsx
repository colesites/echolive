"use client";

import {
  Activity,
  BarChart3,
  Calendar,
  Camera,
  Cast,
  Cloud,
  Globe,
  Headphones,
  type LucideProps,
  MessageSquare,
  MonitorPlay,
  Radio,
  Smartphone,
  Sparkles,
  Tv,
  Users,
  Zap,
} from "lucide-react";
import type { IconName } from "@/lib/marketing-content";

// Single registry maps the string keys we use in serialisable data
// (marketing-content.ts) back to actual icon components — needed because
// React component functions can't cross the server→client boundary.
const REGISTRY: Record<IconName, React.ComponentType<LucideProps>> = {
  Activity,
  BarChart3,
  Calendar,
  Camera,
  Cast,
  Cloud,
  Globe,
  Headphones,
  MessageSquare,
  MonitorPlay,
  Radio,
  Smartphone,
  Sparkles,
  Tv,
  Users,
  Zap,
};

interface IconProps extends LucideProps {
  name: IconName;
}

export function Icon({ name, ...rest }: IconProps) {
  const Cmp = REGISTRY[name];
  if (!Cmp) return null;
  return <Cmp {...rest} />;
}
