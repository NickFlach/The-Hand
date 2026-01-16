export type EntryType = "built" | "helped" | "learned";

export interface Addendum {
  id: string;
  content: string;
  createdAt: string;
}

export interface Attachment {
  id: string;
  filename: string;
  mimeType: string;
  localUri: string;
  createdAt: string;
}

export interface Entry {
  id: string;
  type: EntryType;
  affected: string;
  cost: string;
  reflection: string;
  themes?: string[];
  attachments?: Attachment[];
  createdAt: string;
  updatedAt: string;
  addenda: Addendum[];
}

export interface EntryFormData {
  type: EntryType;
  affected: string;
  cost: string;
  reflection: string;
  themes?: string[];
}

export interface ReviewNote {
  id: string;
  rangeDays: number;
  createdAt: string;
  text: string;
}

export interface ResponsibilityThread {
  id: string;
  title: string;
  createdAt: string;
  closedAt?: string;
}

export interface EntryThreadLink {
  entryId: string;
  threadId: string;
}

export interface TrustedContact {
  id: string;
  displayName: string;
  contactMethod: string;
}

export interface PatternData {
  period: string;
  built: number;
  helped: number;
  learned: number;
  total: number;
}

export interface ArchiveMonth {
  year: number;
  month: number;
  label: string;
  entries: Entry[];
}

export interface ArchiveYear {
  year: number;
  months: ArchiveMonth[];
}
