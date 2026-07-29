import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MiqTabs from '../../components/miq-tabs';

const tabs = [
  { id: 'compute', label: 'Compute', content: <div>Compute content</div> },
  { id: 'storage', label: 'Storage', content: <div>Storage content</div> },
];

describe('MiqTabs', () => {
  it('renders a tab for each entry', () => {
    render(<MiqTabs tabs={tabs} />);

    expect(screen.getByRole('tab', { name: 'Compute' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Storage' })).toBeInTheDocument();
  });

  it('renders the first tab panel by default', () => {
    render(<MiqTabs tabs={tabs} />);

    expect(screen.getByText('Compute content')).toBeVisible();
    expect(screen.getByText('Storage content')).not.toBeVisible();
  });

  it('renders the correct panel when initialTab is set', () => {
    render(<MiqTabs tabs={tabs} initialTab={1} />);

    expect(screen.getByText('Compute content')).not.toBeVisible();
    expect(screen.getByText('Storage content')).toBeVisible();
  });

  it('switches panel content on tab click', async () => {
    render(<MiqTabs tabs={tabs} />);

    expect(screen.getByText('Compute content')).toBeVisible();

    await userEvent.click(screen.getByRole('tab', { name: 'Storage' }));

    expect(screen.getByText('Compute content')).not.toBeVisible();
    expect(screen.getByText('Storage content')).toBeVisible();
  });
});
