// Core data model. New item kinds (image, event, vision) can be added to ItemType later.
export type ItemType = "note" | "idea" | "goal" | "checklist" | "calendar" | "text";
export type NoteColor = "yellow" | "lavender" | "blue" | "mint" | "pink";
export type NoteFont = "sans" | "hand" | "marker" | "serif";

export type TextColor = "ink" | "muted" | "accent" | "red";
export const TEXT_COLORS: { id: TextColor; className: string }[] = [
  { id: "ink", className: "text-foreground" },
  { id: "muted", className: "text-muted-foreground" },
  { id: "accent", className: "text-primary" },
  { id: "red", className: "text-destructive" },
];
export const TEXT_SIZES = [14, 18, 24, 36, 48];

export interface CheckItem {
  id: string;
  text: string;
  done: boolean;
}

export interface CanvasItem {
  id: string;
  type: ItemType;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  color: NoteColor;
  font: NoteFont;
  text: string;
  checklist?: CheckItem[] | undefined;
  /** Calendar widgets: shown month/year when not following, plus follow-current-month flag. */
  calMonth?: number | undefined;
  calYear?: number | undefined;
  calFollow?: boolean | undefined;
  /** Free text elements: font size (px) and color token. */
  fontSize?: number | undefined;
  /** Preset id (theme-aware) or a custom hex color. */
  textColor?: TextColor | string | undefined;
  /** Optional background color (hex); transparent when unset. */
  textBg?: string | undefined;
  /** Fixed width set by resizing; text wraps when set. */
  textWidth?: number | undefined;
}

export interface View {
  x: number;
  y: number;
  zoom: number;
}

export interface Settings {
  showGrid: boolean;
  showMinimap: boolean;
}

export const NOTE_COLORS: NoteColor[] = ["yellow", "lavender", "blue", "mint", "pink"];

export const COLOR_CLASS: Record<NoteColor, string> = {
  yellow: "bg-note-yellow",
  lavender: "bg-note-lavender",
  blue: "bg-note-blue",
  mint: "bg-note-mint",
  pink: "bg-note-pink",
};

export const FONTS: { id: NoteFont; label: string; className: string }[] = [
  { id: "sans", label: "Clean", className: "font-sans" },
  { id: "hand", label: "Handwritten", className: "font-hand" },
  { id: "marker", label: "Marker", className: "font-marker" },
  { id: "serif", label: "Serif", className: "font-display" },
];

export const TYPE_DEFAULTS: Record<ItemType, { color: NoteColor; text: string; w: number; h: number }> = {
  note: { color: "yellow", text: "", w: 220, h: 200 },
  idea: { color: "lavender", text: "", w: 220, h: 180 },
  goal: { color: "mint", text: "", w: 240, h: 170 },
  checklist: { color: "blue", text: "To do", w: 250, h: 240 },
  calendar: { color: "yellow", text: "", w: 300, h: 330 },
  text: { color: "yellow", text: "", w: 40, h: 30 },
};

export const uid = () => Math.random().toString(36).slice(2, 10);
