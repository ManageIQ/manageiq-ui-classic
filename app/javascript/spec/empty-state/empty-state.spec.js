import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EmptyState from '../../components/empty-state';

describe('EmptyState component', () => {
  beforeEach(() => {
    window.miqSparkleOn = jest.fn();
  });

  it('should render with default props', () => {
    const { container } = render(<EmptyState />);

    expect(screen.getByRole('button', { name: /add a provider/i })).toBeInTheDocument();
    expect(container.querySelector('.empty-state-carbon__title')).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });

  it('should render with documentation link', () => {
    const { container } = render(
      <EmptyState documentation="https://example.com/docs" />
    );

    expect(screen.getByText('Learn more about this')).toBeInTheDocument();
    const link = container.querySelector('.empty-state-carbon__link');
    expect(link).toHaveAttribute('href', 'https://example.com/docs');
    expect(container).toMatchSnapshot();
  });

  it('should render button with correct props', async() => {
    const user = userEvent.setup();

    render(<EmptyState actionUrl="/storage_managers/new" />);

    const button = screen.getByRole('button', { name: /add a provider/i });
    expect(button).toBeInTheDocument();
    await user.click(button);
  });
});
