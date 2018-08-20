import toJson from 'enzyme-to-json';
import { mount } from 'enzyme';
import fetchMock from 'fetch-mock';
import { FinalFormField } from '@manageiq/react-ui-components/dist/forms';
import * as helpers from '../../react/ansibleCatalog/helpers';
import { catalogFormDefaults } from './test.fixtures';

describe('Ansible catalog form helpers', () => {
  it('can build a dropdown', () => {
    const input = [{
      name: 'test',
      id: 1,
    }];
    const dropdown = helpers.buildDropDown(input, 'name', 'id');
    expect(dropdown).toEqual([{ label: 'test', value: 1 }]);
  });
  it('can render a form field', () => {
    const input = {
      name: 'test_execution_ttl',
      label: 'Max TTL (mins)',
      component: FinalFormField,
    };
    // eslint-disable-next-line no-console
    console.error = jest.fn();
    const formField = helpers.renderFormField(input, []);
    const wrapper = mount(formField);

    expect(toJson(wrapper)).toMatchSnapshot();
  });
  it('should return a list of catalog item fields', () => {
    const fields = helpers.getAnsibleCatalogItemFields([]);
    expect(fields).toHaveLength(5);
  });
  it('should return a list of AnsiblePlaybookFields', () => {
    const props = {
      prefix: 'provision',
      data: {},
    };
    const fields = helpers.getAnsiblePlaybookFields(props, true);
    expect(fields).toHaveLength(8);
  });
  it('should get resource options', () => {
    const options = helpers.getResourceOptions({});
    expect(options).toEqual([
      { label: 'No', value: 'no_without_playbook' },
      { label: 'Yes', value: 'yes_without_playbook' },
    ]);
  });
  it('should render html dialog message', () => {
    expect(helpers.provisionDialogMessage()).toMatchSnapshot();
  });
  it('should format extra vars', () => {
    const formattedValues = helpers.formatExtraVars({
      testvalue1: {
        default: 1,
      },
      testValue2: {
        default: 2,
      },
    });
    expect(formattedValues).toMatchSnapshot();
  });

  it('should build an extra vars object', () => {
    const formattedValues = helpers.buildExtraVarsObj([
      {
        key: 'test',
        default: 'test',
      },
      {
        key: 'test2',
        default: 'test2',
      },
    ]);
    expect(formattedValues).toMatchSnapshot();
  });
  it('should setFormDefaultValues', () => {
    const setFormDefaultValues = helpers.setFormDefaultValues();
    expect(setFormDefaultValues).toEqual(catalogFormDefaults);
  });
  describe('it should handle form submission', () => {
    it('should submit a form successfully', (done) => {
      const url = '/api/service_templates/';
      window.location.assign = jest.fn();
      const flashMessage = jest.fn();
      global.miqFlashLater = flashMessage;
      fetchMock.reset();
      fetchMock.restore();
      fetchMock.postOnce('/api/service_templates/', {});
      helpers.submitCatalogForm(url, true, {}, null);
      setImmediate(() => {
        done();
        expect(flashMessage).toHaveBeenCalledWith({ message: 'Catalog item was added successfully.' });
      });
    });
  });
});
