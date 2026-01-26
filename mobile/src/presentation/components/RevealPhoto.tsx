import React from 'react';
import {View, Image, StyleSheet, Text} from 'react-native';
import {theme} from '../theme/theme';
import {getRevealLevel} from '../photoReveal';

interface RevealPhotoProps {
  photoUrl?: string | null;
  messageCount: number;
}

const getBlurRadius = (revealLevel: number): number => {
  switch (revealLevel) {
    case 0:
      return 60;
    case 1:
      return 48;
    case 2:
      return 32;
    case 3:
      return 10;
    case 4:
      return 3;
    default:
      return 0;
  }
};

const getOverlayOpacity = (revealLevel: number): number => {
  switch (revealLevel) {
    case 0:
      return 0.85;
    case 1:
      return 0.75;
    case 2:
      return 0.6;
    case 3:
      return 0;
    case 4:
      return 0;
    case 5:
      return 0;
    default:
      return 0;
  }
};

const getDesaturationOpacity = (revealLevel: number): number => {
  switch (revealLevel) {
    case 0:
      return 0.7;
    case 1:
      return 0.6;
    case 2:
      return 0.45;
    case 3:
      return 0;
    case 4:
      return 0;
    case 5:
      return 0;
    default:
      return 0;
  }
};

export const RevealPhoto: React.FC<RevealPhotoProps> = ({
  photoUrl,
  messageCount,
}) => {
  // We only consider the photo missing when the backend explicitly returns null.
  // Normalizing empty/whitespace values avoids hiding a valid photo URL.
  const resolvedPhotoUrl =
    typeof photoUrl === 'string' && photoUrl.trim().length > 0
      ? photoUrl.trim()
      : null;
  const maxRevealLevel = React.useRef(0);
  const computedRevealLevel = getRevealLevel(messageCount);
  if (computedRevealLevel > maxRevealLevel.current) {
    maxRevealLevel.current = computedRevealLevel;
  }
  const safeRevealLevel = maxRevealLevel.current;
  const opacity = getOverlayOpacity(safeRevealLevel);
  const desaturationOpacity = getDesaturationOpacity(safeRevealLevel);

  const hasPhoto = resolvedPhotoUrl !== null;
  const accessibilityLabel = hasPhoto
    ? 'Photo de profil avec révélation progressive'
    : 'Aperçu sans photo de profil';

  return (
    <View style={styles.container}>
      {hasPhoto ? (
        <Image
          source={{uri: resolvedPhotoUrl}}
          style={styles.image}
          blurRadius={getBlurRadius(safeRevealLevel)}
          accessibilityRole="image"
          accessibilityLabel={accessibilityLabel}
        />
      ) : (
        <View
          style={styles.placeholder}
          accessibilityRole="image"
          accessibilityLabel={accessibilityLabel}
          accessibilityHint="Aucune photo n'a été fournie pour ce profil">
          <Text style={styles.placeholderText}>Aucune photo disponible</Text>
        </View>
      )}
      {hasPhoto && opacity > 0 && <View style={[styles.overlay, {opacity}]} />}
      {hasPhoto && desaturationOpacity > 0 && (
        <View
          style={[styles.desaturationOverlay, {opacity: desaturationOpacity}]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: theme.colors.surfaceAlt,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceAlt,
  },
  placeholderText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSize.md,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  desaturationOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFF',
  },
});
