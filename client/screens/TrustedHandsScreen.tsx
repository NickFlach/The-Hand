import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Modal,
  Platform,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { Colors, Spacing, Typography, BorderRadius } from "@/constants/theme";
import {
  getActiveTrustedContacts,
  addTrustedContact,
  revokeTrustedContact,
} from "@/lib/storage";
import { TrustedContact } from "@/types/entry";

export default function TrustedHandsScreen() {
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const [contacts, setContacts] = useState<TrustedContact[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [contactMethod, setContactMethod] = useState("");
  const [contactToRevoke, setContactToRevoke] = useState<TrustedContact | null>(null);

  const loadContacts = async () => {
    const data = await getActiveTrustedContacts();
    setContacts(data);
  };

  useFocusEffect(
    useCallback(() => {
      loadContacts();
    }, [])
  );

  const handleAddContact = async () => {
    if (!displayName.trim() || !contactMethod.trim()) return;

    const result = await addTrustedContact(displayName, contactMethod);
    if (result) {
      setDisplayName("");
      setContactMethod("");
      setIsAdding(false);
      loadContacts();
    } else {
      if (Platform.OS === "web") {
        window.alert("You may have up to 3 trusted hands at a time.");
      } else {
        Alert.alert(
          "Limit reached",
          "You may have up to 3 trusted hands at a time."
        );
      }
    }
  };

  const handleRevokeContact = (contact: TrustedContact) => {
    setContactToRevoke(contact);
  };

  const confirmRevoke = async () => {
    if (!contactToRevoke) return;
    await revokeTrustedContact(contactToRevoke.id);
    setContactToRevoke(null);
    loadContacts();
  };

  const canAddMore = contacts.length < 3;

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: headerHeight + Spacing.lg,
            paddingBottom: insets.bottom + Spacing.xl,
          },
        ]}
      >
        <View style={styles.descriptionBox}>
          <Text style={styles.description}>
            These are people you trust to witness work, not respond to it.
          </Text>
        </View>

        <View style={styles.limitIndicator}>
          <Text style={styles.limitText}>
            {contacts.length} of 3 trusted hands
          </Text>
        </View>

        {contacts.length > 0 ? (
          <View style={styles.contactsList}>
            {contacts.map((contact) => (
              <View key={contact.id} style={styles.contactCard}>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactName}>{contact.displayName}</Text>
                  <Text style={styles.contactMethod}>{contact.contactMethod}</Text>
                </View>
                <Pressable
                  onPress={() => handleRevokeContact(contact)}
                  style={styles.revokeButton}
                  testID={`button-revoke-${contact.id}`}
                >
                  <Feather name="x" size={18} color={Colors.textSecondary} />
                </Pressable>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No trusted hands added.</Text>
          </View>
        )}

        {isAdding ? (
          <View style={styles.addForm}>
            <Text style={styles.formLabel}>NEW TRUSTED HAND</Text>
            <TextInput
              style={styles.input}
              placeholder="Their name"
              placeholderTextColor={Colors.textSecondary}
              value={displayName}
              onChangeText={setDisplayName}
              autoFocus
              testID="input-display-name"
            />
            <TextInput
              style={styles.input}
              placeholder="How to reach them (email or identifier)"
              placeholderTextColor={Colors.textSecondary}
              value={contactMethod}
              onChangeText={setContactMethod}
              autoCapitalize="none"
              keyboardType="email-address"
              testID="input-contact-method"
            />
            <View style={styles.formButtons}>
              <Pressable
                style={styles.cancelButton}
                onPress={() => {
                  setIsAdding(false);
                  setDisplayName("");
                  setContactMethod("");
                }}
                testID="button-cancel-add"
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.createButton,
                  (!displayName.trim() || !contactMethod.trim()) &&
                    styles.createButtonDisabled,
                ]}
                onPress={handleAddContact}
                disabled={!displayName.trim() || !contactMethod.trim()}
                testID="button-create-contact"
              >
                <Text style={styles.createButtonText}>Add</Text>
              </Pressable>
            </View>
          </View>
        ) : canAddMore ? (
          <Pressable
            style={styles.addButton}
            onPress={() => setIsAdding(true)}
            testID="button-add-trusted-hand"
          >
            <Feather name="plus" size={18} color={Colors.textPrimary} />
            <Text style={styles.addButtonText}>Add trusted hand</Text>
          </Pressable>
        ) : null}

        <View style={styles.noticeBox}>
          <Text style={styles.noticeText}>
            When you share an entry with a trusted hand, they can witness it once.
            They cannot reply, and you will not be notified when they do.
          </Text>
        </View>
      </ScrollView>

      <Modal
        visible={contactToRevoke !== null}
        animationType="fade"
        transparent
        onRequestClose={() => setContactToRevoke(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModal}>
            <Text style={styles.confirmTitle}>Remove trusted hand</Text>
            <Text style={styles.confirmMessage}>
              Remove {contactToRevoke?.displayName}?
            </Text>
            <Text style={styles.confirmWarning}>
              Past shares will remain in your archive but will no longer be accessible to them.
            </Text>
            <View style={styles.confirmButtons}>
              <Pressable
                style={styles.confirmCancelButton}
                onPress={() => setContactToRevoke(null)}
                testID="button-cancel-revoke"
              >
                <Text style={styles.confirmCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={styles.confirmRemoveButton}
                onPress={confirmRevoke}
                testID="button-confirm-revoke"
              >
                <Text style={styles.confirmRemoveText}>Remove</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  descriptionBox: {
    marginBottom: Spacing.xl,
  },
  description: {
    fontSize: Typography.body,
    fontFamily: Typography.fontRegular,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  limitIndicator: {
    marginBottom: Spacing.lg,
  },
  limitText: {
    fontSize: Typography.caption,
    fontFamily: Typography.fontRegular,
    color: Colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  contactsList: {
    marginBottom: Spacing.lg,
  },
  contactCard: {
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
  revokeButton: {
    padding: Spacing.sm,
  },
  emptyState: {
    paddingVertical: Spacing.xl,
  },
  emptyText: {
    fontSize: Typography.body,
    fontFamily: Typography.fontRegular,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  addForm: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  formLabel: {
    fontSize: Typography.caption,
    fontFamily: Typography.fontRegular,
    color: Colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: Spacing.md,
  },
  input: {
    fontSize: Typography.body,
    fontFamily: Typography.fontRegular,
    color: Colors.textPrimary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.md,
  },
  formButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  cancelButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  cancelButtonText: {
    fontSize: Typography.body,
    fontFamily: Typography.fontRegular,
    color: Colors.textSecondary,
  },
  createButton: {
    backgroundColor: Colors.textPrimary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.sm,
  },
  createButtonDisabled: {
    opacity: 0.4,
  },
  createButtonText: {
    fontSize: Typography.body,
    fontFamily: Typography.fontRegular,
    color: Colors.background,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.divider,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xl,
  },
  addButtonText: {
    fontSize: Typography.body,
    fontFamily: Typography.fontRegular,
    color: Colors.textPrimary,
  },
  noticeBox: {
    marginTop: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  noticeText: {
    fontSize: Typography.caption,
    fontFamily: Typography.fontRegular,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.xl,
  },
  confirmModal: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    width: "100%",
    maxWidth: 320,
  },
  confirmTitle: {
    fontSize: Typography.subtitle,
    fontFamily: Typography.fontRegular,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
    textAlign: "center",
  },
  confirmMessage: {
    fontSize: Typography.body,
    fontFamily: Typography.fontRegular,
    color: Colors.textPrimary,
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  confirmWarning: {
    fontSize: Typography.caption,
    fontFamily: Typography.fontRegular,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  confirmButtons: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  confirmCancelButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.divider,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
  },
  confirmCancelText: {
    fontSize: Typography.body,
    fontFamily: Typography.fontRegular,
    color: Colors.textSecondary,
  },
  confirmRemoveButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    backgroundColor: "#8B0000",
    borderRadius: BorderRadius.sm,
    alignItems: "center",
  },
  confirmRemoveText: {
    fontSize: Typography.body,
    fontFamily: Typography.fontRegular,
    color: "#FFFFFF",
  },
});
