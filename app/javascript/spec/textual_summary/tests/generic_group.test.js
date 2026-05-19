import React from 'react';
import { render, screen } from '@testing-library/react';
import GenericGroup from '../../../components/textual_summary/generic_group';
import { genericGroupData } from '../data/generic_group';

describe('GenericGroup', () => {
  const onClick = jest.fn();

  it('renders title and rows', () => {
    render(
      <GenericGroup
        items={genericGroupData.items}
        title={genericGroupData.title}
        onClick={onClick}
      />
    );
    expect(screen.getByText(genericGroupData.title)).toBeInTheDocument();
  });

  it('renders just fine', () => {
    const { container } = render(
      <GenericGroup
        items={genericGroupData.items}
        title={genericGroupData.title}
        onClick={onClick}
      />
    );
    expect(container).toMatchSnapshot();
  });
});
