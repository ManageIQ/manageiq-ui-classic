import React from 'react';
import toJson from 'enzyme-to-json';

import { act } from 'react-dom/test-utils';
import '../helpers/miqSparkle';
import { mount } from '../helpers/mountForm';
import PxeIsoDatastoreForm from '../../components/pxe-iso-datastore-form/index';

describe('Pxe Iso Datastore Form Component', () => {
  const emses = [
    {
      name: 'provider 1',
      id: 1,
    },
    {
      name: 'provider 2',
      id: 2,
    },
  ];

  it('should render adding a new iso datastore', async(done) => {
    let wrapper;

    await act(async() => {
      wrapper = mount(<PxeIsoDatastoreForm emses={emses} />);
    });
    wrapper.update();
    expect(toJson(wrapper)).toMatchSnapshot();
    done();
  });
});
