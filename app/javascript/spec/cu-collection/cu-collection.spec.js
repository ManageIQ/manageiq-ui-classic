import { screen, waitFor } from '@testing-library/react';
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

  it('Save button is disabled when nothing has changed', async() => {
    const { container } = renderWithRedux(
      <SettingsCUCollectionTab />
    );

    await waitFor(() => {
      expect(container.querySelector('button[type="submit"]')).toBeInTheDocument();
    });

    expect(container.querySelector('button[type="submit"]')).toBeDisabled();
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
});
