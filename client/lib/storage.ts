import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Entry,
  EntryFormData,
  Addendum,
  Attachment,
  ReviewNote,
  PatternData,
  ResponsibilityThread,
  EntryThreadLink,
  ArchiveYear,
  ArchiveMonth,
  TrustedContact,
  SharedEntry,
  TrustedNote,
} from "@/types/entry";

const ENTRIES_KEY = "@thehand_entries";
const SETTINGS_KEY = "@thehand_settings";
const REVIEW_NOTES_KEY = "@thehand_review_notes";
const USER_THEMES_KEY = "@thehand_user_themes";
const THREADS_KEY = "@thehand_threads";
const THREAD_LINKS_KEY = "@thehand_thread_links";
const TRUSTED_CONTACTS_KEY = "@thehand_trusted_contacts";
const SHARED_ENTRIES_KEY = "@thehand_shared_entries";
const TRUSTED_NOTES_KEY = "@thehand_trusted_notes";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// ========== ENTRIES ==========

export async function getEntries(): Promise<Entry[]> {
  try {
    const data = await AsyncStorage.getItem(ENTRIES_KEY);
    if (data) {
      const entries = JSON.parse(data);
      return entries.map((entry: any) => ({
        ...entry,
        themes: entry.themes || [],
        attachments: entry.attachments || [],
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
    attachments: [],
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

export async function addAttachment(
  entryId: string,
  attachment: Omit<Attachment, "id" | "createdAt">
): Promise<Entry | null> {
  const entries = await getEntries();
  const index = entries.findIndex((e) => e.id === entryId);

  if (index === -1) return null;

  const newAttachment: Attachment = {
    id: generateId(),
    ...attachment,
    createdAt: new Date().toISOString(),
  };

  if (!entries[index].attachments) {
    entries[index].attachments = [];
  }

  entries[index].attachments!.push(newAttachment);
  entries[index].updatedAt = new Date().toISOString();

  await AsyncStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
  return entries[index];
}

export async function removeAttachment(
  entryId: string,
  attachmentId: string
): Promise<Entry | null> {
  const entries = await getEntries();
  const index = entries.findIndex((e) => e.id === entryId);

  if (index === -1) return null;

  entries[index].attachments = (entries[index].attachments || []).filter(
    (a) => a.id !== attachmentId
  );
  entries[index].updatedAt = new Date().toISOString();

  await AsyncStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
  return entries[index];
}

export async function deleteEntry(id: string): Promise<boolean> {
  const entries = await getEntries();
  const filtered = entries.filter((e) => e.id !== id);

  if (filtered.length === entries.length) return false;

  await AsyncStorage.setItem(ENTRIES_KEY, JSON.stringify(filtered));

  // Also remove any thread links for this entry
  const links = await getThreadLinks();
  const filteredLinks = links.filter((l) => l.entryId !== id);
  await AsyncStorage.setItem(THREAD_LINKS_KEY, JSON.stringify(filteredLinks));

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

// ========== SETTINGS ==========

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

// ========== EXPORT ==========

export async function exportData(): Promise<string> {
  const entries = await getEntries();
  const threads = await getThreads();
  const links = await getThreadLinks();
  const trustedContacts = await getTrustedContacts();
  const sharedEntries = await getSharedEntries();
  const trustedNotes = await getTrustedNotes();

  return JSON.stringify(
    {
      entries,
      threads,
      threadLinks: links,
      trustedContacts,
      sharedEntries,
      trustedNotes,
      exportedAt: new Date().toISOString(),
      version: "3.0",
    },
    null,
    2
  );
}

export async function exportDataAsText(): Promise<string> {
  const entries = await getEntries();
  const threads = await getThreads();
  const links = await getThreadLinks();
  const trustedContacts = await getTrustedContacts();
  const sharedEntries = await getSharedEntries();
  const trustedNotes = await getTrustedNotes();

  let text = "THE HAND — LEDGER EXPORT\n";
  text += "========================\n";
  text += "This is a record, not an evaluation.\n\n";

  // Threads section
  if (threads.length > 0) {
    text += "RESPONSIBILITY THREADS\n";
    text += "----------------------\n";
    for (const thread of threads) {
      const linkedEntries = links.filter((l) => l.threadId === thread.id).length;
      text += `[${thread.closedAt ? "CLOSED" : "ACTIVE"}] ${thread.title}\n`;
      text += `  Created: ${new Date(thread.createdAt).toLocaleString()}\n`;
      if (thread.closedAt) {
        text += `  Closed: ${new Date(thread.closedAt).toLocaleString()}\n`;
      }
      text += `  Linked entries: ${linkedEntries}\n\n`;
    }
    text += "\n";
  }

  // Entries section
  text += "ENTRIES\n";
  text += "-------\n\n";

  for (const entry of entries) {
    const entryLinks = links.filter((l) => l.entryId === entry.id);
    const linkedThreads = entryLinks
      .map((l) => threads.find((t) => t.id === l.threadId)?.title)
      .filter(Boolean);

    text += `[${entry.type.toUpperCase()}] ${formatRelativeTime(entry.createdAt)}\n`;
    text += `Created: ${new Date(entry.createdAt).toLocaleString()}\n`;
    text += `---\n`;
    text += `Affected: ${entry.affected}\n`;
    text += `Cost: ${entry.cost}\n`;
    text += `Reflection: ${entry.reflection}\n`;

    if (entry.themes && entry.themes.length > 0) {
      text += `Themes: ${entry.themes.join(", ")}\n`;
    }

    if (linkedThreads.length > 0) {
      text += `Responsibilities: ${linkedThreads.join(", ")}\n`;
    }

    if (entry.attachments && entry.attachments.length > 0) {
      text += `Attachments: ${entry.attachments.map((a) => a.filename).join(", ")}\n`;
    }

    if (entry.addenda.length > 0) {
      text += `\nNotes:\n`;
      for (const addendum of entry.addenda) {
        text += `  [${new Date(addendum.createdAt).toLocaleString()}] ${addendum.content}\n`;
      }
    }

    // Shared entries info
    const entryShares = sharedEntries.filter((s) => s.entryId === entry.id);
    if (entryShares.length > 0) {
      text += `\nShared with:\n`;
      for (const share of entryShares) {
        const contact = trustedContacts.find((c) => c.id === share.trustedContactId);
        text += `  [${new Date(share.createdAt).toLocaleString()}] ${contact?.displayName || "Unknown"}\n`;
        text += `    Reason: ${share.reason}\n`;
        const note = trustedNotes.find((n) => n.sharedEntryId === share.id);
        if (note) {
          text += `    Witness note: ${note.text}\n`;
        }
      }
    }

    text += `\n${"=".repeat(40)}\n\n`;
  }

  // Trusted Contacts section
  const activeContacts = trustedContacts.filter((c) => !c.revokedAt);
  if (activeContacts.length > 0) {
    text += "\nTRUSTED HANDS\n";
    text += "-------------\n";
    for (const contact of activeContacts) {
      text += `${contact.displayName} (${contact.contactMethod})\n`;
      text += `  Added: ${new Date(contact.createdAt).toLocaleString()}\n`;
    }
  }

  return text;
}

// ========== USER THEMES ==========

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

// ========== REVIEW NOTES ==========

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

// ========== ENTRIES BY TIME RANGE ==========

export async function getEntriesInRange(days: number): Promise<Entry[]> {
  const entries = await getEntries();
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

  return entries.filter((entry) => {
    const entryDate = new Date(entry.createdAt).getTime();
    return entryDate >= cutoff;
  });
}

// ========== PATTERN DATA ==========

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

// ========== RESPONSIBILITY THREADS ==========

export async function getThreads(): Promise<ResponsibilityThread[]> {
  try {
    const data = await AsyncStorage.getItem(THREADS_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error("Failed to get threads:", error);
    return [];
  }
}

export async function getThread(id: string): Promise<ResponsibilityThread | null> {
  const threads = await getThreads();
  return threads.find((t) => t.id === id) || null;
}

export async function createThread(title: string): Promise<ResponsibilityThread> {
  const threads = await getThreads();
  const newThread: ResponsibilityThread = {
    id: generateId(),
    title: title.trim(),
    createdAt: new Date().toISOString(),
  };

  threads.unshift(newThread);
  await AsyncStorage.setItem(THREADS_KEY, JSON.stringify(threads));
  return newThread;
}

export async function closeThread(id: string): Promise<ResponsibilityThread | null> {
  const threads = await getThreads();
  const index = threads.findIndex((t) => t.id === id);

  if (index === -1) return null;

  threads[index].closedAt = new Date().toISOString();
  await AsyncStorage.setItem(THREADS_KEY, JSON.stringify(threads));
  return threads[index];
}

export async function reopenThread(id: string): Promise<ResponsibilityThread | null> {
  const threads = await getThreads();
  const index = threads.findIndex((t) => t.id === id);

  if (index === -1) return null;

  delete threads[index].closedAt;
  await AsyncStorage.setItem(THREADS_KEY, JSON.stringify(threads));
  return threads[index];
}

// ========== THREAD LINKS ==========

export async function getThreadLinks(): Promise<EntryThreadLink[]> {
  try {
    const data = await AsyncStorage.getItem(THREAD_LINKS_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error("Failed to get thread links:", error);
    return [];
  }
}

export async function linkEntryToThread(
  entryId: string,
  threadId: string
): Promise<EntryThreadLink> {
  const links = await getThreadLinks();

  // Check if link already exists
  const existing = links.find(
    (l) => l.entryId === entryId && l.threadId === threadId
  );
  if (existing) return existing;

  const newLink: EntryThreadLink = {
    entryId,
    threadId,
  };

  links.push(newLink);
  await AsyncStorage.setItem(THREAD_LINKS_KEY, JSON.stringify(links));
  return newLink;
}

export async function unlinkEntryFromThread(
  entryId: string,
  threadId: string
): Promise<boolean> {
  const links = await getThreadLinks();
  const filtered = links.filter(
    (l) => !(l.entryId === entryId && l.threadId === threadId)
  );

  if (filtered.length === links.length) return false;

  await AsyncStorage.setItem(THREAD_LINKS_KEY, JSON.stringify(filtered));
  return true;
}

export async function getLinksForEntry(entryId: string): Promise<EntryThreadLink[]> {
  const links = await getThreadLinks();
  return links.filter((l) => l.entryId === entryId);
}

export async function getLinksForThread(threadId: string): Promise<EntryThreadLink[]> {
  const links = await getThreadLinks();
  return links.filter((l) => l.threadId === threadId);
}

export async function getEntriesForThread(threadId: string): Promise<Entry[]> {
  const links = await getLinksForThread(threadId);
  const entries = await getEntries();
  const entryIds = new Set(links.map((l) => l.entryId));
  return entries.filter((e) => entryIds.has(e.id));
}

// ========== ARCHIVE / LONG-HORIZON VIEW ==========

export async function getArchiveData(): Promise<ArchiveYear[]> {
  const entries = await getEntries();

  // Get date range (from first entry to now)
  const now = new Date();
  let earliestDate = now;

  for (const entry of entries) {
    const date = new Date(entry.createdAt);
    if (date < earliestDate) {
      earliestDate = date;
    }
  }

  // Build archive structure with all months (including empty ones)
  const archiveMap: Map<number, Map<number, Entry[]>> = new Map();

  // Initialize all months from earliest to now
  const startYear = earliestDate.getFullYear();
  const startMonth = earliestDate.getMonth();
  const endYear = now.getFullYear();
  const endMonth = now.getMonth();

  for (let year = startYear; year <= endYear; year++) {
    archiveMap.set(year, new Map());
    const monthStart = year === startYear ? startMonth : 0;
    const monthEnd = year === endYear ? endMonth : 11;

    for (let month = monthStart; month <= monthEnd; month++) {
      archiveMap.get(year)!.set(month, []);
    }
  }

  // Place entries into months
  for (const entry of entries) {
    const date = new Date(entry.createdAt);
    const year = date.getFullYear();
    const month = date.getMonth();

    if (archiveMap.has(year) && archiveMap.get(year)!.has(month)) {
      archiveMap.get(year)!.get(month)!.push(entry);
    }
  }

  // Convert to array format
  const result: ArchiveYear[] = [];

  const sortedYears = Array.from(archiveMap.keys()).sort((a, b) => b - a);

  for (const year of sortedYears) {
    const yearData = archiveMap.get(year)!;
    const months: ArchiveMonth[] = [];

    const sortedMonths = Array.from(yearData.keys()).sort((a, b) => b - a);

    for (const month of sortedMonths) {
      const monthEntries = yearData.get(month)!;
      months.push({
        year,
        month,
        label: new Date(year, month).toLocaleDateString(undefined, {
          month: "long",
        }),
        entries: monthEntries.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ),
      });
    }

    result.push({ year, months });
  }

  return result;
}

// ========== TRUSTED CONTACTS (V3) ==========

const MAX_TRUSTED_CONTACTS = 3;

export async function getTrustedContacts(): Promise<TrustedContact[]> {
  try {
    const data = await AsyncStorage.getItem(TRUSTED_CONTACTS_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error("Failed to get trusted contacts:", error);
    return [];
  }
}

export async function getActiveTrustedContacts(): Promise<TrustedContact[]> {
  const contacts = await getTrustedContacts();
  return contacts.filter((c) => !c.revokedAt);
}

export async function getTrustedContact(id: string): Promise<TrustedContact | null> {
  const contacts = await getTrustedContacts();
  return contacts.find((c) => c.id === id) || null;
}

export async function addTrustedContact(
  displayName: string,
  contactMethod: string
): Promise<TrustedContact | null> {
  const contacts = await getTrustedContacts();
  const activeContacts = contacts.filter((c) => !c.revokedAt);

  if (activeContacts.length >= MAX_TRUSTED_CONTACTS) {
    return null;
  }

  const newContact: TrustedContact = {
    id: generateId(),
    displayName: displayName.trim(),
    contactMethod: contactMethod.trim(),
    createdAt: new Date().toISOString(),
  };

  contacts.push(newContact);
  await AsyncStorage.setItem(TRUSTED_CONTACTS_KEY, JSON.stringify(contacts));
  return newContact;
}

export async function revokeTrustedContact(id: string): Promise<TrustedContact | null> {
  const contacts = await getTrustedContacts();
  const index = contacts.findIndex((c) => c.id === id);

  if (index === -1) return null;

  contacts[index].revokedAt = new Date().toISOString();
  await AsyncStorage.setItem(TRUSTED_CONTACTS_KEY, JSON.stringify(contacts));
  return contacts[index];
}

// ========== SHARED ENTRIES (V3) ==========

export async function getSharedEntries(): Promise<SharedEntry[]> {
  try {
    const data = await AsyncStorage.getItem(SHARED_ENTRIES_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error("Failed to get shared entries:", error);
    return [];
  }
}

export async function getSharedEntry(id: string): Promise<SharedEntry | null> {
  const shares = await getSharedEntries();
  return shares.find((s) => s.id === id) || null;
}

export async function getSharesForEntry(entryId: string): Promise<SharedEntry[]> {
  const shares = await getSharedEntries();
  return shares.filter((s) => s.entryId === entryId);
}

export async function shareEntry(
  entryId: string,
  trustedContactId: string,
  reason: string
): Promise<SharedEntry> {
  const shares = await getSharedEntries();

  const newShare: SharedEntry = {
    id: generateId(),
    entryId,
    trustedContactId,
    reason: reason.trim(),
    createdAt: new Date().toISOString(),
  };

  shares.push(newShare);
  await AsyncStorage.setItem(SHARED_ENTRIES_KEY, JSON.stringify(shares));
  return newShare;
}

// ========== TRUSTED NOTES (V3) ==========

export async function getTrustedNotes(): Promise<TrustedNote[]> {
  try {
    const data = await AsyncStorage.getItem(TRUSTED_NOTES_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error("Failed to get trusted notes:", error);
    return [];
  }
}

export async function getNoteForSharedEntry(sharedEntryId: string): Promise<TrustedNote | null> {
  const notes = await getTrustedNotes();
  return notes.find((n) => n.sharedEntryId === sharedEntryId) || null;
}

export async function getNotesForEntry(entryId: string): Promise<TrustedNote[]> {
  const shares = await getSharesForEntry(entryId);
  const notes = await getTrustedNotes();
  const shareIds = new Set(shares.map((s) => s.id));
  return notes.filter((n) => shareIds.has(n.sharedEntryId));
}

export async function addTrustedNote(
  sharedEntryId: string,
  text: string
): Promise<TrustedNote | null> {
  const notes = await getTrustedNotes();

  // Check if note already exists for this share
  const existing = notes.find((n) => n.sharedEntryId === sharedEntryId);
  if (existing) return null;

  const newNote: TrustedNote = {
    id: generateId(),
    sharedEntryId,
    createdAt: new Date().toISOString(),
    text: text.trim().substring(0, 500),
  };

  notes.push(newNote);
  await AsyncStorage.setItem(TRUSTED_NOTES_KEY, JSON.stringify(notes));
  return newNote;
}
