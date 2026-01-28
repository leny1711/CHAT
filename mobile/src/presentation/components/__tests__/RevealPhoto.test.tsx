import React from 'react';
import renderer, {act} from 'react-test-renderer';
import {Image} from 'react-native';
import {ColorMatrix} from 'react-native-color-matrix-image-filters';
import {RevealPhoto} from '../RevealPhoto';
import {REVEAL_THRESHOLDS} from '../../photoReveal';

describe('RevealPhoto', () => {
  const GRAYSCALE_MATRIX = [
    0.2126, 0.7152, 0.0722, 0, 0, 0.2126, 0.7152, 0.0722, 0, 0, 0.2126, 0.7152,
    0.0722, 0, 0, 0, 0, 0, 1, 0,
  ];
  const FULL_COLOR_MATRIX = [
    1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0,
  ];

  it('renders the image whenever a photo url is provided', () => {
    const tree = renderer.create(
      <RevealPhoto photoUrl="https://example.com/photo.jpg" messageCount={0} />,
    );

    const images = tree.root.findAllByType(Image);
    expect(images).toHaveLength(1);
    expect(images[0].props.source).toEqual({
      uri: 'https://example.com/photo.jpg',
    });
  });

  it('keeps the highest reveal level once reached', () => {
    const tree = renderer.create(
      <RevealPhoto
        photoUrl="https://example.com/photo.jpg"
        messageCount={REVEAL_THRESHOLDS.level3}
      />,
    );

    act(() => {
      tree.update(
        <RevealPhoto
          photoUrl="https://example.com/photo.jpg"
          messageCount={0}
        />,
      );
    });

    const image = tree.root.findByType(Image);
    expect(image.props.blurRadius).toBe(40);

    const colorMatrix = tree.root.findByType(ColorMatrix);
    expect(colorMatrix.props.matrix).toHaveLength(20);
    expect(colorMatrix.props.matrix).toEqual(FULL_COLOR_MATRIX);
  });

  it('applies strong obscuring effects at reveal level 1', () => {
    const tree = renderer.create(
      <RevealPhoto
        photoUrl="https://example.com/photo.jpg"
        messageCount={REVEAL_THRESHOLDS.level1}
      />,
    );

    const image = tree.root.findByType(Image);
    expect(image.props.blurRadius).toBe(90);

    const colorMatrix = tree.root.findByType(ColorMatrix);
    expect(colorMatrix.props.matrix).toHaveLength(20);
    expect(colorMatrix.props.matrix).toEqual(GRAYSCALE_MATRIX);
  });

  it('uses the grayscale matrix at reveal level 0', () => {
    const tree = renderer.create(
      <RevealPhoto photoUrl="https://example.com/photo.jpg" messageCount={0} />,
    );

    const colorMatrix = tree.root.findByType(ColorMatrix);
    expect(colorMatrix.props.matrix).toHaveLength(20);
    expect(colorMatrix.props.matrix).toEqual(GRAYSCALE_MATRIX);
  });

  it('removes the matrix at max reveal level', () => {
    const tree = renderer.create(
      <RevealPhoto
        photoUrl="https://example.com/photo.jpg"
        messageCount={REVEAL_THRESHOLDS.level5}
      />,
    );

    expect(tree.root.findAllByType(ColorMatrix)).toHaveLength(0);
    const image = tree.root.findByType(Image);
    expect(image.props.blurRadius).toBe(0);
  });

  it('renders placeholder only when photo url is null', () => {
    const tree = renderer.create(
      <RevealPhoto photoUrl={null} messageCount={0} />,
    );

    expect(
      tree.root.findByProps({children: 'Aucune photo disponible'}),
    ).toBeTruthy();
  });
});
