import React from 'react';
import { render, screen } from '@testing-library/react';
import MiqStructuredList from '../../components/miq-structured-list';
import {
  infoData,
  eventDefinitionPolicyData,
} from './miq-event-definition.data';

describe('MiqEventDefinitionStructuredList', () => {
  it('should render event definition info structured list', () => {
    const { container } = render(
      <MiqStructuredList
        rows={infoData.items}
        title={infoData.title}
        mode={infoData.mode}
      />
    );

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('bar')).toBeInTheDocument();
    expect(screen.getByText('policy description')).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });

  it('should render event definition policy structured list', () => {
    const onClick = jest.fn();
    const { container } = render(
      <MiqStructuredList
        rows={eventDefinitionPolicyData.items}
        title={eventDefinitionPolicyData.title}
        mode={eventDefinitionPolicyData.mode}
        onClick={onClick}
      />
    );

    expect(screen.getByRole('table')).toBeInTheDocument();
    const elements = screen.getAllByTitle('View this Model Alert');
    expect(elements.length).toBeGreaterThan(0);
    expect(container).toMatchSnapshot();
  });
});
