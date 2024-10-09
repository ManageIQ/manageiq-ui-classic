import React from 'react';
import { shallow } from 'enzyme';
import fetchMock from 'fetch-mock';
import toJson from 'enzyme-to-json';
import SettingsCUCollectionTab from '../../components/settings-cu-collection';

describe('C&U Form Collection Form', () => {
  const CUCollectionMockData = [
    {
      href: `/ops/cu_collection_update/90/`,
      id: '90',
      hosts: [],
      datastores: [],
    },
  ];

  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  it('Render C&U Collection form', async() => {
    const wrapper = shallow(<SettingsCUCollectionTab />);

    fetchMock.get(`/cu_collection_update/90`, CUCollectionMockData);

    await new Promise((resolve) => {
      setImmediate(() => {
        wrapper.update();
        expect(toJson(wrapper)).toMatchSnapshot();
        resolve();
      });
    });
  });
});
