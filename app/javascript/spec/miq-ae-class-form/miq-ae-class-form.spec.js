import React from 'react';
import fetchMock from 'fetch-mock';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import MiqAeClass from '../../components/miq-ae-class';

describe('MiqAeClass Form Component', () => {
  const classMockData = [
    {
      href: `/miq_ae_class/edit_class/2/`,
      id: 2,
      description: 'Configured System Provision',
    },
  ];

  const MiqAeClassEditData = {
    id: 40,
    name: 'test',
    display_name: 'test display name',
    description: 'test description',
  };

  const fqName = 'Sample FQ Name';

  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  it('should render add class form correctly', async() => {
    const wrapper = shallow(<MiqAeClass
      classRecord={undefined}
      fqname={fqName}
    />);

    fetchMock.get(`/miq_ae_class/new?&expand=resources/`, classMockData);

    await new Promise((resolve) => {
      setImmediate(() => {
        wrapper.update();
        expect(toJson(wrapper)).toMatchSnapshot();
        resolve();
      });
    });
  });

  it('should render edit class form correctly', async() => {
    const wrapper = shallow(<MiqAeClass
      classRecord={MiqAeClassEditData}
      fqname={fqName}
    />);

    fetchMock.get(`/miq_ae_class/edit_class_react/${MiqAeClassEditData.id}?&expand=resources/`, classMockData);
    await new Promise((resolve) => {
      setImmediate(() => {
        wrapper.update();
        expect(toJson(wrapper)).toMatchSnapshot();
        resolve();
      });
    });
  });
});
