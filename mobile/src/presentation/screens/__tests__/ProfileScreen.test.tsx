import React from 'react';
import renderer from 'react-test-renderer';
import {ProfileScreen} from '../ProfileScreen';

describe('ProfileScreen', () => {
  it('affiche le nom et la description', () => {
    const tree = renderer.create(
      <ProfileScreen
        userId="user_2"
        name="Camille"
        description="Description longue pour le profil"
        revealLevel={2}
        onBack={jest.fn()}
      />,
    );

    expect(tree.root.findByProps({children: 'Camille'})).toBeTruthy();
    expect(
      tree.root.findByProps({children: 'Description longue pour le profil'}),
    ).toBeTruthy();
  });

  it('expose un identifiant stable pour le profil', () => {
    const tree = renderer.create(
      <ProfileScreen
        userId="user_5"
        name="Alex"
        description="Bio"
        revealLevel={1}
        onBack={jest.fn()}
      />,
    );

    expect(tree.root.findByProps({testID: 'profil-user_5'})).toBeTruthy();
  });
});
