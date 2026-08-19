import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRedux } from '../helpers/mountForm';
import RbacGroupForm from '../../components/rbac-group-form';
import miqRedirectBack from '../../helpers/miq-redirect-back';
import { API, http } from '../../http_api';

// TaggingWrapperConnected calls ManageIQ.redux.addReducer in its constructor,
// which isn't available in the test environment. Mock it out.
jest.mock('../../components/taggingWrapper', () => {
  const MockTaggingWrapper = () => <div data-testid="tagging-wrapper" />;
  return MockTaggingWrapper;
});

jest.mock('../../helpers/miq-redirect-back');

jest.mock('../../http_api', () => ({
  API: {
    get: jest.fn(),
    post: jest.fn(),
  },
  http: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

const mockGroupData = {
  description: 'Test Group',
  detailed_description: 'A test group',
  miq_user_role: { id: 1, name: 'EvmRole-viewer' },
  tenant: { id: 2, name: 'My Tenant' },
  entitlement: {
    filter_expression: null,
    belongsto_filters: [],
  },
  users: [],
};

const mockRoles = {
  resources: [
    { id: 1, name: 'EvmRole-viewer' },
    { id: 2, name: 'EvmRole-administrator' },
  ],
};

const mockTenants = {
  resources: [
    { id: 2, name: 'My Tenant', divisible: true },
    { id: 3, name: 'My Project', divisible: false },
  ],
};

const mockExtra = {
  hac_tree: '[]',
  vat_tree: '[]',
  hac_paths: {},
  vat_paths: {},
  tags: { tags: [], assignedTags: [], affectedItems: ['1'] },
  deleted_belongsto_filters: [],
  can_lookup_ldap: false,
  auth_mode_name: 'Database',
};

const defaultProps = {
  groupId: 1,
  readOnly: false,
  currentTenantName: 'My Tenant',
  superAdminUser: true,
  deletedBelongstoFilters: [],
};

beforeEach(() => {
  API.get.mockImplementation((url) => {
    if (url.includes('/api/groups/')) {
      return Promise.resolve(mockGroupData);
    }
    if (url.includes('/api/roles')) {
      return Promise.resolve(mockRoles);
    }
    if (url.includes('/api/tenants')) {
      return Promise.resolve(mockTenants);
    }
    return Promise.resolve({});
  });
  API.post.mockResolvedValue({ description: 'Test Group' });
  http.get.mockImplementation((url) => {
    if (url.includes('/ops/group_form_data/')) {
      return Promise.resolve(mockExtra);
    }
    return Promise.resolve({});
  });
  http.post.mockResolvedValue({ groups: ['ldap-group-1', 'ldap-group-2'] });
  miqRedirectBack.mockClear();
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('RbacGroupForm', () => {
  it('renders loading state initially', () => {
    renderWithRedux(<RbacGroupForm {...defaultProps} />);
    expect(document.querySelector('.cds--loading')).toBeInTheDocument();
  });

  it('renders form fields in edit mode', async() => {
    renderWithRedux(<RbacGroupForm {...defaultProps} />);

    await waitFor(() => {
      expect(document.getElementById('description')).toBeInTheDocument();
    });
    expect(document.getElementById('detailed_description')).toBeInTheDocument();
    expect(document.getElementById('role_id')).toBeInTheDocument();
    expect(document.getElementById('tenant_id')).toBeInTheDocument();
  });

  it('pre-fills form fields from loaded group data', async() => {
    renderWithRedux(<RbacGroupForm {...defaultProps} />);

    await waitFor(() => {
      expect(document.getElementById('description')).toHaveValue('Test Group');
    });
    expect(document.getElementById('detailed_description')).toHaveValue('A test group');
  });

  it('renders read-only view when readOnly=true', async() => {
    renderWithRedux(<RbacGroupForm {...defaultProps} readOnly />);

    await waitFor(() => {
      // Form fields should still be present (MiqFormRenderer renders them read-only)
      expect(document.getElementById('description')).toBeInTheDocument();
    });
    // Should show "Assigned Filters (read only)" heading from FilterTabs
    await waitFor(() => {
      expect(screen.getByText('Assigned Filters (read only)')).toBeInTheDocument();
    });
  });

  it('renders "Assign Filters" heading in edit mode', async() => {
    renderWithRedux(<RbacGroupForm {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Assign Filters')).toBeInTheDocument();
    });
  });

  it('shows deleted belongsto warning when deletedBelongstoFilters is non-empty', async() => {
    renderWithRedux(
      <RbacGroupForm
        {...defaultProps}
        deletedBelongstoFilters={['/ManageIQ/Providers/Amazon/...']}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/outdated filters need review/i)).toBeInTheDocument();
    });
    expect(screen.getByText('/ManageIQ/Providers/Amazon/...')).toBeInTheDocument();
  });

  it('does not show deleted filter warning when list is empty', async() => {
    renderWithRedux(<RbacGroupForm {...defaultProps} />);

    await waitFor(() => {
      expect(document.getElementById('description')).toBeInTheDocument();
    });
    expect(screen.queryByText(/outdated filters need review/i)).not.toBeInTheDocument();
  });

  it('does not show LDAP lookup field when canLookupLdap is false', async() => {
    renderWithRedux(<RbacGroupForm {...defaultProps} />);

    await waitFor(() => {
      expect(document.getElementById('description')).toBeInTheDocument();
    });
    expect(document.getElementById('ldap_user')).not.toBeInTheDocument();
  });

  it('shows LDAP lookup field when canLookupLdap is true', async() => {
    http.get.mockImplementation((url) => {
      if (url.includes('/ops/group_form_data/')) {
        return Promise.resolve({ ...mockExtra, can_lookup_ldap: true, auth_mode_name: 'LDAP' });
      }
      return Promise.resolve({});
    });

    renderWithRedux(<RbacGroupForm {...defaultProps} />);

    await waitFor(() => {
      expect(document.getElementById('ldap_user')).toBeInTheDocument();
    });
  });

  it('renders filter tabs', async() => {
    renderWithRedux(<RbacGroupForm {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('My Tenant Tags')).toBeInTheDocument();
    });
    expect(screen.getByText('Clusters, Datastores, Hosts, Managers & Providers')).toBeInTheDocument();
    expect(screen.getByText('VMs & Templates')).toBeInTheDocument();
  });

  describe('for new group', () => {
    // For new group, mock API.get to return null for group (new) and provide roles/tenants
    beforeEach(() => {
      API.get.mockImplementation((url) => {
        if (url.includes('/api/roles')) {
          return Promise.resolve(mockRoles);
        }
        if (url.includes('/api/tenants')) {
          return Promise.resolve(mockTenants);
        }
        return Promise.resolve({});
      });
    });

    it('renders with "Add" submit button', async() => {
      renderWithRedux(<RbacGroupForm {...defaultProps} groupId="new" />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /^Add$/i })).toBeInTheDocument();
      });
    });

    it('calls POST /api/groups on submit', async() => {
      const user = userEvent.setup();
      renderWithRedux(<RbacGroupForm {...defaultProps} groupId="new" />);

      await waitFor(() => {
        expect(document.getElementById('description')).toBeInTheDocument();
      });

      // Fill required fields
      await user.type(document.getElementById('description'), 'New Group');
      await user.selectOptions(document.getElementById('role_id'), '1');
      await user.selectOptions(document.getElementById('tenant_id'), '2');

      const submitBtn = screen.getByRole('button', { name: /^Add$/i });
      await user.click(submitBtn);

      await waitFor(() => {
        expect(API.post).toHaveBeenCalledWith(
          '/api/groups',
          expect.objectContaining({ description: 'New Group' })
        );
      });
    });
  });

  describe('for existing group', () => {
    it('renders with "Save" submit button', async() => {
      renderWithRedux(<RbacGroupForm {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /^Save$/i })).toBeInTheDocument();
      });
    });

    it('calls POST /api/groups/:id with action:edit on submit', async() => {
      const user = userEvent.setup();
      renderWithRedux(<RbacGroupForm {...defaultProps} />);

      await waitFor(() => {
        expect(document.getElementById('description')).toBeInTheDocument();
      });

      // Dirty the form so the pristine guard doesn't block submit
      await user.type(document.getElementById('description'), ' ');

      const submitBtn = screen.getByRole('button', { name: /^Save$/i });
      await user.click(submitBtn);

      await waitFor(() => {
        expect(API.post).toHaveBeenCalledWith(
          '/api/groups/1',
          expect.objectContaining({ action: 'edit' })
        );
      });
    });
  });

  it('calls miqRedirectBack with warning on cancel', async() => {
    const user = userEvent.setup();
    renderWithRedux(<RbacGroupForm {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(miqRedirectBack).toHaveBeenCalledWith(
      expect.any(String),
      'warning',
      '/ops/explorer'
    );
  });

  it('calls miqRedirectBack with success after successful save', async() => {
    const user = userEvent.setup();
    renderWithRedux(<RbacGroupForm {...defaultProps} />);

    await waitFor(() => {
      expect(document.getElementById('description')).toBeInTheDocument();
    });

    // Dirty the form so the pristine guard doesn't block submit
    await user.type(document.getElementById('description'), ' ');

    await user.click(screen.getByRole('button', { name: /^Save$/i }));

    await waitFor(() => {
      expect(miqRedirectBack).toHaveBeenCalledWith(
        expect.any(String),
        'success',
        '/ops/explorer'
      );
    });
  });
});
