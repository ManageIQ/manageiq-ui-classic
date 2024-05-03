import React from 'react';
import { shallow } from 'enzyme';
import ReconfigureTable from '../../../components/reconfigure-vm-form/reconfigure-table';
import {
  diskHeaders, diskRows, networkHeaders, networkRows, driveHeaders, driveRows,
} from '../datatable-data';

describe('ReconfigureTable', () => {
  it('should render disk table with headers and rows', () => {
    const wrapper = shallow(<ReconfigureTable headers={diskHeaders} rows={diskRows} roleAllowed />);
    expect(wrapper.find('MiqDataTable')).toHaveLength(1);
    expect(wrapper.find('MiqDataTable').prop('headers')).toEqual(diskHeaders);
    expect(wrapper.find('MiqDataTable').prop('rows')).toEqual(diskRows);
  });

  it('should render network table with headers and rows', () => {
    const wrapper = shallow(<ReconfigureTable headers={networkHeaders} rows={networkRows} roleAllowed />);
    expect(wrapper.find('MiqDataTable')).toHaveLength(1);
    expect(wrapper.find('MiqDataTable').prop('headers')).toEqual(networkHeaders);
    expect(wrapper.find('MiqDataTable').prop('rows')).toEqual(networkRows);
  });

  it('should render drive table with headers and rows', () => {
    const wrapper = shallow(<ReconfigureTable headers={driveHeaders} rows={driveRows} roleAllowed />);
    expect(wrapper.find('MiqDataTable')).toHaveLength(1);
    expect(wrapper.find('MiqDataTable').prop('headers')).toEqual(driveHeaders);
    expect(wrapper.find('MiqDataTable').prop('rows')).toEqual(driveRows);
  });

  it('should call onCellClick when a cell is clicked', () => {
    const onCellClick = jest.fn();
    const wrapper = shallow(<ReconfigureTable headers={diskHeaders} rows={diskRows} onCellClick={onCellClick} roleAllowed />);
    wrapper.find('MiqDataTable').prop('onCellClick')(diskRows[0], 'name');
    expect(onCellClick).toHaveBeenCalledWith(diskRows[0], 'name');
  });
});
