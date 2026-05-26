// Icon names are strings here so this module can be imported from server
// components and the data freely passed across the server/client boundary.
// Client components resolve the strings back to Lucide components.

export type IconName =
  | "Activity"
  | "BarChart3"
  | "Calendar"
  | "Camera"
  | "Cast"
  | "Cloud"
  | "Globe"
  | "Headphones"
  | "MessageSquare"
  | "MonitorPlay"
  | "Radio"
  | "Smartphone"
  | "Sparkles"
  | "Tv"
  | "Users"
  | "Zap";

export interface Feature {
  icon: IconName;
  title: string;
  description: string;
  highlight?: boolean;
}

export const FEATURES: Feature[] = [
  {
    icon: "Headphones",
    title: "Audio livestreaming",
    description:
      "Crystal-clear AAC over RTMP with sub-3-second HLS playback. Perfect for podcasts, radio, and church services.",
    highlight: true,
  },
  {
    icon: "MonitorPlay",
    title: "HD video streaming",
    description:
      "Multi-bitrate H.264 with hardware encoding on NVIDIA, Apple, and AMD. Stream at 1080p60 without breaking a sweat.",
  },
  {
    icon: "Smartphone",
    title: "Wireless webcam",
    description:
      "Turn your phone into a wireless 4K camera via the Echo Live mobile app. No capture card, no cables.",
  },
  {
    icon: "Cast",
    title: "Remote device control",
    description:
      "Pair your phone as a director's remote — switch scenes, mute mics, fire alerts, all without touching the desktop.",
  },
  {
    icon: "Tv",
    title: "Multi-camera support",
    description:
      "Composite multiple webcams, screen shares, and capture devices into a single scene with smooth transitions.",
  },
  {
    icon: "Cast",
    title: "Screen sharing",
    description:
      "Capture entire displays, specific windows, or browser tabs — with full ScreenCaptureKit on macOS.",
  },
  {
    icon: "Calendar",
    title: "Stream scheduling",
    description:
      "Schedule upcoming broadcasts with title, cover art, and notify-me reminders for followers.",
  },
  {
    icon: "MessageSquare",
    title: "Live chat",
    description:
      "Real-time chat moderated by Convex. Sub-50ms message fan-out across thousands of viewers.",
  },
  {
    icon: "BarChart3",
    title: "Analytics",
    description:
      "See concurrent listeners, peak audience, chat volume, and average watch time — live and historical.",
  },
  {
    icon: "Cloud",
    title: "Cloud recordings",
    description:
      "Every stream auto-records to Cloudflare R2. Trim, clip, and publish replays without re-encoding.",
  },
  {
    icon: "Users",
    title: "Team collaboration",
    description:
      "Multi-user organisations with roles. Invite producers, moderators, and guests with a single email.",
  },
  {
    icon: "Zap",
    title: "Low-latency streaming",
    description:
      "WebRTC-grade latency under 1 second for interactive shows. Switch back to HLS for scale.",
  },
  {
    icon: "Smartphone",
    title: "Mobile streaming",
    description:
      "Go live directly from your phone with the Echo Live mobile app — vertical or landscape.",
  },
  {
    icon: "Globe",
    title: "Cross-platform",
    description:
      "Native desktop builds for macOS, Windows, and Linux. Mobile apps for iOS and Android.",
  },
  {
    icon: "Radio",
    title: "Multistream",
    description:
      "Send a single stream to Twitch, YouTube, X, and Echo Live simultaneously without re-encoding.",
  },
  {
    icon: "Sparkles",
    title: "Audio mastering",
    description:
      "Built-in noise reduction, compressor, and parametric EQ. Sound like a studio without a studio.",
  },
];

export interface PricingPlan {
  name: string;
  tagline: string;
  monthly: number;
  yearly: number;
  features: string[];
  highlight?: boolean;
  cta: string;
}

export const PRICING: PricingPlan[] = [
  {
    name: "Creator",
    tagline: "For solo broadcasters and podcasters.",
    monthly: 10,
    yearly: 96, // ~20% off
    features: [
      "Audio livestreaming",
      "Basic analytics",
      "Mobile streaming",
      "Stream scheduling",
      "Up to 2 guests",
      "10 hours cloud recording / month",
    ],
    cta: "Start Creator",
  },
  {
    name: "Studio",
    tagline: "For full video productions.",
    monthly: 20,
    yearly: 192,
    features: [
      "Everything in Creator",
      "HD video livestreaming",
      "Multi-camera support",
      "Screen sharing",
      "Remove Echo Live branding",
      "Advanced analytics",
      "Priority support",
    ],
    cta: "Start Studio",
  },
  {
    name: "Producer",
    tagline: "For teams running live shows.",
    monthly: 30,
    yearly: 288,
    highlight: true,
    features: [
      "Everything in Studio",
      "Remote device control",
      "Echo Live mobile webcam",
      "Wireless multi-cam",
      "Team collaboration",
      "Remote production dashboard",
      "Highest video quality (1080p60)",
      "Unlimited cloud recording",
    ],
    cta: "Start Producer",
  },
];

export interface ScreenshotCard {
  src: string;
  alt: string;
  caption: string;
}

export const SCREENSHOTS: ScreenshotCard[] = [
  {
    src: "/echolive-studio.png",
    alt: "Echo Live studio with scene controls and audio mixer",
    caption: "The studio — your production cockpit",
  },
  {
    src: "/echolive-dashboard.png",
    alt: "Echo Live dashboard showing analytics and live streams",
    caption: "Dashboard — see everything at a glance",
  },
  {
    src: "/echolive-stream.png",
    alt: "Echo Live stream view with chat and audience",
    caption: "Streams — manage chat, audience, alerts",
  },
  {
    src: "/echolive-eq.png",
    alt: "Audio mastering panel with parametric EQ and noise reduction",
    caption: "Mastering — studio audio out of the box",
  },
  {
    src: "/echolive-schedule.png",
    alt: "Schedule view with upcoming streams",
    caption: "Schedule — plan your week of broadcasts",
  },
];

export interface TrustBadge {
  icon: IconName;
  label: string;
}

export const TRUST_BADGES: TrustBadge[] = [
  { icon: "Zap", label: "Sub-second latency" },
  { icon: "MonitorPlay", label: "1080p60 HD" },
  { icon: "Cast", label: "Remote control" },
  { icon: "Activity", label: "Built for scale" },
];
