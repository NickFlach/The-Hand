import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors, Spacing, Typography, BorderRadius } from "@/constants/theme";
import { SharedEntry, TrustedContact, TrustedNote } from "@/types/entry";
import {
  getSharesForEntry,
  getTrustedContact,
  getNoteForSharedEntry,
  formatRelativeTime,
} from "@/lib/storage";

interface WitnessNotesProps {
  entryId: string;
}

interface ShareWithNote {
  share: SharedEntry;
  contact: TrustedContact | null;
  note: TrustedNote | null;
}

export default function WitnessNotes({ entryId }: WitnessNotesProps) {
  const [sharesWithNotes, setSharesWithNotes] = useState<ShareWithNote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [entryId]);

  const loadData = async () => {
    const shares = await getSharesForEntry(entryId);
    const data: ShareWithNote[] = [];

    for (const share of shares) {
      const contact = await getTrustedContact(share.trustedContactId);
      const note = await getNoteForSharedEntry(share.id);
      data.push({ share, contact, note });
    }

    setSharesWithNotes(data);
    setLoading(false);
  };

  if (loading || sharesWithNotes.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionLabel}>SHARED</Text>

      {sharesWithNotes.map(({ share, contact, note }) => (
        <View key={share.id} style={styles.shareCard}>
          <View style={styles.shareHeader}>
            <Text style={styles.contactName}>
              {contact?.displayName || "Unknown"}
            </Text>
            <Text style={styles.shareDate}>
              {formatRelativeTime(share.createdAt)}
            </Text>
          </View>

          <View style={styles.reasonBox}>
            <Text style={styles.reasonLabel}>Reason for sharing:</Text>
            <Text style={styles.reasonText}>{share.reason}</Text>
          </View>

          {note ? (
            <View style={styles.noteBox}>
              <Text style={styles.noteLabel}>Witness note:</Text>
              <Text style={styles.noteText}>{note.text}</Text>
            </View>
          ) : (
            <View style={styles.pendingBox}>
              <Text style={styles.pendingText}>
                Awaiting witness.
              </Text>
            </View>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.lg,
  },
  sectionLabel: {
    fontSize: Typography.caption,
    fontFamily: Typography.fontRegular,
    color: Colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: Spacing.md,
  },
  shareCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  shareHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  contactName: {
    fontSize: Typography.body,
    fontFamily: Typography.fontRegular,
    color: Colors.textPrimary,
  },
  shareDate: {
    fontSize: Typography.caption,
    fontFamily: Typography.fontRegular,
    color: Colors.textSecondary,
  },
  reasonBox: {
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  reasonLabel: {
    fontSize: Typography.caption,
    fontFamily: Typography.fontRegular,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  reasonText: {
    fontSize: Typography.body,
    fontFamily: Typography.fontRegular,
    color: Colors.textPrimary,
    fontStyle: "italic",
  },
  noteBox: {
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  noteLabel: {
    fontSize: Typography.caption,
    fontFamily: Typography.fontRegular,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  noteText: {
    fontSize: Typography.body,
    fontFamily: Typography.fontRegular,
    color: Colors.textPrimary,
  },
  pendingBox: {
    marginTop: Spacing.sm,
  },
  pendingText: {
    fontSize: Typography.caption,
    fontFamily: Typography.fontRegular,
    color: Colors.textSecondary,
    fontStyle: "italic",
  },
});
