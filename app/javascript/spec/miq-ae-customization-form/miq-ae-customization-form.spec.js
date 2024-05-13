import React from 'react';
import fetchMock from 'fetch-mock';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import MiqAeCustomization from '../../components/miq-ae-customization';

describe('MiqAeCustomization Form Component', () => {
  const customizationMockData = [
    {
      href: `/miq_ae_customization/old_dialogs_edit/2/`,
      id: '2',
      description: 'Configured System Provision',
    },
  ];

  const MiqAeCustomizationEditData = {
    id: '40',
    name: 'test',
    description: 'test description',
    dialogType: 'Configured System Provision',
    content: '---\n test content',
  };

  const MiqAeCustomizationCopyData = {
    name: 'test copy',
    description: 'test copy description',
    dialogType: 'Configured System Provision',
    content: '---\n test copy content',
  };

  const dialogTypes = [
    [
      'Configured System Provision', 'MiqProvisionConfiguredSystemWorkflow',
    ],
    [
      'Physical Server Provision', 'PhysicalServerProvisionWorkflow',
    ],
    [
      'VM Migrate', 'VmMigrateWorkflow',
    ],
    [
      'VM Provision', 'MiqProvisionWorkflow',
    ],
  ];

  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  it('should render add dialog form correctly', async() => {
    const wrapper = shallow(<MiqAeCustomization
      dialogRecord={undefined}
      dialogTypes={dialogTypes}
    />);

    fetchMock.get(`/miq_ae_customization/old_dialogs_new?&expand=resources/`, customizationMockData);

    await new Promise((resolve) => {
      setImmediate(() => {
        wrapper.update();
        expect(toJson(wrapper)).toMatchSnapshot();
        resolve();
      });
    });
  });

  it('should render edit dialog form correctly', async() => {
    const wrapper = shallow(<MiqAeCustomization
      dialogRecord={MiqAeCustomizationEditData}
      dialogTypes={dialogTypes}
    />);

    fetchMock.get(`/miq_ae_customization/old_dialogs_edit_react/${MiqAeCustomizationEditData.id}?&expand=resources/`, customizationMockData);
    await new Promise((resolve) => {
      setImmediate(() => {
        wrapper.update();
        expect(toJson(wrapper)).toMatchSnapshot();
        resolve();
      });
    });
  });

  it('should render copy dialog form correctly', async() => {
    const wrapper = shallow(<MiqAeCustomization
      dialogRecord={MiqAeCustomizationCopyData}
      dialogTypes={dialogTypes}
    />);
    fetchMock.get(`/miq_ae_customization/old_dialogs_copy?&expand=resources`, customizationMockData);

    await new Promise((resolve) => {
      setImmediate(() => {
        wrapper.update();
        expect(toJson(wrapper)).toMatchSnapshot();
        resolve();
      });
    });
  });
});
