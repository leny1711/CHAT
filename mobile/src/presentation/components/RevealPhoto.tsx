import React from 'react';
import {View, Image, StyleSheet, ImageStyle, Text} from 'react-native';
import {theme} from '../theme/theme';
import {getRevealLevel} from '../photoReveal';

interface RevealPhotoProps {
  photoUrl?: string;
  messageCount: number;
}

const getRevealStyle = (revealLevel: number): ImageStyle => {
  switch (revealLevel) {
    case 0:
      return styles.revealLevel0;
    default:
      return styles.revealVisible;
  }
};

const getBlurRadius = (revealLevel: number): number => {
  switch (revealLevel) {
    case 0:
      return 32;
    case 1:
      return 26;
    case 2:
      return 18;
    case 3:
      return 8;
    case 4:
      return 2;
    default:
      return 0;
  }
};

const getOverlayOpacity = (revealLevel: number): number => {
  switch (revealLevel) {
    case 0:
      return 0.95;
    case 1:
      return 0.75;
    case 2:
      return 0.6;
    case 3:
      return 0.25;
    case 4:
      return 0.08;
    default:
      return 0;
  }
};

const getDesaturationOpacity = (revealLevel: number): number => {
  switch (revealLevel) {
    case 1:
      return 0.7;
    case 2:
      return 0.45;
    default:
      return 0;
  }
};

export const RevealPhoto: React.FC<RevealPhotoProps> = ({
  photoUrl,
  messageCount,
}) => {
  const safeRevealLevel = getRevealLevel(messageCount);
  const opacity = getOverlayOpacity(safeRevealLevel);
  const desaturationOpacity = getDesaturationOpacity(safeRevealLevel);

  const accessibilityLabel = photoUrl
    ? 'Photo de profil avec révélation progressive'
    : 'Aperçu sans photo de profil';

  return (
    <View style={styles.container}>
      {photoUrl ? (
        <Image
          source={{uri: photoUrl}}
          style={[styles.image, getRevealStyle(safeRevealLevel)]}
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
      {opacity > 0 && <View style={[styles.overlay, {opacity}]} />}
      {desaturationOpacity > 0 && (
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
  revealLevel0: {
    opacity: 0,
  },
  revealVisible: {
    opacity: 1,
  },
});
