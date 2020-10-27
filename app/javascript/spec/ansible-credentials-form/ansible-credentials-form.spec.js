import React from 'react';
import toJson from 'enzyme-to-json';
import fetchMock from 'fetch-mock';
import { shallow } from 'enzyme';

import { act } from 'react-dom/test-utils';
import { mount } from '../helpers/mountForm';
import AnsibleCredentialsForm from '../../components/ansible-credentials-form/index';

describe('Ansible Credential Form Component', () => {
  const api = {
    data: {
      credential_types: {
        embedded_ansible_credential_types: {
          foo: {
            attributes: [
              {
                component: 'text-field',
                helperText: 'AWS Access Key for this credential',
                id: 'userid',
                isRequired: true,
                label: 'Access Key',
                name: 'userid',
              },
            ],
            label: 'Amazon',
            type: 'cloud',
          },
          bar: {
            attributes: [],
          },
        },
      },
    },
  };

  beforeEach(() => {
    fetchMock.get('/api/providers?collection_class=ManageIQ::Providers::EmbeddedAutomationManager', { 
        "resources": [
            {
              "href": "http://localhost:3000/api/providers/1"
            }
        ],
    });
  });

  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  it('should render adding a new credential', async(done) => {
    fetchMock.once('/api/authentications', api);
    let wrapper;

    await act(async() => {
      wrapper = mount(<AnsibleCredentialsForm />);
    });
    wrapper.update();
    expect(fetchMock.calls()).toHaveLength(2);
    expect(toJson(wrapper)).toMatchSnapshot();
    done();
  });

  it('should render editing a credential', async(done) => {
    fetchMock.once('/api/authentications', api);
    fetchMock.get('/api/authentications/1', { userid: 'test', type: 'foo' });
    let wrapper;

    await act(async() => {
      wrapper = mount(<AnsibleCredentialsForm recordId={1} />);
    });
    wrapper.update();
    expect(fetchMock.calls()).toHaveLength(3);
    expect(toJson(wrapper)).toMatchSnapshot();
    done();
  });
});
