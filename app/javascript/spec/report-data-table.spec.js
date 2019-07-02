import React from 'react';
import { mount } from 'enzyme';
import fetchMock from 'fetch-mock';
import { act } from 'react-test-renderer';

import './helpers/mockAsyncRequest';
import './helpers/miqSparkle';

import ReportDataTable from '../components/report-data-table';

describe('<ReportDataTable />', () => {
  let initialProps;

  beforeEach(() => {
    initialProps = {
      reportResultId: 123,
      perPageDefault: 20,
      perPageOptions: [20,50,100],
    };
  });

  afterEach(() => {
    fetchMock.reset();
  });

  it('should fetch report data when instantiated', (done) => {
    const sortBy = '';
    const sortDirection = '';
    const limit = 20;
    const offset = 0;
    const url = `/api/results/${initialProps.reportResultId}?\
hash_attribute=result_set&\
sort_by=${sortBy}&sort_order=${sortDirection}&\
limit=${limit}&offset=${offset}`;

    fetchMock.getOnce(url, { report: { col_order: [] }, count: 0, result_set: [] });

    let wrapper;

    act(() => {
      wrapper = mount(<ReportDataTable {...initialProps} />);
    });

    setTimeout(() => {
      expect(fetchMock.calls()).toHaveLength(1);
      expect(wrapper.find('div.table-view-pf-toolbar')).toHaveLength(1);
      expect(wrapper.find('table.table')).toHaveLength(1);
      expect(wrapper.find('form.table-view-pf-pagination')).toHaveLength(1);
      done();
    });
  });
});
