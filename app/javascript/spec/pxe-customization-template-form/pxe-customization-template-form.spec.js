import React from 'react';
import toJson from 'enzyme-to-json';
import fetchMock from 'fetch-mock';

import { act } from 'react-dom/test-utils';
import '../helpers/miqSparkle';
import { mount } from '../helpers/mountForm';
import PxeCustomizationTemplateForm from '../../components/pxe-customization-template-form/index';

describe('Pxe Customization Template Form Component', () => {

  const api = {
    resources: [
      {
        name: 'pxe-image-type1',
        id: '1',
      },
      {
        name: 'pxe-image-type2',
        id: '2',
      },
    ],
  };

  const editOrCopyObject = {
    name: 'foo',
    description: 'bar',
    pxe_image_type_id: '1',
    type: 'CustomizationTemplateKickstart',
    script: 'write script here',
  };

  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  it('should render adding a new pxe customization template', async (done) => {
    fetchMock.get('/api/pxe_image_types?attributes=name,id&expand=resources', api);
    let wrapper;

    await act(async () => {
      wrapper = mount(<PxeCustomizationTemplateForm />);
    });
    wrapper.update();
    expect(fetchMock.calls()).toHaveLength(2);
    expect(toJson(wrapper)).toMatchSnapshot();
    done();
  });

  it('should render editing a pxe customization template', async (done) => {
    fetchMock.get('/api/pxe_image_types?attributes=name,id&expand=resources', api);
    fetchMock.get('/api/customization_templates/1', editOrCopyObject);
    let wrapper;

    await act(async () => {
      wrapper = mount(<PxeCustomizationTemplateForm recordId="1" />);
    });
    wrapper.update();
    expect(fetchMock.calls()).toHaveLength(3);
    expect(toJson(wrapper)).toMatchSnapshot();
    done();
  });

  it('should render copying a pxe customization template', async (done) => {
    fetchMock.get('/api/pxe_image_types?attributes=name,id&expand=resources', api);
    fetchMock.get('/api/customization_templates/1', editOrCopyObject);
    let wrapper;

    await act(async () => {
      wrapper = mount(<PxeCustomizationTemplateForm copy="1" />);
    });
    wrapper.update();
    expect(fetchMock.calls()).toHaveLength(3);
    expect(toJson(wrapper)).toMatchSnapshot();
    done();
  });
});
