import { render } from '@testing-library/react';
import ContainerProjects from '../../components/container-projects';
import { stubLocation } from '../helpers/stubLocation';

describe('Container Project component', () => {
  it('should render the dashboard', () => {
    // Mock window.location.pathname to match the 'show' pattern
    // This matches the first condition: pathname.match(/show$/)
    stubLocation('/container_project/show');

    const { container } = render(<ContainerProjects url="/container_dashboard/project_data" />);
    expect(container).toMatchSnapshot();
  });
});
