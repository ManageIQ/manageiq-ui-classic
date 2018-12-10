import fetchMock from 'fetch-mock';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as actions from '../../react/ansibleCatalog/catalogActions';
import * as fixtures from './test.fixtures';

const mockRequest = (url, response) => {
  fetchMock
    .getOnce(url, response);
};
const resources = [{ id: 1, name: 'test' }];
describe('Catalog Actions', () => {
  let mockStore;
  let middlewares;
  let store;
  beforeEach(() => {
    middlewares = [thunk];
    mockStore = configureMockStore(middlewares);
    store = mockStore({});
  });
  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  it('displays a list of catalogs', () => {
    const sampleAllCatalogs = [
      ['test', 1],
      ['test 2', 2],
    ];

    store.dispatch(actions.loadCatalogs(sampleAllCatalogs));
    const displayCatalogActions = store.getActions();
    expect(displayCatalogActions).toEqual([fixtures.catalogActionCatalogs]);
  });
  it('Fails a http request', () => {
    // eslint-disable-next-line no-console
    console.error = jest.fn();
    const spy = jest.spyOn(window, 'add_flash');
    window.add_flash = spy;
    fetchMock
      .mock('/api/service_dialogs/?expand=resources&attributes=id,label&sort_by=label&sort_order=ascending', {
        body: {
          error: {
            message: 'Request failed',
          },
        },
        status: 500,
      });
    return store.dispatch(actions.loadDialogs()).then(() => {
      expect(spy).toHaveBeenCalledWith('Request failed', 'error');
    });
  });
  it('Fetches a list of dialogs', () => {
    const url = '/api/service_dialogs/?expand=resources&attributes=id,label&sort_by=label&sort_order=ascending';
    mockRequest(url, { resources });

    return store.dispatch(actions.loadDialogs()).then(() => {
      const loadDialogActions = store.getActions();
      expect(loadDialogActions).toEqual(fixtures.catalogActionDialogs);
    });
  });
  it('Fetches a list of Repos', () => {
    const url = `/api/configuration_script_sources?collection_class=ManageIQ::Providers::EmbeddedAnsible::AutomationManager::ConfigurationScriptSource&attributes=id,name&filter[]=region_number=1${actions.commonParams}`;
    mockRequest(url, { resources });

    return store.dispatch(actions.loadRepos(1)).then(() => {
      const loadRepoActions = store.getActions();
      expect(loadRepoActions).toEqual([fixtures.catalogActionRepos]);
    });
  });
  it('Fetches a list of Playbooks', () => {
    const url = `/api/configuration_script_sources/1/configuration_script_payloads?filter[]=region_number=1${actions.commonParams}`;
    mockRequest(url, { resources });
    return store.dispatch(actions.loadPlaybooks(1, 1, 'provision')).then(() => {
      const loadPlaybookActions = store.getActions();
      expect(loadPlaybookActions).toEqual(fixtures.catalogActionPlaybooks);
    });
  });
  it('Fetches a list of Machine credentials', () => {
    const url = actions.credentialsRequest('MachineCredential');
    mockRequest(url, { resources });

    return store.dispatch(actions.loadCredentials('Machine')).then(() => {
      const loadMachineCredentialActions = store.getActions();
      expect(loadMachineCredentialActions).toEqual([fixtures.catalogActionMachineCredentials]);
    });
  });
  it('Fetches a list of Cloud types', () => {
    fetchMock
      .mock('/api/authentications', {
        data: ['test', 'test1'],
      }, {
        method: 'options',
      });
    return store.dispatch(actions.loadCloudTypes()).then(() => {
      const loadCloudTypeActions = store.getActions();
      expect(loadCloudTypeActions).toEqual(fixtures.catalogActionCloudTypes);
    });
  });
  it('Fetches a list of Cloud credentials', () => {
    const url = `/api/authentications?collection_class=test&attributes=id,name${actions.commonParams}`;
    mockRequest(url, { data: [] });

    return store.dispatch(actions.loadCloudCredentials('provision', 'test')).then(() => {
      const loadCloudCredentialsActions = store.getActions();
      expect(loadCloudCredentialsActions).toEqual(fixtures.catalogActionLoadCloudCredentials);
    });
  });
  it('Fetches a catalog item', () => {
    const catalogItemId = 12345;
    mockRequest(`/api/service_templates/${catalogItemId}`, { data: {} });

    return store.dispatch(actions.loadCatalogItem(catalogItemId)).then(() => {
      const loadloadCatalogItemActions = store.getActions();
      expect(loadloadCatalogItemActions).toEqual(fixtures.catalogActionCatalogItem);
    });
  });
  it('Loads a cloud credential', () => {
    const credentialId = 12345;
    mockRequest(`/api/authentications/${credentialId}`, { data: {} });

    return store.dispatch(actions.loadCloudCredential(credentialId)).then(() => {
      const loadCloudCredentialActions = store.getActions();
      expect(loadCloudCredentialActions).toEqual(fixtures.catalogActionLoadCloudCredential);
    });
  });
  it('Duplicates dropdowns', () => {
    store.dispatch(actions.duplicateDropdowns(['test', 'test1']));
    const loadCloudDuplicateFieldsActions = store.getActions();
    expect(loadCloudDuplicateFieldsActions).toEqual(fixtures.catalogActionDuplicateDropdowns);
  });
});
