import React from 'react';
import toJson from 'enzyme-to-json';
import { mount } from 'enzyme';
import DiagnosticsOrphanedData from '../../components/diagnostics-orphaned-data';
import { diagnosticsOrphanedDataFile } from './data';

describe('DiagnosticsOrphanedData component', () => {
  it('should render a DiagnosticsOrphanedData component', () => {
    const { headers, rows, pageTitle } = diagnosticsOrphanedDataFile();
    const wrapper = mount(<DiagnosticsOrphanedData initialData={{ headers, rows, pageTitle }} />);
    expect(toJson(wrapper)).toMatchSnapshot();
    expect(wrapper.find('div.diagnostics-orphaned-data-list')).toHaveLength(1);
    expect(wrapper.find('div.diagnostics-orphaned-data-list').find('button[type="button"].miq-data-table-button')).toHaveLength(rows.length);
  });
});
