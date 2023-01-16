import React from 'react';
import toJson from 'enzyme-to-json';
import { mount } from 'enzyme';
import SettingsCompanyCategories from '../../components/settings-company-categories';
import { settingsCompanyCategoriesData } from './data';

describe('SettingsCompanyCategories component', () => {
  it('should render a SettingsCompanyCategories component', () => {
    const { headers, rows, pageTitle } = settingsCompanyCategoriesData();
    const wrapper = mount(<SettingsCompanyCategories initialData={{ headers, rows, pageTitle }} />);
    expect(toJson(wrapper)).toMatchSnapshot();
    expect(wrapper.find('div.settings-company-categories-list')).toHaveLength(1);
    expect(wrapper.find('div.tab-content-header-actions')).toHaveLength(1);
    expect(wrapper.find('div.tab-content-header-actions').find('button[type="button"]')).toHaveLength(1);
    expect(wrapper.find('div.settings-company-categories-list').find('button[type="button"].miq-data-table-button')).toHaveLength(rows.length);
  });
});
