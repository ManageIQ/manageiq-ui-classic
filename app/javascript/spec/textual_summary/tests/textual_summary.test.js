import React from 'react';
import { render } from '@testing-library/react';
import { TextualSummary } from '../../../components/textual_summary/index';
import { summary1 } from '../data/textual_summary';

describe('TextualSummary', () => {
  const onClick = jest.fn();

  it('renders just fine', () => {
    const { container } = render(
      <TextualSummary summary={summary1} onClick={onClick} />
    );
    expect(container).toMatchSnapshot();
  });
});
