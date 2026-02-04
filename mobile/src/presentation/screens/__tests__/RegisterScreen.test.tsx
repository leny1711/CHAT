import React from 'react';
import renderer, {act} from 'react-test-renderer';
import {Text, TextInput, TouchableOpacity} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import {apiClient} from '../../../infrastructure/api/client';
import {RegisterScreen} from '../RegisterScreen';

jest.mock('../../../infrastructure/api/client', () => ({
  apiClient: {
    get: jest.fn(),
  },
}));

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.clearAllTimers();
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

  it('affiche les choix de genre et de préférences', async () => {
    const tree = renderer.create(
      <RegisterScreen
        onRegister={jest.fn().mockResolvedValue(undefined)}
        onNavigateToLogin={jest.fn()}
      />,
    );

    (apiClient.get as jest.Mock).mockResolvedValueOnce({
      cities: [
        {
          id: 'fr-31555',
          name: 'Toulouse',
          slug: 'toulouse-31',
          latitude: 43.6047,
          longitude: 1.4442,
          departmentCode: '31',
        },
      ],
    });

    const cityInput = tree.root.findAllByType(TextInput)[4];
    await act(async () => {
      cityInput?.props.onFocus();
      cityInput?.props.onChangeText('Tou');
    });
    await act(async () => {
      jest.runAllTimers();
    });

    expect(findButtonByText(tree, 'Homme')).toBeTruthy();
    expect(findButtonByText(tree, 'Femme')).toBeTruthy();
    expect(findButtonByText(tree, 'Hommes')).toBeTruthy();
    expect(findButtonByText(tree, 'Femmes')).toBeTruthy();
    expect(findButtonByText(tree, 'Toulouse')).toBeTruthy();
  });

  it('affiche un message vide seulement quand aucun résultat', async () => {
    const tree = renderer.create(
      <RegisterScreen
        onRegister={jest.fn().mockResolvedValue(undefined)}
        onNavigateToLogin={jest.fn()}
      />,
    );

    (apiClient.get as jest.Mock).mockRejectedValueOnce(
      new Error('Network error'),
    );

    const cityInput = tree.root.findAllByType(TextInput)[4];
    await act(async () => {
      cityInput?.props.onFocus();
      cityInput?.props.onChangeText('Car');
    });
    await act(async () => {
      jest.runAllTimers();
    });

    expect(() =>
      tree.root.findByProps({
        children: 'Aucune ville ne correspond à la recherche',
      }),
    ).toThrow();
  });

  it('transmet le genre et les préférences à l’inscription', async () => {
    const onRegister = jest.fn().mockResolvedValue(undefined);
    (launchImageLibrary as jest.Mock).mockResolvedValueOnce({
      assets: [{uri: 'file://photo.jpg'}],
    });
    (apiClient.get as jest.Mock).mockResolvedValueOnce({
      cities: [
        {
          id: 'fr-31555',
          name: 'Toulouse',
          slug: 'toulouse-31',
          latitude: 43.6047,
          longitude: 1.4442,
          departmentCode: '31',
        },
      ],
    });
    const tree = renderer.create(
      <RegisterScreen onRegister={onRegister} onNavigateToLogin={jest.fn()} />,
    );
    await act(async () => {});

    const [nameInput, emailInput, passwordInput, bioInput, cityInput] =
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
      cityInput?.props.onFocus();
      cityInput?.props.onChangeText('Toulouse');
      genderButton?.props.onPress();
      menPreferenceButton?.props.onPress();
      await addPhotoButton?.props.onPress();
    });
    await act(async () => {
      jest.runAllTimers();
    });
    await act(async () => {
      const cityOption = findButtonByText(tree, 'Toulouse');
      cityOption?.props.onPress();
    });
    const updatedSubmitButton = findButtonByText(tree, 'Créer un compte');
    await act(async () => {
      await updatedSubmitButton?.props.onPress();
    });

    expect(onRegister).toHaveBeenCalled();
    const payload = onRegister.mock.calls[0];
    expect(payload[4]).toBe('female');
    expect(payload[5]).toContain('male');
    expect(payload[6]?.slug).toBe('toulouse-31');
    await act(async () => {
      tree.unmount();
    });
  });
});
