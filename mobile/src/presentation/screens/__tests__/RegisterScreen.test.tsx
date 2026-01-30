import React from 'react';
import renderer, {act} from 'react-test-renderer';
import {Text, TextInput, TouchableOpacity} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import {RegisterScreen} from '../RegisterScreen';

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  act(() => {
    jest.runOnlyPendingTimers();
    jest.clearAllTimers();
  });
  jest.useRealTimers();
});

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
      tree.root.findByProps({
        children: 'Veuillez sélectionner une photo de profil.',
      }),
    ).toBeTruthy();
    expect(() =>
      tree.root.findByProps({
        accessibilityLabel: 'Aperçu de la photo de profil sélectionnée',
      }),
    ).toThrow();
  });

  it('affiche les choix de genre et de préférences', () => {
    const tree = renderer.create(
      <RegisterScreen
        onRegister={jest.fn().mockResolvedValue(undefined)}
        onNavigateToLogin={jest.fn()}
      />,
    );

    expect(findButtonByText(tree, 'Homme')).toBeTruthy();
    expect(findButtonByText(tree, 'Femme')).toBeTruthy();
    expect(findButtonByText(tree, 'Hommes')).toBeTruthy();
    expect(findButtonByText(tree, 'Femmes')).toBeTruthy();
  });

  it('transmet le genre et les préférences à l’inscription', async () => {
    const onRegister = jest.fn().mockResolvedValue(undefined);
    (launchImageLibrary as jest.Mock).mockResolvedValueOnce({
      assets: [{uri: 'file://photo.jpg'}],
    });
    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(
        <RegisterScreen
          onRegister={onRegister}
          onNavigateToLogin={jest.fn()}
        />,
      );
    });

    const [nameInput, emailInput, passwordInput, bioInput] =
      tree.root.findAllByType(TextInput);
    const genderButton = findButtonByText(tree, 'Femme');
    const menPreferenceButton = findButtonByText(tree, 'Hommes');
    const addPhotoButton = findButtonByText(
      tree,
      'Ajouter une photo de profil',
    );

    await act(async () => {
      nameInput?.props.onChangeText('Alice');
      emailInput?.props.onChangeText('alice@example.com');
      passwordInput?.props.onChangeText('password123');
      bioInput?.props.onChangeText('Bio suffisamment longue');
      genderButton?.props.onPress();
      menPreferenceButton?.props.onPress();
      await addPhotoButton?.props.onPress();
    });
    const updatedSubmitButton = findButtonByText(tree!, 'Créer un compte');
    await act(async () => {
      await updatedSubmitButton?.props.onPress();
    });

    expect(onRegister).toHaveBeenCalled();
    const payload = onRegister.mock.calls[0];
    expect(payload[4]).toBe('female');
    expect(payload[5]).toContain('male');
    await act(async () => {
      tree!.unmount();
    });
  });
});
