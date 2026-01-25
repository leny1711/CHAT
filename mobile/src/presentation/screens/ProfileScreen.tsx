import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {theme} from '../theme/theme';
import {RevealPhoto} from '../components/RevealPhoto';

export const UNKNOWN_PROFILE_ID = 'profil-inconnu';

interface ProfileScreenProps {
  userId: string;
  name: string;
  description: string;
  photoUrl?: string | null;
  messageCount: number;
  onBack: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  userId,
  name,
  description,
  photoUrl,
  messageCount,
  onBack,
}) => {
  const safeUserId = userId?.trim() || UNKNOWN_PROFILE_ID;
  const safeDescription = description?.trim()
    ? description
    : "Curieux et sincère, j'aime les conversations profondes, les promenades tranquilles et les livres qui font réfléchir. Ici pour partager, apprendre et construire une belle complicité.";
  const safeName = name?.trim() ? name : 'Utilisateur';
  // Normalize missing/empty photo values to null so the placeholder only renders
  // when the backend explicitly indicates no photo is available.
  const safePhotoUrl =
    typeof photoUrl === 'string' && photoUrl.trim().length > 0
      ? photoUrl.trim()
      : null;

  return (
    <ScrollView style={styles.container} testID={`profil-${safeUserId}`}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backText}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Profil</Text>
        <Text style={styles.subtitle}>Informations de la personne</Text>
      </View>
      <View style={styles.photoSection}>
        <RevealPhoto photoUrl={safePhotoUrl} messageCount={messageCount} />
      </View>
      <View style={styles.infoSection}>
        <Text style={styles.name}>{safeName}</Text>
        <Text style={styles.description}>{safeDescription}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
  },
  backText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  title: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: '300',
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  photoSection: {
    paddingHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
  },
  infoSection: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
  },
  name: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  description: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
    lineHeight:
      theme.typography.lineHeight.relaxed * theme.typography.fontSize.md,
  },
});
