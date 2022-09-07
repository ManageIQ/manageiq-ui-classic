import React from 'react';
import toJson from 'enzyme-to-json';
import fetchMock from 'fetch-mock';
import { mount } from '../helpers/mountForm';
import OrderServiceForm from '../../components/order-service-form';
import VmEditForm from '../../components/vm-edit-form';

require('../helpers/miqSparkle.js');
require('../helpers/miqAjaxButton.js');

describe('Order Service Form Component', () => {
  let submitSpy;
  const dialogId = 10;
  const resourceActionId = 2018;
  const targetId = 14;
  const targetType = 'service_template';

  const dialogFields = {

  };

  const vmInitialValues = {
    ancestry: '4698',
    id: '4671',
    name: '2_vcr_liberty_keystone_v3',
    custom_attributes: { name: 'custom_1', value: 'test' },
    description: 'test1',
    template: false,
    parent_resource: {
      id: '4698',
      name: 'billy_cloudformator',
      location: '5b0a20b7-3583-49fc-a1e1-e64e528476d6.ovf',
    },
    child_resources: [
      {
        ancestry: '4698/4671',
        id: '4673',
        name: '4_vcr_icehouse',
        location: '8fdc4382-fa5e-4c76-b1bf-d961ad3c7813.ovf',
      },
      {
        ancestry: '4698/4671',
        id: '4672',
        name: '3_vcr_kilo',
        location: '7404871d-ef18-4aee-86a4-6c9e1807867b.ovf',
      },
    ],
  };
  const templateInitialValues = {
    ancestry: '1223',
    id: '2686',
    name: 'amaya-insights-el7.0',
    custom_attributes: { name: 'custom_1', value: 'test' },
    description: 'test1',
    template: true,
    parent_resource: {
      id: '1223',
      name: 'cfme029',
      location: '915334fb-d454-43ba-a3cc-1a52b3f3b98d.ovf',
    },
    child_resources: [
      {
        ancestry: '1223/2686',
        id: '2983',
        name: '3.9ocp',
        location: 'a1d3bb38-5295-4852-bbe7-93481350bc93.ovf',
      },
      {
        ancestry: '1223/2686',
        id: '2600',
        name: 'apitest1',
        location: '9e27b4b6-4e32-412c-b38c-84466a4142cd.ovf',
      },
    ],
  };
  beforeEach(() => {
    submitSpy = jest.spyOn(window, 'miqAjaxButton');
  });
  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
    submitSpy.mockRestore();
  });
  it('should render order service form', () => {
    const initialData = {
      dialogId,
      resourceActionId,
      targetId,
      targetType,
      apiSubmitEndpoint: "/api/service_catalogs/9/service_templates/14",
      apiAction: 'order',
      openUrl: false,
      realTargetType: "ServiceTemplate", 
      finishSubmitEndpoint: "/miq_request/show_list",
    };
    const wrapper = mount(<OrderServiceForm initialData={initialData} />);
    fetchMock.getOnce(
      `/api/service_dialogs/${dialogId}?resource_action_id=${resourceActionId}&target_id=${targetId}&target_type=${targetType}`,
      dialogFields
    );
    expect(toJson(wrapper)).toMatchSnapshot();
  });
  it('should edit vm with a parent and children', async(done) => {
    const parentVMOptions = {
      resources: [
        {
          id: '4698',
          name: 'billy_cloudformator',
          location: '5b0a20b7-3583-49fc-a1e1-e64e528476d6.ovf',
        },
        {
          id: '4680',
          name: 'ag_destroy_test',
          location: 'ed24a738-41e6-40c9-9adc-606e6f66f2ba.ovf',
        },
        {
          id: '4734',
          name: 'billy_cloudformator',
          location: '5b0a20b7-3583-49fc-a1e1-e64e528476d6.ovf',
        }],
    };

    const parentTemplateOptions = {
      resources: [
        {
          id: '4668',
          name: 'win2012-temp',
          location: '73c9b538-a84c-462f-a7f9-2c08fc3e212a.ovf',
        }],
    };

    const data = {
      action: 'edit',
      resource: {
        custom_1: 'test',
        description: 'test description',
        parent_resource: { href: `/api/vms/4734` },
        child_resources: [
          { href: `/api/vms/4672` },
          { href: `/api/vms/4673` },
          { href: `/api/templates/4668` },
        ],
      },
    };

    fetchMock.getOnce(`/api/vms/?filter[]=ems_id=56&expand=resources`, parentVMOptions);
    fetchMock.getOnce(`/api/templates/?filter[]=ems_id=56&expand=resources`, parentTemplateOptions);
    fetchMock.getOnce(`/api/vms/4671?attributes=child_resources,parent_resource,custom_attributes`, vmInitialValues);
    fetchMock.postOnce('/api/vms/4671', data);
    const wrapper = mount(<VmEditForm recordId="4671" emsId="56" displayName="Virtual Machine" isTemplate={false} />);
    expect(toJson(wrapper)).toMatchSnapshot();
    done();
  });
  it('should edit vm with no parent or children', async(done) => {
    const parentVMOptions = {
      resources: [
        {
          id: '4698',
          name: 'billy_cloudformator',
          location: '5b0a20b7-3583-49fc-a1e1-e64e528476d6.ovf',
        },
        {
          id: '4680',
          name: 'ag_destroy_test',
          location: 'ed24a738-41e6-40c9-9adc-606e6f66f2ba.ovf',
        },
        {
          id: '4734',
          name: 'billy_cloudformator',
          location: '5b0a20b7-3583-49fc-a1e1-e64e528476d6.ovf',
        },
      ],
    };

    const parentTemplateOptions = {
      resources: [
        {
          id: '4668',
          name: 'win2012-temp',
          location: '73c9b538-a84c-462f-a7f9-2c08fc3e212a.ovf',
        },
      ],
    };

    const data = {
      action: 'edit',
      resource: {
        custom_1: 'test',
        description: 'test description',
        parent_resource: null,
        child_resources: [],
      },
    };

    fetchMock.getOnce(`/api/vms/?filter[]=ems_id=56&expand=resources`, parentVMOptions);
    fetchMock.getOnce(`/api/templates/?filter[]=ems_id=56&expand=resources`, parentTemplateOptions);
    fetchMock.getOnce(`/api/vms/4671?attributes=child_resources,parent_resource,custom_attributes`, vmInitialValues);
    fetchMock.postOnce('/api/vms/4671', data);
    const wrapper = mount(<VmEditForm recordId="4671" emsId="56" displayName="Virtual Machine" isTemplate={false} />);
    expect(toJson(wrapper)).toMatchSnapshot();
    done();
  });
  it('should edit template with a parent and children', async(done) => {
    const parentVMOptions = {
      resources: [
        {
          id: '1223',
          name: 'cfme029',
          location: '915334fb-d454-43ba-a3cc-1a52b3f3b98d.ovf',
        },
        {
          id: '1224',
          name: 'cfme086',
          location: '47014391-b41c-4ab0-ade4-b807c5387d7b.ovf',
        },
      ],
    };

    const parentTemplateOptions = {
      resources: [
        {
          id: '1270',
          name: 'rhel-guest-image-7.2',
          location: '959d0dfb-e06e-4269-934f-8d346eaa7a42.ovf',
        },
        {
          id: '1268',
          name: 'RHEL7_Base',
          location: '76e0d3aa-281c-4ec4-b6a7-947e6ffba448.ovf',
        },
      ],
    };

    const data = {
      action: 'edit',
      resource: {
        custom_1: 'test',
        description: 'test description',
        parent_resource: { href: `/api/vms/1224` },
        child_resources: [
          { href: `/api/templates/2983` },
          { href: `/api/templates/2600` },
          { href: `/api/templates/1270` },
        ],
      },
    };
    fetchMock.getOnce('/api/vms/?filter[]=ems_id=22&expand=resources', parentVMOptions);
    fetchMock.getOnce('/api/templates/?filter[]=ems_id=22&expand=resources', parentTemplateOptions);
    fetchMock.getOnce('/api/templates/2686?attributes=child_resources,parent_resource,custom_attributes', templateInitialValues);
    fetchMock.postOnce('/api/templates/2686', data);
    const wrapper = mount(<VmEditForm recordId="2686" emsId="22" displayName="Template" isTemplate />);
    expect(toJson(wrapper)).toMatchSnapshot();
    done();
  });
  it('should edit template with no parent and children', async(done) => {
    const parentVMOptions = {
      resources: [
        {
          id: '1223',
          name: 'cfme029',
          location: '915334fb-d454-43ba-a3cc-1a52b3f3b98d.ovf',
        },
        {
          id: '1224',
          name: 'cfme086',
          location: '47014391-b41c-4ab0-ade4-b807c5387d7b.ovf',
        },
      ],
    };

    const parentTemplateOptions = {
      resources: [
        {
          id: '1270',
          name: 'rhel-guest-image-7.2',
          location: '959d0dfb-e06e-4269-934f-8d346eaa7a42.ovf',
        },
        {
          id: '1268',
          name: 'RHEL7_Base',
          location: '76e0d3aa-281c-4ec4-b6a7-947e6ffba448.ovf',
        },
      ],
    };

    const data = {
      action: 'edit',
      resource: {
        custom_1: 'test',
        description: 'test description',
        parent_resource: null,
        child_resources: [],
      },
    };

    fetchMock.getOnce('/api/vms/?filter[]=ems_id=22&expand=resources', parentVMOptions);
    fetchMock.getOnce('/api/templates/?filter[]=ems_id=22&expand=resources', parentTemplateOptions);
    fetchMock.getOnce('/api/templates/2686?attributes=child_resources,parent_resource,custom_attributes', templateInitialValues);
    fetchMock.postOnce('/api/templates/2686', data);
    const wrapper = mount(<VmEditForm recordId="2686" emsId="22" displayName="Template" isTemplate />);
    expect(toJson(wrapper)).toMatchSnapshot();
    done();
  });
});
