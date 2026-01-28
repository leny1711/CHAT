import React from 'react';
import {View, StyleSheet, Text, Image} from 'react-native';
import {ColorMatrix} from 'react-native-color-matrix-image-filters';
import {theme} from '../theme/theme';
import {getRevealLevel} from '../photoReveal';

interface RevealPhotoProps {
  photoUrl?: string | null;
  messageCount: number;
}

const GRAYSCALE_MATRIX = [
  0.2126, 0.7152, 0.0722, 0, 0, 0.2126, 0.7152, 0.0722, 0, 0, 0.2126, 0.7152,
  0.0722, 0, 0, 0, 0, 0, 1, 0,
];

const FULL_COLOR_MATRIX = [
  1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0,
];

const getBlurRadius = (revealLevel: number): number => {
  // Level 0: ultra-blurred silhouette (pre-threshold).
  // Level 1: very strong blur, grayscale only.
  // Level 2: strong blur, grayscale only.
  // Level 3: color returns with strong blur.
  // Level 4: light blur, color stays.
  // Level 5: no blur.
  switch (revealLevel) {
    case 0:
      return 100;
    case 1:
      return 90;
    case 2:
      return 70;
    case 3:
      return 40;
    case 4:
      return 8;
    default:
      return 0;
  }
};

const getColorMatrix = (revealLevel: number): number[] => {
  if (revealLevel <= 2) {
    return GRAYSCALE_MATRIX;
  }
  return FULL_COLOR_MATRIX;
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
  const lastPhotoUrl = React.useRef(resolvedPhotoUrl);
  if (lastPhotoUrl.current !== resolvedPhotoUrl) {
    lastPhotoUrl.current = resolvedPhotoUrl;
    maxRevealLevel.current = computedRevealLevel;
  }
  if (computedRevealLevel > maxRevealLevel.current) {
    maxRevealLevel.current = computedRevealLevel;
  }
  const safeRevealLevel = maxRevealLevel.current;
  const colorMatrix = getColorMatrix(safeRevealLevel);
  const shouldApplyColorMatrix = safeRevealLevel < 5;

  const hasPhoto = resolvedPhotoUrl !== null;
  const accessibilityLabel = hasPhoto
    ? 'Photo de profil avec révélation progressive'
    : 'Aperçu sans photo de profil';

  const imageElement = (
    <Image
      source={{uri: resolvedPhotoUrl}}
      style={styles.image}
      blurRadius={getBlurRadius(safeRevealLevel)}
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
    />
  );

  return (
    <View style={styles.container}>
      {hasPhoto ? (
        shouldApplyColorMatrix ? (
          <ColorMatrix matrix={colorMatrix}>{imageElement}</ColorMatrix>
        ) : (
          imageElement
        )
      ) : (
        <View
          style={styles.placeholder}
          accessibilityRole="image"
          accessibilityLabel={accessibilityLabel}
          accessibilityHint="Aucune photo n'a été fournie pour ce profil">
          <Text style={styles.placeholderText}>Aucune photo disponible</Text>
        </View>
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
});
