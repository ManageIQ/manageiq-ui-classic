import React from 'react';
import toJson from 'enzyme-to-json';
import { mount } from 'enzyme';
import ProvGrid from '../../components/prov-grid';
import { provGridData } from './prov-vm-grid-data';
import { ProvGridTypes } from '../../components/prov-grid/helper';

describe('ProvGrid component', () => {
  const mode = (type) => `.prov-${type}-grid-data-table`;

  it('should render prov_vm_grid table', () => {
    const type = ProvGridTypes.vm;
    const initialData = provGridData({ type, fieldId: 'service__src_vm_id' });
    const wrapper = mount(<ProvGrid initialData={initialData} />);
    expect(wrapper.find(mode(type))).toHaveLength(1);
    expect(wrapper.find('tr.clickable-row')).toHaveLength(initialData.rows.length);
    wrapper.find('tr.clickable-row').last().simulate('click');
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render prov_host_grid table', () => {
    const type = ProvGridTypes.host;
    const initialData = provGridData({ type, fieldId: 'environment__placement_host_name' });
    const wrapper = mount(<ProvGrid initialData={initialData} />);
    expect(wrapper.find(mode(type))).toHaveLength(1);
    expect(wrapper.find('tr.clickable-row')).toHaveLength(initialData.rows.length);
    wrapper.find('tr.clickable-row').last().simulate('click');
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render prov_ds_grid table', () => {
    const type = ProvGridTypes.ds;
    const initialData = provGridData({ type, fieldId: 'environment__placement_ds_name' });
    const wrapper = mount(<ProvGrid initialData={initialData} />);
    expect(wrapper.find(mode(type))).toHaveLength(1);
    expect(wrapper.find('tr.clickable-row')).toHaveLength(initialData.rows.length);
    wrapper.find('tr.clickable-row').last().simulate('click');
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render prov_iso_img_grid table', () => {
    const type = ProvGridTypes.isoImg;
    const initialData = provGridData({ type, fieldId: 'service__iso_image_id' });
    const wrapper = mount(<ProvGrid initialData={initialData} />);
    expect(wrapper.find(mode(type))).toHaveLength(1);
    expect(wrapper.find('tr.clickable-row')).toHaveLength(initialData.rows.length);
    wrapper.find('tr.clickable-row').last().simulate('click');
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render prov_pxe_img_grid table', () => {
    const type = ProvGridTypes.pxeImg;
    const initialData = provGridData({ type, fieldId: 'service__pxe_image_id' });
    const wrapper = mount(<ProvGrid initialData={initialData} />);
    expect(wrapper.find(mode(type))).toHaveLength(1);
    expect(wrapper.find('tr.clickable-row')).toHaveLength(initialData.rows.length);
    wrapper.find('tr.clickable-row').last().simulate('click');
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render prov_template_grid table', () => {
    const type = ProvGridTypes.template;
    const initialData = provGridData({ type, fieldId: 'customize__customization_template_id' });
    const wrapper = mount(<ProvGrid initialData={initialData} />);
    expect(wrapper.find(mode(type))).toHaveLength(1);
    expect(wrapper.find('tr.clickable-row')).toHaveLength(initialData.rows.length);
    wrapper.find('tr.clickable-row').last().simulate('click');
    expect(toJson(wrapper)).toMatchSnapshot();
  });
});
