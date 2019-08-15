import React from 'react';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';

import * as clickFunctions from '../../components/breadcrumbs/on-click-functions';
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

  it('clicked on breadcrumb in tree', () => {
    clickFunctions.onClickTree = jest.fn();

    const initialProps = {
      ...props,
      items: [
        { key: 'xx-11', title: 'Item 11' },
        { title: 'Header' },
      ],
    };
    const wrapper = mount(<Breadcrumbs {...initialProps} />);

    wrapper.find('a').first().simulate('click');

    expect(clickFunctions.onClickTree).toHaveBeenCalledWith(initialProps.controllerName, initialProps.items[0]);
  });

  it('clicked on breadcrumb', () => {
    clickFunctions.onClick = jest.fn();

    const initialProps = {
      ...props,
      items: [
        { url: 'xx-11', title: 'Item 11' },
        { title: 'Header' },
      ],
    };
    const wrapper = mount(<Breadcrumbs {...initialProps} />);

    wrapper.find('a').first().simulate('click');

    expect(clickFunctions.onClick).toHaveBeenCalledWith(expect.any(Object), initialProps.items[0].url);
  });
});
