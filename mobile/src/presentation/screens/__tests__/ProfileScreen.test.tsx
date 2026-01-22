import React from 'react';
import renderer from 'react-test-renderer';
import {ProfileScreen} from '../ProfileScreen';

describe('ProfileScreen', () => {
  it('affiche le nom et la description', () => {
    const tree = renderer.create(
      <ProfileScreen
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
});
