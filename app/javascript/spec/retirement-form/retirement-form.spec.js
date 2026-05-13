import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import fetchMock from 'fetch-mock';
import { renderWithRedux } from '../helpers/mountForm';
import RetirementForm from '../../components/retirement-form/index';

import '../helpers/miq_formatters_helper';

describe('Retirement Form Component', () => {
  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  it('should render a new Retirement form', async() => {
    fetchMock.getOnce(
      '/api/services/180?attributes=retires_on,retirement_warn',
      {
        retires_on: null,
        retirement_warn: null,
      }
    );
    const timezone = { tzinfo: { info: { identifier: 'America/New York' } } };

    const { container } = renderWithRedux(
      <RetirementForm
        retirementID='["180"]'
        url="/api/services"
        timezone={timezone}
      />
    );
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    });
    expect(container).toMatchSnapshot();
  });

  it('should submit Retirement Form with correct date and time', async() => {
    const retire = {
      retires_on: '2021-10-02T00:50:00Z',
      retirement_warn: null,
    };
    fetchMock.getOnce(
      '/api/services/42?attributes=retires_on,retirement_warn',
      retire
    );

    const retirementDate = new Date('2021-10-02T00:50:00Z');
    retirementDate.setMonth(11);
    retirementDate.setDate(25);
    retirementDate.setHours(15);
    retirementDate.setMinutes(59);

    const resources = [
      {
        id: '42',
        date: retirementDate,
        warn: 14,
      },
    ];
    const postData = { action: 'request_retire', resources };
    fetchMock.postOnce('/api/services', postData);

    const { container } = renderWithRedux(
      <RetirementForm retirementID='["42"]' url="/api/services" {...retire} />
    );
    await waitFor(() => {
      expect(
        fetchMock.called(
          '/api/services/42?attributes=retires_on,retirement_warn'
        )
      ).toBe(true);
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    });
    expect(container).toMatchSnapshot();
  });
});
