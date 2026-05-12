export const APP_NAME = "YowlChat";
export const APP_TAGLINE = "Camera-first social, reimagined for Yowl.";
export const PRIMARY_COLOR = "#A855F7";
export const SECONDARY_COLOR = "#0B0B10";
export const ACCENT_COLOR = "#F7F7F7";

export const BRAND_TERMS = {
  Snap: "Yowl",
  Stories: "Howls",
  Bitmoji: "YowlMoji",
  Spotlight: "Moonlight",
  "Snap Map": "YowlMap",
  Memories: "Echoes",
  Snapscore: "YowlScore",
  Streaks: "Flames",
  Discover: "Explore"
} as const;

export const NAV_ITEMS = [
  { href: "/", label: "Camera", icon: "camera" },
  { href: "/chat", label: "Chat", icon: "message-circle" },
  { href: "/howls", label: "Howls", icon: "sparkles" },
  { href: "/moonlight", label: "Moonlight", icon: "video" },
  { href: "/profile", label: "Profile", icon: "user" },
  { href: "/settings", label: "Settings", icon: "settings" }
] as const;

export const AUTH_ASIDES = [
  "Fast disappearing media",
  "Realtime chat with read receipts",
  "Story rings, streak flames and map presence",
  "Premium motion and discovery"
] as const;

export const CAMERA_FILTERS = [
  "Glow",
  "Noir",
  "Chrome",
  "Sunbeam",
  "Dream",
  "Yowl Pop"
] as const;

export const HOWL_CATEGORIES = [
  "Campus",
  "Music",
  "Sport",
  "Style",
  "Night",
  "AI"
] as const;

export const EXPLORE_TRENDS = [
  "#yowlcore",
  "#moonlightedit",
  "#flamecheck",
  "#glassui",
  "#genzdesign"
] as const;
