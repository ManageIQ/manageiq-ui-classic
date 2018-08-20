import reducer from '../../react/ansibleCatalog/catalogReducer';
import * as actionTypes from '../../react/ansibleCatalog/actionTypes';
import { testReducerSnapshotWithFixtures } from '../../components/test-utils';
import * as testFixtures from './test.fixtures';

const resources = testFixtures.testRecords;
const fixtures = {
  'should return the initial state': {},
  'should load a catalog': {
    action: {
      type: actionTypes.LOAD_CATALOGS,
      payload: testFixtures.catalogActionCatalogs.payload,
    },
  },
  'should load a list of dialogs': {
    action: {
      type: actionTypes.LOAD_DIALOGS,
      payload: { resources: testFixtures.testDialogRecord },
    },
  },
  'should load repos': {
    action: {
      type: actionTypes.LOAD_REPOS,
      payload: { resources },
    },
  },
  'should load Playbooks': {
    action: {
      type: actionTypes.LOAD_PLAYBOOKS,
      payload: { resources, playbookType: 'provision' },
    },
  },
  'should load machine credentials': {
    action: {
      type: actionTypes.LOAD_MACHINE_CREDENTIALS,
      payload: { resources },
    },
  },
  'should load vault credentials': {
    action: {
      type: actionTypes.LOAD_VAULT_CREDENTIALS,
      payload: { resources },
    },
  },
  'should load Cloud types list': {
    action: {
      type: actionTypes.LOAD_CLOUD_TYPES,
      payload: { ...testFixtures.cloudTypesRecord },
    },
  },
  'should load cloud credentials': {
    action: {
      type: actionTypes.LOAD_CLOUD_CREDENTIALS,
      payload: { resources, fieldType: 'provision' },
    },
  },
  'should duplicate drop downs': {
    action: {
      type: actionTypes.DUPLICATE_DROPDOWNS,
      payload: ['playbooks'],
    },
    state: testFixtures.sampleDropdowns,
  },
  'should load a catalog item': {
    action: {
      type: actionTypes.LOAD_CATALOG_ITEM,
      payload: {
        id: 1,
        name: 'test catalog item',
      },
    },
  },
  'should load a cloud credential': {
    action: {
      type: actionTypes.LOAD_CLOUD_CREDENTIAL,
      payload: {
        id: 1,
        name: 'test cloud credential',
      },
    },
  },
};
describe('Ansible catalog item reducer', () => testReducerSnapshotWithFixtures(reducer, fixtures));
