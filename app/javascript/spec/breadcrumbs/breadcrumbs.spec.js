import React from 'react';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { render, screen } from '@testing-library/react';

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

  const renderWithStore = (component) => render(<Provider store={store}>{component}</Provider>);

  it('is correctly rendered', () => {
    const { container } = renderWithStore(<Breadcrumbs {...props} />);
    expect(container).toMatchSnapshot();
  });

  it('renders breadcrumb with tree key', () => {
    const initialProps = {
      ...props,
      items: [{ key: 'xx-11', title: 'Item 11' }, { title: 'Header' }],
    };
    renderWithStore(<Breadcrumbs {...initialProps} />);

    const link = screen.getByRole('link', { name: 'Item 11' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '#');
  });

  it('renders breadcrumb with url', async() => {
    const initialProps = {
      ...props,
      items: [{ url: 'xx-11', title: 'Item 11' }, { title: 'Header' }],
    };
    renderWithStore(<Breadcrumbs {...initialProps} />);

    const link = screen.getByRole('link', { name: 'Item 11' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'xx-11');
  });
});
