import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRedux } from '../helpers/mountForm';
import SettingsCUCollectionTab from '../../components/settings-cu-collection';

describe('SettingsCUCollectionTab', () => {
  const fetchResponse = { hosts: [], datastores: [] };

  beforeEach(() => {
    http.get = jest.fn().mockResolvedValue(fetchResponse);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders the form', async() => {
    const { container } = renderWithRedux(
      <SettingsCUCollectionTab />
    );

    await waitFor(() => {
      expect(container.querySelector('form')).toBeInTheDocument();
    });
  });

  it('renders section headings for Clusters and Datastores', async() => {
    renderWithRedux(
      <SettingsCUCollectionTab />
    );

    await waitFor(() => {
      expect(screen.getByText('Clusters')).toBeInTheDocument();
      expect(screen.getByText('Datastores')).toBeInTheDocument();
    });
  });

  it('shows "No Clusters available" note when clusterTree is not provided', async() => {
    renderWithRedux(
      <SettingsCUCollectionTab clusterTree={undefined} />
    );

    await waitFor(() => {
      expect(screen.getByText(/No Clusters available/i)).toBeInTheDocument();
    });
  });

  it('shows "No Datastores available" note when datastoreTree is not provided', async() => {
    renderWithRedux(
      <SettingsCUCollectionTab datastoreTree={undefined} />
    );

    await waitFor(() => {
      expect(screen.getByText(/No Datastores available/i)).toBeInTheDocument();
    });
  });

  it('calls fetch on mount with the fetchURL', async() => {
    renderWithRedux(
      <SettingsCUCollectionTab />
    );

    await waitFor(() => {
      expect(http.get).toHaveBeenCalledWith('/ops/cu_collection_fetch');
    });
  });

  it('does not render the form until the fetch resolves, so props are never shown as stale state', async() => {
    let resolveFetch;
    http.get = jest.fn().mockReturnValue(new Promise((resolve) => {
      resolveFetch = resolve;
    }));

    const { container } = renderWithRedux(
      <SettingsCUCollectionTab allClusters allDatastores />
    );

    expect(container.querySelector('form')).not.toBeInTheDocument();
    expect(screen.queryAllByRole('switch')).toHaveLength(0);

    resolveFetch({
      hosts: [], datastores: [], all_clusters: false, all_datastores: false,
    });

    const switches = await screen.findAllByRole('switch');
    expect(switches[0]).not.toBeChecked();
    expect(switches[1]).not.toBeChecked();
  });

  it('shows an error and the form if the initial fetch fails', async() => {
    http.get = jest.fn().mockRejectedValue(new Error('boom'));

    renderWithRedux(<SettingsCUCollectionTab />);

    await waitFor(() => expect(screen.getByText('boom')).toBeInTheDocument());
  });

  it('uses the state returned by the save instead of re-fetching', async() => {
    const emptyTree = { bs_tree: '[]', tree_nodes: [] };
    http.get = jest.fn().mockResolvedValue({
      hosts: [], datastores: [], all_clusters: true, all_datastores: true,
    });
    http.post = jest.fn().mockResolvedValue({
      success: true,
      message: 'saved',
      hosts: [],
      datastores: [],
      all_clusters: false,
      all_datastores: false,
    });

    renderWithRedux(
      <SettingsCUCollectionTab clusterTree={emptyTree} datastoreTree={emptyTree} allClusters allDatastores />
    );

    // The form remounts once the initial fetch resolves; wait for it.
    await waitFor(() => expect(http.get).toHaveBeenCalledTimes(1));
    await new Promise((resolve) => setTimeout(resolve, 0));
    const switches = await screen.findAllByRole('switch');
    expect(switches[0]).toBeChecked();
    expect(switches[1]).toBeChecked();

    await userEvent.click(switches[0]);
    await userEvent.click(switches[1]);
    await userEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => expect(http.post).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(screen.getByText('saved')).toBeInTheDocument());

    // Only the initial fetch on mount; no second fetch after saving.
    expect(http.get).toHaveBeenCalledTimes(1);
    const after = screen.getAllByRole('switch');
    expect(after[0]).not.toBeChecked();
    expect(after[1]).not.toBeChecked();
  });
});
