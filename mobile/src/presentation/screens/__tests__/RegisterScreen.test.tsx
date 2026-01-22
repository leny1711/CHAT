import React from 'react';
import renderer, {act} from 'react-test-renderer';
import {Text, TouchableOpacity} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import {RegisterScreen} from '../RegisterScreen';

const findButtonByText = (tree: renderer.ReactTestRenderer, label: string) =>
  tree.root
    .findAllByType(TouchableOpacity)
    .find(button =>
      button
        .findAllByType(Text)
        .some(textNode => textNode.props.children === label),
    );

describe('RegisterScreen', () => {
  it('affiche et retire la photo sélectionnée', async () => {
    const onRegister = jest.fn().mockResolvedValue(undefined);
    const onNavigateToLogin = jest.fn();
    const photoAsset = {uri: 'file://photo.jpg'};

    (launchImageLibrary as jest.Mock).mockResolvedValueOnce({
      assets: [photoAsset],
    });

    const tree = renderer.create(
      <RegisterScreen
        onRegister={onRegister}
        onNavigateToLogin={onNavigateToLogin}
      />,
    );

    const addPhotoButton = findButtonByText(
      tree,
      'Ajouter une photo de profil',
    );
    expect(addPhotoButton).toBeTruthy();

    await act(async () => {
      addPhotoButton?.props.onPress();
    });

    expect(
      tree.root.findByProps({
        accessibilityLabel: 'Aperçu de la photo de profil sélectionnée',
      }),
    ).toBeTruthy();
    expect(findButtonByText(tree, 'Retirer la photo')).toBeTruthy();
    expect(findButtonByText(tree, 'Changer la photo de profil')).toBeTruthy();

    const removePhotoButton = findButtonByText(tree, 'Retirer la photo');

    act(() => {
      removePhotoButton?.props.onPress();
    });

    expect(
      tree.root.findByProps({children: 'Cette étape est facultative'}),
    ).toBeTruthy();
    expect(() =>
      tree.root.findByProps({
        accessibilityLabel: 'Aperçu de la photo de profil sélectionnée',
      }),
    ).toThrow();
  });
});
