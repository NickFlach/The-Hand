import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
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
      Alert.alert(
        "Limit reached",
        "You may have up to 3 trusted hands at a time."
      );
    }
  };

  const handleRevokeContact = (contact: TrustedContact) => {
    Alert.alert(
      "Remove trusted hand",
      `Remove ${contact.displayName}?\n\nPast shares will remain in your archive but will no longer be accessible to them.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            await revokeTrustedContact(contact.id);
            loadContacts();
          },
        },
      ]
    );
  };

  const canAddMore = contacts.length < 3;

  return (
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
});
