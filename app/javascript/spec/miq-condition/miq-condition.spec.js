import React from 'react';
import { render } from '@testing-library/react';
import MiqStructuredList from '../../components/miq-structured-list';
import {
  infoData,
  conditionsScopeData,
  conditionsExpressionData,
  conditionPoliciesData,
  conditionNotes,
} from './miq-condition.data';

describe('MiqConditionStructuredList', () => {
  it('should render condition info structured list', () => {
    const { container } = render(
      <MiqStructuredList
        rows={infoData.items}
        title={infoData.title}
        mode={infoData.mode}
      />
    );
    expect(container).toMatchSnapshot();
  });

  it('should render condition scope structured list', () => {
    const { container } = render(
      <MiqStructuredList
        rows={conditionsScopeData.items}
        title={conditionsScopeData.title}
        mode={conditionsScopeData.mode}
      />
    );
    expect(container).toMatchSnapshot();
  });

  it('should render condition expression structured list', () => {
    const { container } = render(
      <MiqStructuredList
        rows={conditionsExpressionData.items}
        title={conditionsExpressionData.title}
        mode={conditionsExpressionData.mode}
      />
    );
    expect(container).toMatchSnapshot();
  });

  it('should render condition policy structured list', () => {
    const { container } = render(
      <MiqStructuredList
        rows={conditionPoliciesData.items}
        title={conditionPoliciesData.title}
        mode={conditionPoliciesData.mode}
      />
    );
    expect(container).toMatchSnapshot();
  });

  it('should render condition notes structured list', () => {
    const { container } = render(
      <MiqStructuredList
        rows={conditionNotes.items}
        title={conditionNotes.title}
        mode={conditionNotes.mode}
      />
    );
    expect(container).toMatchSnapshot();
  });
});
