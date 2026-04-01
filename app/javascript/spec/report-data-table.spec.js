import React from 'react';
import { render, waitFor } from '@testing-library/react';
import fetchMock from 'fetch-mock';

import './helpers/mockAsyncRequest';
import './helpers/miqSparkle';

import ReportDataTable from '../components/data-tables/report-data-table/report-data-table';

describe('<ReportDataTable />', () => {
  let initialProps;
  jest.setTimeout(30000);

  beforeEach(() => {
    initialProps = {
      reportResultId: 123,
      perPageDefault: 20,
      perPageOptions: [20, 50, 100],
      reportType: 'data',
    };
  });

  afterEach(() => {
    fetchMock.reset();
  });

  const requestUrl = () => {
    const data = {
      sortBy: '',
      sortDirection: '',
      limit: 20,
      offset: 0,
    };
    const params = `expand_value_format=true&hash_attribute=result_set`
    + `&sort_by=${data.sortBy}&sort_order=${data.sortDirection}&`
    + `limit=${data.limit}&offset=${data.offset}`;

    return `/api/results/${initialProps.reportResultId}?${params}`;
  };

  it('should fetch and display report data when instantiated', async () => {
    fetchMock.getOnce(requestUrl(), { report: { col_order: [] }, count: 1, result_set: [{ foo: 'bar' }] });
    
    const { container } = render(<ReportDataTable {...initialProps} />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(fetchMock.calls()).toHaveLength(1);
    });
    
    expect(container.querySelector('div.report-table-toolbar')).toBeInTheDocument();
    expect(container.querySelector('div.report-data-table')).toBeInTheDocument();
    expect(container.querySelector('div.miq-pagination')).toBeInTheDocument();
  });

  it('should display empty state when there is no data', async () => {
    fetchMock.getOnce(requestUrl(), { report: { col_order: [] }, count: 0, result_set: [] });

    const { container } = render(<ReportDataTable {...initialProps} />);

    // Wait for data to load
    await waitFor(() => {
      expect(fetchMock.calls()).toHaveLength(1);
    });

    expect(container.querySelector('div.report-table-toolbar')).toBeInTheDocument();
    expect(container.querySelector('div.report-data-table')).not.toBeInTheDocument();
    expect(container.querySelector('div.miq-pagination')).not.toBeInTheDocument();
    expect(container.querySelector('div.no-records-found')).toBeInTheDocument();
  });
});
