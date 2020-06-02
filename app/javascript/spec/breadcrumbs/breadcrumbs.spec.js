import React from 'react';
import configureStore from 'redux-mock-store';
import toJson from 'enzyme-to-json';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';

import * as clickFunctions from '../../components/breadcrumbs/on-click-functions';
import { BreadcrumbsBar as Breadcrumbs } from '../../components/breadcrumbs';

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

  const store = configureStore()({
    notificationReducer: {
      unreadCount: 0,
      isDrawerVisible: false,
    },
  });

  const reduxMount = (data) => {
    const Component = () => data;

    return mount(
      <Provider store={store}>
        <Component />
      </Provider>
    );
  };

  it('is correctly rendered', () => {
    const wrapper = reduxMount(<Breadcrumbs {...props} />);
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
    const wrapper = reduxMount(<Breadcrumbs {...initialProps} />);

    wrapper.find('a').first().simulate('click');

    expect(clickFunctions.onClickTree).toHaveBeenCalledWith(expect.any(Object), initialProps.controllerName, initialProps.items[0]);
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
    const wrapper = reduxMount(<Breadcrumbs {...initialProps} />);

    wrapper.find('a').first().simulate('click');

    expect(clickFunctions.onClick).toHaveBeenCalledWith(expect.any(Object), initialProps.items[0].url);
  });
});
