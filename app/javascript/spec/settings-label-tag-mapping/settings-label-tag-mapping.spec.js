import React from 'react';
import toJson from 'enzyme-to-json';
import { mount } from 'enzyme';
import SettingsLabelTagMapping from '../../components/settings-label-tag-mapping';
import { settingsLabelTagMappingData } from './data';

describe('SettingsLabelTagMapping component', () => {
  it('should render a SettingsLabelTagMapping component without warning', () => {
    const { headers, rows } = settingsLabelTagMappingData();
    const wrapper = mount(<SettingsLabelTagMapping initialData={{ headers, rows, warning: false }} />);
    expect(toJson(wrapper)).toMatchSnapshot();
    const component = wrapper.find('div.settings-label-tag-mappings-list');
    expect(component).toHaveLength(1);
    expect(wrapper.find('div.tab-content-header-actions')).toHaveLength(1);
    expect(wrapper.find('div.tab-content-header-actions').find('button[type="button"]')).toHaveLength(1);
    expect(wrapper.find('div.miq-custom-tab-content-notification')).toHaveLength(0);
    expect(component.find('button[type="button"].miq-data-table-button')).toHaveLength(rows.length);
  });

  it('should render a SettingsLabelTagMapping component with warning', () => {
    const { headers, rows } = settingsLabelTagMappingData();
    const wrapper = mount(<SettingsLabelTagMapping initialData={{ headers, rows, warning: true }} />);
    expect(toJson(wrapper)).toMatchSnapshot();
    const component = wrapper.find('div.settings-label-tag-mappings-list');
    expect(component).toHaveLength(1);
    expect(wrapper.find('div.tab-content-header-actions')).toHaveLength(1);
    expect(wrapper.find('div.tab-content-header-actions').find('button[type="button"]')).toHaveLength(1);
    expect(wrapper.find('div.miq-custom-tab-content-notification')).toHaveLength(1);
    expect(component.find('button[type="button"].miq-data-table-button')).toHaveLength(rows.length);
    expect(component.find('button[type="button"].miq-data-table-button')).toHaveLength(rows.length);
  });
});
