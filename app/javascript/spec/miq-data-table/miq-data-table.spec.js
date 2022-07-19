import React from 'react';
import toJson from 'enzyme-to-json';
import { shallow } from 'enzyme';
import MiqDataTable from '../../components/miq-data-table';
import {
  simpleData, containerNodesData, hostData, catalogData, timeProfileReportsData, chargebackRateData,
} from './data';

describe('Data table component', () => {
  it('should render a simple data table', () => {
    const onSelect = jest.fn();
    const { miqHeaders, miqRows } = simpleData;
    const wrapper = shallow(<MiqDataTable
      headers={miqHeaders}
      rows={miqRows}
      onCellClick={onSelect}
      mode="list"
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render a simple non-clickable data table', () => {
    const { miqHeaders, miqRows } = timeProfileReportsData();
    const wrapper = shallow(<MiqDataTable
      headers={miqHeaders}
      rows={miqRows}
      mode="list"
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render a simple data tabe with pagination and sorting', () => {
    const onSelect = jest.fn();
    const { miqHeaders, miqRows } = simpleData();
    const pageOptions = {
      totalItems: miqRows.length,
      onPerPageSelect: jest.fn(),
      onPageSet: jest.fn(),
      pageSizes: [10, 20, 30, 40, 50],
      pageSize: 10,
      page: 1,
      onPageChange: jest.fn(),
    };
    const wrapper = shallow(<MiqDataTable
      rows={miqRows}
      headers={miqHeaders}
      onCellClick={onSelect}
      sortable
      rowCheckBox
      showPagination
      pageOptions={pageOptions}
      mode="list"
      gridChecks={[]}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render a static-gtl-view data table with checkboxes and icon', () => {
    const onSelect = jest.fn();
    const { miqHeaders, miqRows } = containerNodesData();
    const pageOptions = {
      totalItems: miqRows.length,
      onPerPageSelect: jest.fn(),
      onPageSet: jest.fn(),
      pageSizes: [10, 20, 30, 40, 50],
      pageSize: 10,
      page: 1,
      onPageChange: jest.fn(),
    };
    const wrapper = shallow(<MiqDataTable
      rows={miqRows}
      headers={miqHeaders}
      onCellClick={onSelect}
      sortable
      rowCheckBox
      showPagination
      pageOptions={pageOptions}
      mode="static-gtl-view"
      gridChecks={[]}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render a static-gtl-view data table with checkboxes, images and icon', () => {
    const onSelect = jest.fn();
    const { miqHeaders, miqRows } = hostData();
    const pageOptions = {
      totalItems: 100,
      onPerPageSelect: jest.fn(),
      onPageSet: jest.fn(),
      pageSizes: [10, 20, 30, 40, 50],
      pageSize: 10,
      page: 1,
      onPageChange: jest.fn(),
    };
    const wrapper = shallow(<MiqDataTable
      rows={miqRows}
      headers={miqHeaders}
      onCellClick={onSelect}
      sortable
      rowCheckBox
      showPagination
      pageOptions={pageOptions}
      mode="static-gtl-view"
      gridChecks={[]}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render a static-gtl-view data table with icons and buttons', () => {
    const onSelect = jest.fn();
    const { miqHeaders, miqRows } = catalogData();
    const pageOptions = {
      totalItems: 100,
      onPerPageSelect: jest.fn(),
      onPageSet: jest.fn(),
      pageSizes: [10, 20, 30, 40, 50],
      pageSize: 10,
      page: 1,
      onPageChange: jest.fn(),
    };
    const wrapper = shallow(<MiqDataTable
      rows={miqRows}
      headers={miqHeaders}
      onCellClick={onSelect}
      sortable
      rowCheckBox
      showPagination
      pageOptions={pageOptions}
      mode="static-gtl-view"
      gridChecks={[]}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render a data table with cells which have multiple rows or single row', () => {
    const { headers, rows } = chargebackRateData;
    const wrapper = shallow(<MiqDataTable
      headers={headers}
      rows={rows}
      mode="chargeback-rate"
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });
});
