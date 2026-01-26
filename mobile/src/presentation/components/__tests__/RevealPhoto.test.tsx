import React from 'react';
import renderer, {act} from 'react-test-renderer';
import {Image, View} from 'react-native';
import {RevealPhoto} from '../RevealPhoto';
import {REVEAL_THRESHOLDS} from '../../photoReveal';

describe('RevealPhoto', () => {
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
    expect(image.props.blurRadius).toBe(10);
  });

  it('applies strong obscuring effects at reveal level 1', () => {
    const tree = renderer.create(
      <RevealPhoto
        photoUrl="https://example.com/photo.jpg"
        messageCount={REVEAL_THRESHOLDS.level1}
      />,
    );

    const image = tree.root.findByType(Image);
    expect(image.props.blurRadius).toBe(48);

    const views = tree.root.findAllByType(View);
    const hasOpacity = (node: {props: {style?: unknown}}, opacity: number) => {
      if (!node.props.style) {
        return false;
      }
      const styles = Array.isArray(node.props.style)
        ? node.props.style
        : [node.props.style];
      return styles.some(
        style => typeof style === 'object' && style?.opacity === opacity,
      );
    };

    expect(views.some(view => hasOpacity(view, 0.75))).toBe(true);
    expect(views.some(view => hasOpacity(view, 0.6))).toBe(true);
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
