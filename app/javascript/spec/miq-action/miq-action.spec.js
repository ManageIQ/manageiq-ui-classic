import React from 'react';
import { render } from '@testing-library/react';
import MiqStructuredList from '../../components/miq-structured-list';
import {
  infoData, actionTypeData1, actionTypeData2, actionTypeData3, actionPoliciesData,
} from './miq-action.data';

describe('MiqActionStructuredList', () => {
  it('should render action info structured list', () => {
    const { container } = render(<MiqStructuredList rows={infoData.items} title={infoData.title} mode={infoData.mode} />);
    expect(container).toMatchSnapshot();
  });

  it('should render action type 1 structured list', () => {
    const { container } = render(<MiqStructuredList rows={actionTypeData1.items} title={actionTypeData1.title} mode={actionTypeData1.mode} />);
    expect(container).toMatchSnapshot();
  });

  it('should render action type 2 structured list', () => {
    const { container } = render(<MiqStructuredList rows={actionTypeData2.items} title={actionTypeData2.title} mode={actionTypeData2.mode} />);
    expect(container).toMatchSnapshot();
  });

  it('should render action type 3 structured list', () => {
    const { container } = render(<MiqStructuredList rows={actionTypeData3.items} title={actionTypeData3.title} mode={actionTypeData3.mode} />);
    expect(container).toMatchSnapshot();
  });

  it('should render action policies structured list', () => {
    const { container } = render(
      <MiqStructuredList rows={actionPoliciesData.items} title={actionPoliciesData.title} mode={actionPoliciesData.mode} />
    );
    expect(container).toMatchSnapshot();
  });
});
