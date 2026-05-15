import React from 'react';
import { render, screen } from '@testing-library/react';

import MiqToolbar from '../../components/miq-toolbar';

const dashboardData = [
  [
    {
      custom: true,
      name: 'dashboard',
      props: {
        allowAdd: true,
        allowReset: true,
        locked: false,
        items: [
          {
            id: 31,
            type: 'button',
            text: 'add',
            image: 'fa fa-pie-chart fa-lg',
            title: 'Add',
          },
        ],
      },
    },
  ],
];

const genericData = [
  [
    {
      id: 'summary_reload',
      type: 'button',
      icon: 'fa fa-refresh fa-lg',
      name: 'summary_reload',
      title: 'Refresh this page',
    },
  ],
];

describe('<MiqToolbar />', () => {
  beforeEach(() => {
    window.matchMedia = jest.fn();
  });

  it('renders DashboardToolbar', () => {
    render(<MiqToolbar kebabLimit={3} toolbars={dashboardData} />);
    expect(screen.getByTitle('Add widget')).toBeInTheDocument();
  });

  it('renders Toolbar', () => {
    render(<MiqToolbar kebabLimit={3} toolbars={genericData} />);
    expect(screen.getByTitle('Refresh this page')).toBeInTheDocument();
  });
});
