import React from 'react';
import toJson from 'enzyme-to-json';
import fetchMock from 'fetch-mock';
import { shallow } from 'enzyme';
import { act } from 'react-dom/test-utils';
import VmFloatingIPsForm from '../../components/vm-floating-ips/vm-floating-ips-form';
import { mount } from '../helpers/mountForm';

describe('Associate / Disassociate form component', () => {
  const samplerecordId = '1';
  const sampleCloudTennantId = {
    cloud_tenant_id: '2',
  };
  const sampleFloatingIpChoice = {
    resources: [
      { address: '1.2.3.4', id: 1 },
      { address: '2.3.4.5', id: 2 },
      { address: '3.4.5.6', id: 3 },
      { address: '4.5.6.7', id: 4 },
      { address: '5.6.7.8', id: 5 },
    ],
  };

  beforeEach(() => {
    fetchMock.get(`/api/vms/${samplerecordId}`, sampleCloudTennantId);
    fetchMock.get(`/api/floating_ips?expand=resources&filter[]=cloud_tenant_id=${sampleCloudTennantId.cloud_tenant_id}`, sampleFloatingIpChoice);
  });

  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  it('should render form', (done) => {
    const wrapper = shallow(<VmFloatingIPsForm />);
    setImmediate(() => {
      wrapper.update();
      expect(toJson(wrapper)).toMatchSnapshot();
      done();
    });
  });

  it('should render associate form variant', async(done) => {
    let wrapper;
    await act(async() => {
      wrapper = mount(<VmFloatingIPsForm recordId={samplerecordId} isAssociate />);
    });

    setImmediate(() => {
      wrapper.update();
      expect(toJson(wrapper)).toMatchSnapshot();
      done();
    });
  });

  it('should render disassociate form variant', async(done) => {
    let wrapper;
    await act(async() => {
      wrapper = mount(<VmFloatingIPsForm recordId={samplerecordId} isAssociate={false} />);
    });

    setImmediate(() => {
      wrapper.update();
      expect(toJson(wrapper)).toMatchSnapshot();
      done();
    });
  });

  /*
 * Submit Logic
 */

  it('should submit Associate API call', async(done) => {
    const submitData = {
      action: 'associate',
      resource: {
        floating_ip: '1',
      },
    };
    fetchMock.postOnce(`/api/vms/${samplerecordId}`, submitData);
    const wrapper = mount(<VmFloatingIPsForm recordId={samplerecordId} isAssociate />);
    expect(toJson(wrapper)).toMatchSnapshot();
    done();
  });

  it('should submit Disassociate API call', async(done) => {
    const submitData = {
      action: 'disassociate',
      resource: {
        floating_ip: '1',
      },
    };
    fetchMock.postOnce(`/api/vms/${samplerecordId}`, submitData);
    const wrapper = mount(<VmFloatingIPsForm recordId={samplerecordId} isAssociate={false} />);
    expect(toJson(wrapper)).toMatchSnapshot();
    done();
  });
});
