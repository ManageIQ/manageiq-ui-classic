import React from 'react';
import { render, screen } from '@testing-library/react';
import MiqStructuredList from '../../components/miq-structured-list';
import {
  infoData,
  miqPolicySetData,
  policySetNotesData,
} from './miq-policy-set.data';

describe('MiqPolicySetStructuredList', () => {
  it('should render policy set info structured list', () => {
    const { container } = render(
      <MiqStructuredList
        rows={infoData.items}
        title={infoData.title}
        mode={infoData.mode}
      />
    );

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });

  it('should render policy set structured list', () => {
    const { container } = render(
      <MiqStructuredList
        rows={miqPolicySetData.items}
        title={miqPolicySetData.title}
        mode={miqPolicySetData.mode}
      />
    );

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });

  it('should render policy set notes structured list', () => {
    const { container } = render(
      <MiqStructuredList
        rows={policySetNotesData.items}
        title={policySetNotesData.title}
        mode={policySetNotesData.mode}
      />
    );

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });
});
