import React from 'react';
import toJson from 'enzyme-to-json';
import { mount } from 'enzyme';
import ProvGrid from '../../components/prov-grid';
import { provVmGridData } from './prov-vm-grid-data';

describe('ProvGrid component', () => {
  it('should render prov_vm_grid table', () => {
    const { fieldId, initialData } = provVmGridData();
    const wrapper = mount(
      <ProvGrid
        type="vm"
        fieldId={fieldId}
        initialData={initialData}
      />
    );
    expect(wrapper.find('.prov-vm-grid-data-table')).toHaveLength(1);
    expect(wrapper.find('tr.clickable-row')).toHaveLength(initialData.rows.length);
    wrapper.find('tr.clickable-row').last().simulate('click');
    expect(toJson(wrapper)).toMatchSnapshot();
  });
});
