import React from 'react';
import toJson from 'enzyme-to-json';
import fetchMock from 'fetch-mock';

import { act } from 'react-dom/test-utils';
import { mount } from '../helpers/mountForm';
import EmbeddedTerraformCredentialsForm from '../../components/embedded-terraform-credentials-form';

describe('Embedded Terraform Credential Form Component', () => {
  const api = {
    data: {
      credential_types: {
        embedded_terraform_credential_types: {
          foo: {
            attributes: [
              {
                component: 'text-field',
                helperText: 'Unique reference for this credential',
                id: 'ems_ref',
                isRequired: true,
                label: 'Reference',
                name: 'ems_ref',
              },
            ],
            label: 'Embedded Terraform',
          },
          bar: {
            attributes: [],
          },
        },
      },
    },
  };

  beforeEach(() => {
    fetchMock.get('/api/providers?collection_class=ManageIQ::Providers::EmbeddedTerraform::AutomationManager', {
      resources: [
        {
          href: 'http://localhost:3000/api/providers/77',
        },
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
      wrapper = mount(<EmbeddedTerraformCredentialsForm />);
    });
    wrapper.update();
    expect(fetchMock.calls()).toHaveLength(2);
    expect(toJson(wrapper)).toMatchSnapshot();
    done();
  });

  it('should render editing a credential', async(done) => {
    fetchMock.once('/api/authentications', api);
    fetchMock.get('/api/authentications/1', { ems_ref: 'test', type: 'foo' });
    let wrapper;

    await act(async() => {
      wrapper = mount(<EmbeddedTerraformCredentialsForm recordId="1" />);
    });
    wrapper.update();
    expect(fetchMock.calls()).toHaveLength(3);
    expect(toJson(wrapper)).toMatchSnapshot();
    done();
  });
});
