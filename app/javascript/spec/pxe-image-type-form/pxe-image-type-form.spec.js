import React from 'react';
import toJson from 'enzyme-to-json';
import fetchMock from 'fetch-mock';
import { shallow } from 'enzyme';

import { act } from 'react-dom/test-utils';
import '../helpers/miqSparkle';
import { mount } from '../helpers/mountForm';
import PxeImageForm from '../../components/pxe-image-type-form/index';

describe('Pxe Image Type Form Component', () => {

  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  it('should render adding a new pxe image type', async(done) => {
    let wrapper;

    await act(async() => {
      wrapper = mount(<PxeImageForm />);
    });
    wrapper.update();
    expect(fetchMock.calls()).toHaveLength(0);
    expect(toJson(wrapper)).toMatchSnapshot();
    done();
  });

  it('should render editing a pxe image type', async(done) => {
    fetchMock.get('/api/pxe_image_types/1', { name: 'foo', provision_type: 'host' });
    let wrapper;

    await act(async() => {
      wrapper = mount(<PxeImageForm recordId="1" />);
    });
    wrapper.update();
    expect(fetchMock.calls()).toHaveLength(1);
    expect(toJson(wrapper)).toMatchSnapshot();
    done();
  });
});
