import React from 'react';
import fetchMock from 'fetch-mock';
import { screen, waitFor } from '@testing-library/react';

import { renderWithRedux } from '../helpers/mountForm';
import DiagnosticsCURepairForm from '../../components/c-and-u-collections-form';
import { formatDate } from '../../components/c-and-u-collections-form/helper';

describe('DiagnosticsCURepairForm Component', () => {
  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  it('Should render a new DiagnosticsCURepair form', async() => {
    const timezones = [
      { name: 'UTC', description: '(GMT+00:00) UTC' },
      { name: 'Hawaii', description: '(GMT-10:00) Hawaii' },
    ];
    fetchMock.getOnce('/api', { timezones });

    const { container } = renderWithRedux(<DiagnosticsCURepairForm />);

    // Wait for the form to load after API call
    await waitFor(() => {
      expect(screen.getByText(/Note/i)).toBeInTheDocument();
    });

    expect(container).toMatchSnapshot();
  });

  it('Should add a record from DiagnosticsCURepair form', async() => {
    const paramsData = {
      timezone: 'UTC',
      start_date: formatDate('12/12/2023'),
      end_date: formatDate('12/01/2023'),
    };
    const timezones = [
      { name: 'International Date Line West', description: '(GMT-12:00) International Date Line West' },
      { name: 'American Samoa', description: '(GMT-11:00) American Samoa' },
      { name: 'Midway Island', description: '(GMT-11:00) Midway Island' },
      { name: 'Hawaii', description: '(GMT-10:00) Hawaii' },
      { name: 'Alaska', description: '(GMT-09:00) Alaska' },
    ];
    fetchMock.getOnce('/api', { timezones });
    fetchMock.postOnce('/ops/cu_repair?button=submit', paramsData);

    const { container } = renderWithRedux(<DiagnosticsCURepairForm />);

    // Wait for the form to load
    await waitFor(() => {
      expect(screen.getByText(/Note/i)).toBeInTheDocument();
    });

    expect(container).toMatchSnapshot();
  });
});
