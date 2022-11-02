import React from 'react';
import toJson from 'enzyme-to-json';
import { shallow } from 'enzyme';
import MiqCustomTab from '../../components/miq-custom-tab';

describe('MiqCustomTab component', () => {
  it('should render tabs for catalog summary page', () => {
    const tabLabels = [
      { name: 'basic', text: _('Basic Information') },
      { name: 'detail', text: _('Details') },
      { name: 'resource', text: _('Selected Resources') },
    ];
    const wrapper = shallow(<MiqCustomTab
      containerId="catalog-tabs"
      tabLabels={tabLabels}
      type="CATALOG_SUMMARY"
    />);
    expect(wrapper.find('#catalog_summary_static')).toHaveLength(1);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render tabs for request info page under catalog summary page', () => {
    const tabLabels = [
      { name: 'requester', text: _('Requester') },
      { name: 'purpose', text: _('Purpose') },
      { name: 'service', text: _('Catalog') },
      { name: 'environment', text: _('Environment') },
      { name: 'hardware', text: _('Properties') },
      { name: 'customize', text: _('Customize') },
      { name: 'schedule', text: _('Schedule') },
    ];
    const wrapper = shallow(<MiqCustomTab
      containerId="request-info-tabs"
      tabLabels={tabLabels}
      type="CATALOG_REQUEST_INFO"
    />);
    expect(wrapper.find('#catalog_request_info_dynamic')).toHaveLength(1);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render tabs for catalog edit page', () => {
    const tabLabels = [
      { name: 'basic', text: _('Basic Information') },
      { name: 'detail', text: _('Details') },
      { name: 'resource', text: _('Selected Resources') },
    ];
    const wrapper = shallow(<MiqCustomTab
      containerId="catalog-edit-tabs"
      tabLabels={tabLabels}
      type="CATALOG_EDIT"
    />);
    expect(wrapper.find('#catalog_edit_static')).toHaveLength(1);
    expect(toJson(wrapper)).toMatchSnapshot();
  });
});
