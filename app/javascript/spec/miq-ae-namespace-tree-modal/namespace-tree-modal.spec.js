import {
  screen, waitFor, act, fireEvent,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRedux } from '../helpers/mountForm';
import NamespaceTreeModal from '../../components/miq-ae-class/namespace-tree-modal';

const mockDomains = {
  resources: [
    { id: 10, name: 'ManageIQ' },
    { id: 20, name: 'System' },
  ],
};

const mockNamespacesWithChildren = {
  resources: [
    {
      id: 100,
      name: 'Cloud',
      fqname: '/ManageIQ/Cloud',
      domain_fqname: 'Cloud',
      klass: 'MiqAeNamespace',
    },
  ],
};

const mockNamespacesEmpty = {
  resources: [],
};

describe('NamespaceTreeModal', () => {
  let onCloseSpy;
  let onApplySpy;

  beforeEach(() => {
    onCloseSpy = jest.fn();
    onApplySpy = jest.fn();

    API.get = jest.fn((url) => {
      if (url.includes('/api/automate_domains')) {
        return Promise.resolve(mockDomains);
      }
      if (url.includes('depth=1')) {
        // Return children only for ManageIQ domain; System has no children
        if (url.includes('ManageIQ')) {
          return Promise.resolve(mockNamespacesWithChildren);
        }
        return Promise.resolve(mockNamespacesEmpty);
      }
      return Promise.resolve({ resources: [] });
    });
  });

  const renderModal = (props = {}) => renderWithRedux(
    <NamespaceTreeModal
      isOpen
      onClose={onCloseSpy}
      onApply={onApplySpy}
      {...props}
    />
  );

  it('renders domain nodes after loading', async() => {
    renderModal();
    await waitFor(() => expect(screen.getByText('ManageIQ')).toBeInTheDocument());
    expect(screen.getByText('System')).toBeInTheDocument();
  });

  it('Apply button is disabled until a namespace is selected', async() => {
    renderModal();
    await waitFor(() => screen.getByText('ManageIQ'));
    expect(screen.getByRole('button', { name: /apply/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /cancel/i })).not.toBeDisabled();
  });

  it('collapses the expand arrow after opening a folder with no child namespaces', async() => {
    renderModal();
    await waitFor(() => screen.getByText('System'));

    // Expand the System domain (which returns empty children)
    const systemNode = screen.getByText('System').closest('[role="treeitem"]');
    await act(async() => {
      await userEvent.click(systemNode);
    });

    await waitFor(() => {
      // After load, the node should no longer have an expand button
      const expandBtn = systemNode.querySelector('[aria-label*="expand"], button[aria-expanded]');
      expect(expandBtn).toBeNull();
    });
  });

  describe('Apply action', () => {
    // Helper: expand ManageIQ domain so the Cloud child namespace becomes visible,
    // then click Cloud to select it. Domain nodes redirect clicks to expand, so
    // clicking them loads children but does not select them.
    const expandAndSelectCloud = async() => {
      await waitFor(() => screen.getByText('ManageIQ'));

      await act(async() => {
        fireEvent.click(screen.getByText('ManageIQ').closest('.ae-ns-node'));
      });

      await waitFor(() => screen.getByText('Cloud'));

      await act(async() => {
        fireEvent.click(screen.getByText('Cloud').closest('.ae-ns-node'));
      });
    };

    it('enables the Apply button after a namespace is selected', async() => {
      renderModal();
      await expandAndSelectCloud();
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /apply/i })).not.toBeDisabled();
      });
    });

    it('passes the selected namespace path to the caller when confirmed', async() => {
      renderModal();
      await expandAndSelectCloud();
      await waitFor(() => screen.getByRole('button', { name: /apply/i }));

      await act(async() => {
        await userEvent.click(screen.getByRole('button', { name: /apply/i }));
      });

      expect(onApplySpy).toHaveBeenCalledWith(
        expect.objectContaining({
          fqname: 'ManageIQ/Cloud',
          domainFqname: 'Cloud',
        })
      );
    });

    it('closes the modal after confirming a selection', async() => {
      renderModal();
      await expandAndSelectCloud();
      await waitFor(() => screen.getByRole('button', { name: /apply/i }));

      await act(async() => {
        await userEvent.click(screen.getByRole('button', { name: /apply/i }));
      });

      expect(onCloseSpy).toHaveBeenCalled();
    });
  });

  it('closes the modal when cancelled', async() => {
    renderModal();
    await waitFor(() => screen.getByText('ManageIQ'));
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onCloseSpy).toHaveBeenCalled();
  });

  it('shows an error when namespace data cannot be loaded', async() => {
    API.get = jest.fn().mockRejectedValue(new Error('Network error'));
    renderModal();
    await waitFor(() => screen.getByRole('alert'));
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});
