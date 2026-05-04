import React from 'react';
import { render } from '@testing-library/react';
import MiqStructuredList from '../../components/miq-structured-list';
import {
  infoData,
  alertSetAssignedData,
  alertSetNotes,
  alertSetAlerts,
} from './miq-alert-set.data';

describe('MiqAlertSetStructuredList', () => {
  it('should render alert set info structured list', () => {
    const { container } = render(
      <MiqStructuredList
        rows={infoData.items}
        title={infoData.title}
        mode={infoData.mode}
      />
    );
    expect(container).toMatchSnapshot();
  });

  it('should render alert set assigned structured list', () => {
    const { container } = render(
      <MiqStructuredList
        rows={alertSetAssignedData.items}
        title={alertSetAssignedData.title}
        mode={alertSetAssignedData.mode}
      />
    );
    expect(container).toMatchSnapshot();
  });

  it('should render alert set notes structured list', () => {
    const { container } = render(
      <MiqStructuredList
        rows={alertSetNotes.items}
        title={alertSetNotes.title}
        mode={alertSetNotes.mode}
      />
    );
    expect(container).toMatchSnapshot();
  });

  it('should render alert set alerts structured list', () => {
    const { container } = render(
      <MiqStructuredList
        rows={alertSetAlerts.items}
        title={alertSetAlerts.title}
        mode={alertSetAlerts.mode}
      />
    );
    expect(container).toMatchSnapshot();
  });
});
