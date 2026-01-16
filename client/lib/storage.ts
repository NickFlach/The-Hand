import AsyncStorage from "@react-native-async-storage/async-storage";
import { Entry, EntryFormData, Addendum, ReviewNote, PatternData } from "@/types/entry";

const ENTRIES_KEY = "@thehand_entries";
const SETTINGS_KEY = "@thehand_settings";
const REVIEW_NOTES_KEY = "@thehand_review_notes";
const USER_THEMES_KEY = "@thehand_user_themes";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export async function getEntries(): Promise<Entry[]> {
  try {
    const data = await AsyncStorage.getItem(ENTRIES_KEY);
    if (data) {
      const entries = JSON.parse(data);
      return entries.map((entry: any) => ({
        ...entry,
        themes: entry.themes || [],
        addenda: entry.addenda || [],
      }));
    }
    return [];
  } catch (error) {
    console.error("Failed to get entries:", error);
    return [];
  }
}

export async function getEntry(id: string): Promise<Entry | null> {
  const entries = await getEntries();
  return entries.find((e) => e.id === id) || null;
}

export async function createEntry(formData: EntryFormData): Promise<Entry> {
  const entries = await getEntries();
  const now = new Date().toISOString();

  const newEntry: Entry = {
    id: generateId(),
    type: formData.type,
    affected: formData.affected,
    cost: formData.cost,
    reflection: formData.reflection,
    themes: formData.themes || [],
    createdAt: now,
    updatedAt: now,
    addenda: [],
  };

  entries.unshift(newEntry);
  await AsyncStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));

  if (newEntry.themes && newEntry.themes.length > 0) {
    await addUserThemes(newEntry.themes);
  }

  return newEntry;
}

export async function updateEntry(
  id: string,
  formData: Partial<EntryFormData>
): Promise<Entry | null> {
  const entries = await getEntries();
  const index = entries.findIndex((e) => e.id === id);

  if (index === -1) return null;

  const entry = entries[index];
  const now = new Date().toISOString();

  entries[index] = {
    ...entry,
    ...formData,
    updatedAt: now,
  };

  await AsyncStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));

  if (formData.themes && formData.themes.length > 0) {
    await addUserThemes(formData.themes);
  }

  return entries[index];
}

export async function addAddendum(
  entryId: string,
  content: string
): Promise<Entry | null> {
  const entries = await getEntries();
  const index = entries.findIndex((e) => e.id === entryId);

  if (index === -1) return null;

  const addendum: Addendum = {
    id: generateId(),
    content,
    createdAt: new Date().toISOString(),
  };

  entries[index].addenda.push(addendum);
  entries[index].updatedAt = new Date().toISOString();

  await AsyncStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
  return entries[index];
}

export async function deleteEntry(id: string): Promise<boolean> {
  const entries = await getEntries();
  const filtered = entries.filter((e) => e.id !== id);

  if (filtered.length === entries.length) return false;

  await AsyncStorage.setItem(ENTRIES_KEY, JSON.stringify(filtered));
  return true;
}

export function isEditable(entry: Entry): boolean {
  const createdAt = new Date(entry.createdAt).getTime();
  const now = Date.now();
  const twentyFourHours = 24 * 60 * 60 * 1000;
  return now - createdAt < twentyFourHours;
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      if (diffMinutes < 1) return "Just now";
      return `${diffMinutes}m ago`;
    }
    return `${diffHours}h ago`;
  }

  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

export interface Settings {
  highContrastMode: boolean;
}

const defaultSettings: Settings = {
  highContrastMode: false,
};

export async function getSettings(): Promise<Settings> {
  try {
    const data = await AsyncStorage.getItem(SETTINGS_KEY);
    if (data) {
      return { ...defaultSettings, ...JSON.parse(data) };
    }
    return defaultSettings;
  } catch (error) {
    console.error("Failed to get settings:", error);
    return defaultSettings;
  }
}

export async function updateSettings(
  settings: Partial<Settings>
): Promise<Settings> {
  const current = await getSettings();
  const updated = { ...current, ...settings };
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  return updated;
}

export async function exportData(): Promise<string> {
  const entries = await getEntries();
  return JSON.stringify(entries, null, 2);
}

export async function exportDataAsText(): Promise<string> {
  const entries = await getEntries();
  let text = "THE HAND — LEDGER EXPORT\n";
  text += "========================\n";
  text += "This is a record. It is not a report card.\n\n";

  for (const entry of entries) {
    text += `[${entry.type.toUpperCase()}] ${formatRelativeTime(entry.createdAt)}\n`;
    text += `Created: ${new Date(entry.createdAt).toLocaleString()}\n`;
    text += `---\n`;
    text += `Affected: ${entry.affected}\n`;
    text += `Cost: ${entry.cost}\n`;
    text += `Reflection: ${entry.reflection}\n`;

    if (entry.themes && entry.themes.length > 0) {
      text += `Themes: ${entry.themes.join(", ")}\n`;
    }

    if (entry.addenda.length > 0) {
      text += `\nNotes:\n`;
      for (const addendum of entry.addenda) {
        text += `  [${new Date(addendum.createdAt).toLocaleString()}] ${addendum.content}\n`;
      }
    }

    text += `\n${"=".repeat(40)}\n\n`;
  }

  return text;
}

export async function getUserThemes(): Promise<string[]> {
  try {
    const data = await AsyncStorage.getItem(USER_THEMES_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error("Failed to get user themes:", error);
    return [];
  }
}

export async function addUserThemes(themes: string[]): Promise<void> {
  const existing = await getUserThemes();
  const combined = [...new Set([...existing, ...themes])];
  await AsyncStorage.setItem(USER_THEMES_KEY, JSON.stringify(combined));
}

export async function getReviewNotes(): Promise<ReviewNote[]> {
  try {
    const data = await AsyncStorage.getItem(REVIEW_NOTES_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error("Failed to get review notes:", error);
    return [];
  }
}

export async function createReviewNote(
  rangeDays: number,
  text: string
): Promise<ReviewNote> {
  const notes = await getReviewNotes();
  const newNote: ReviewNote = {
    id: generateId(),
    rangeDays,
    createdAt: new Date().toISOString(),
    text,
  };

  notes.unshift(newNote);
  await AsyncStorage.setItem(REVIEW_NOTES_KEY, JSON.stringify(notes));
  return newNote;
}

export async function getEntriesInRange(days: number): Promise<Entry[]> {
  const entries = await getEntries();
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

  return entries.filter((entry) => {
    const entryDate = new Date(entry.createdAt).getTime();
    return entryDate >= cutoff;
  });
}

export function calculatePatternData(
  entries: Entry[],
  groupBy: "week" | "month" = "month"
): PatternData[] {
  if (entries.length === 0) return [];

  const groups: Record<string, PatternData> = {};

  for (const entry of entries) {
    const date = new Date(entry.createdAt);
    let period: string;

    if (groupBy === "week") {
      const startOfWeek = new Date(date);
      startOfWeek.setDate(date.getDate() - date.getDay());
      period = startOfWeek.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
    } else {
      period = date.toLocaleDateString(undefined, {
        month: "short",
        year: "2-digit",
      });
    }

    if (!groups[period]) {
      groups[period] = {
        period,
        built: 0,
        helped: 0,
        learned: 0,
        total: 0,
      };
    }

    groups[period][entry.type]++;
    groups[period].total++;
  }

  return Object.values(groups).sort((a, b) => {
    const dateA = new Date(a.period);
    const dateB = new Date(b.period);
    return dateB.getTime() - dateA.getTime();
  });
}
