export type EntryType = "built" | "helped" | "learned";

export interface Addendum {
  id: string;
  content: string;
  createdAt: string;
}

export interface Entry {
  id: string;
  type: EntryType;
  affected: string;
  cost: string;
  reflection: string;
  createdAt: string;
  updatedAt: string;
  addenda: Addendum[];
}

export interface EntryFormData {
  type: EntryType;
  affected: string;
  cost: string;
  reflection: string;
}
