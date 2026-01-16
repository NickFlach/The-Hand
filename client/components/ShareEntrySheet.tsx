import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { Colors, Spacing, Typography, BorderRadius } from "@/constants/theme";
import { TrustedContact } from "@/types/entry";
import { getActiveTrustedContacts, shareEntry } from "@/lib/storage";

interface ShareEntrySheetProps {
  visible: boolean;
  entryId: string;
  onClose: () => void;
  onShared: () => void;
}

type Step = "select" | "reason";

export default function ShareEntrySheet({
  visible,
  entryId,
  onClose,
  onShared,
}: ShareEntrySheetProps) {
  const insets = useSafeAreaInsets();
  const [contacts, setContacts] = useState<TrustedContact[]>([]);
  const [step, setStep] = useState<Step>("select");
  const [selectedContact, setSelectedContact] = useState<TrustedContact | null>(null);
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (visible) {
      loadContacts();
      setStep("select");
      setSelectedContact(null);
      setReason("");
    }
  }, [visible]);

  const loadContacts = async () => {
    const data = await getActiveTrustedContacts();
    setContacts(data);
  };

  const handleSelectContact = (contact: TrustedContact) => {
    setSelectedContact(contact);
    setStep("reason");
  };

  const handleShare = async () => {
    if (!selectedContact || !reason.trim()) return;

    await shareEntry(entryId, selectedContact.id, reason);
    onShared();
    onClose();
  };

  const handleBack = () => {
    setStep("select");
    setSelectedContact(null);
    setReason("");
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.overlay}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View
          style={[
            styles.sheet,
            { paddingBottom: insets.bottom + Spacing.lg },
          ]}
        >
          <View style={styles.handle} />

          {step === "select" ? (
            <>
              <View style={styles.header}>
                <Text style={styles.title}>Share with Trusted Hand</Text>
                <Pressable onPress={onClose} style={styles.closeButton}>
                  <Feather name="x" size={24} color={Colors.textPrimary} />
                </Pressable>
              </View>

              <Text style={styles.subtitle}>
                Choose one person to witness this entry.
              </Text>

              {contacts.length > 0 ? (
                <ScrollView style={styles.contactsList}>
                  {contacts.map((contact) => (
                    <Pressable
                      key={contact.id}
                      style={styles.contactRow}
                      onPress={() => handleSelectContact(contact)}
                      testID={`button-select-contact-${contact.id}`}
                    >
                      <View style={styles.contactInfo}>
                        <Text style={styles.contactName}>
                          {contact.displayName}
                        </Text>
                        <Text style={styles.contactMethod}>
                          {contact.contactMethod}
                        </Text>
                      </View>
                      <Feather
                        name="chevron-right"
                        size={20}
                        color={Colors.textSecondary}
                      />
                    </Pressable>
                  ))}
                </ScrollView>
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>
                    No trusted hands added yet.
                  </Text>
                  <Text style={styles.emptyHint}>
                    Add trusted hands in Settings to share entries.
                  </Text>
                </View>
              )}
            </>
          ) : (
            <>
              <View style={styles.header}>
                <Pressable onPress={handleBack} style={styles.backButton}>
                  <Feather name="arrow-left" size={24} color={Colors.textPrimary} />
                </Pressable>
                <Text style={styles.title}>Why are you sharing this?</Text>
                <View style={styles.spacer} />
              </View>

              <Text style={styles.subtitle}>
                Sharing with {selectedContact?.displayName}
              </Text>

              <View style={styles.reasonSection}>
                <TextInput
                  style={styles.reasonInput}
                  placeholder="Your reason for sharing..."
                  placeholderTextColor={Colors.textSecondary}
                  value={reason}
                  onChangeText={setReason}
                  multiline
                  numberOfLines={4}
                  maxLength={200}
                  autoFocus
                  testID="input-share-reason"
                />
                <Text style={styles.charCount}>{reason.length}/200</Text>
              </View>

              <View style={styles.frictionNotice}>
                <Text style={styles.frictionText}>
                  This share is intentional. There are no quick-share options.
                </Text>
              </View>

              <Pressable
                style={[
                  styles.shareButton,
                  !reason.trim() && styles.shareButtonDisabled,
                ]}
                onPress={handleShare}
                disabled={!reason.trim()}
                testID="button-confirm-share"
              >
                <Text style={styles.shareButtonText}>Share Entry</Text>
              </Pressable>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  sheet: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    maxHeight: "80%",
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: Colors.divider,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: Spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.subtitle,
    fontFamily: Typography.fontRegular,
    color: Colors.textPrimary,
    flex: 1,
    textAlign: "center",
  },
  closeButton: {
    padding: Spacing.xs,
  },
  backButton: {
    padding: Spacing.xs,
  },
  spacer: {
    width: 32,
  },
  subtitle: {
    fontSize: Typography.body,
    fontFamily: Typography.fontRegular,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  contactsList: {
    maxHeight: 300,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: Typography.body,
    fontFamily: Typography.fontRegular,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  contactMethod: {
    fontSize: Typography.caption,
    fontFamily: Typography.fontRegular,
    color: Colors.textSecondary,
  },
  emptyState: {
    paddingVertical: Spacing.xl,
    alignItems: "center",
  },
  emptyText: {
    fontSize: Typography.body,
    fontFamily: Typography.fontRegular,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  emptyHint: {
    fontSize: Typography.caption,
    fontFamily: Typography.fontRegular,
    color: Colors.textSecondary,
  },
  reasonSection: {
    marginBottom: Spacing.lg,
  },
  reasonInput: {
    fontSize: Typography.body,
    fontFamily: Typography.fontRegular,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.divider,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    minHeight: 100,
    textAlignVertical: "top",
  },
  charCount: {
    fontSize: Typography.caption,
    fontFamily: Typography.fontRegular,
    color: Colors.textSecondary,
    textAlign: "right",
    marginTop: Spacing.xs,
  },
  frictionNotice: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.lg,
  },
  frictionText: {
    fontSize: Typography.caption,
    fontFamily: Typography.fontRegular,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  shareButton: {
    backgroundColor: Colors.textPrimary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  shareButtonDisabled: {
    opacity: 0.4,
  },
  shareButtonText: {
    fontSize: Typography.body,
    fontFamily: Typography.fontRegular,
    color: Colors.background,
  },
});
