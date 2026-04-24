import React from 'react';
import { render } from '@testing-library/react';
import ContainerProjects from '../../components/container-projects';

describe('Container Project component', () => {
  it('should render the dashboard', () => {
    // Mock window.location.pathname to match the 'show' pattern
    // This matches the first condition: pathname.match(/show$/)
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/container_project/show',
      },
      writable: true,
    });

    const { container } = render(<ContainerProjects url="/container_dashboard/project_data" />);
    expect(container).toMatchSnapshot();
  });
});
