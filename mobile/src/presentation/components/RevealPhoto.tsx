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
  0.33, 0.33, 0.33, 0, 0, 0.33, 0.33, 0.33, 0, 0, 0.33, 0.33, 0.33, 0, 0, 0, 0,
  0, 1, 0,
];

const PARTIAL_COLOR_MATRIX = [
  0.6, 0.3, 0.1, 0, 0, 0.3, 0.6, 0.1, 0, 0, 0.1, 0.3, 0.6, 0, 0, 0, 0, 0, 1, 0,
];

const FULL_COLOR_MATRIX = [
  1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0,
];

const getBlurRadius = (revealLevel: number): number => {
  switch (revealLevel) {
    case 0:
      return 60;
    case 1:
      return 56;
    case 2:
      return 44;
    case 3:
      return 10;
    case 4:
      return 3;
    default:
      return 0;
  }
};

const getColorMatrix = (revealLevel: number): number[] => {
  switch (revealLevel) {
    case 0:
      return GRAYSCALE_MATRIX;
    case 1:
    case 2:
    case 3:
    case 4:
      return PARTIAL_COLOR_MATRIX;
    case 5:
    default:
      return FULL_COLOR_MATRIX;
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
  const colorMatrix = getColorMatrix(safeRevealLevel);

  const hasPhoto = resolvedPhotoUrl !== null;
  const accessibilityLabel = hasPhoto
    ? 'Photo de profil avec révélation progressive'
    : 'Aperçu sans photo de profil';

  return (
    <View style={styles.container}>
      {hasPhoto ? (
        <ColorMatrix matrix={colorMatrix}>
          <Image
            source={{uri: resolvedPhotoUrl}}
            style={styles.image}
            blurRadius={getBlurRadius(safeRevealLevel)}
            accessibilityRole="image"
            accessibilityLabel={accessibilityLabel}
          />
        </ColorMatrix>
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
