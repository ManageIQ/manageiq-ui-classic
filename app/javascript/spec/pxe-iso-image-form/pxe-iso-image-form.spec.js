import React from 'react';
import toJson from 'enzyme-to-json';
import fetchMock from 'fetch-mock';

import { act } from 'react-dom/test-utils';
import '../helpers/miqSparkle';
import { mount } from '../helpers/mountForm';
import PxeIsoImageForm from '../../components/pxe-iso-image-form/index';

describe('Pxe Edit Iso Image Form Component', () => {

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

  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  it('should render editing a iso image', async (done) => {
    fetchMock.get('/api/pxe_image_types?attributes=name,id&expand=resources', api);
    fetchMock.get('/api/iso_images/1', { pxe_image_type_id: '1', });
    let wrapper;

    await act(async () => {
      wrapper = mount(<PxeIsoImageForm recordId="1" />);
    });
    wrapper.update();
    expect(fetchMock.calls()).toHaveLength(3);
    expect(toJson(wrapper)).toMatchSnapshot();
    done();
  });
});