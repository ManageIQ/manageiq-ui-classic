import React from 'react';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import Breadcrumbs from '../../components/breadcrumbs';

describe('Breadcrumbs component', () => {
  const props = {
    items: [
      { url: '/providers', title: 'Providers' },
      { key: 'in tree', title: 'Google' },
      { action: 'accordion-select', title: 'All' },
      { title: 'This' },
    ],
    title: 'Title',
    controllerName: 'provider',
  };

  it('is correctly rendered', () => {
    const wrapper = mount(<Breadcrumbs {...props} />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });
});
