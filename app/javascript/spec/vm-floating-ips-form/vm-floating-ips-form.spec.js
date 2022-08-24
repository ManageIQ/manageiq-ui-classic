import React from 'react';
import toJson from 'enzyme-to-json';
import fetchMock from 'fetch-mock';
import { shallow } from 'enzyme';
import { act } from 'react-dom/test-utils';
import VmFloatingIPsForm from '../../components/vm-floating-ips/vm-floating-ips-form';
import { mount } from '../helpers/mountForm';

describe('Associate / Disassociate form component', () => {
  const sampleFloatingIpChoice = [
    ['1.2.3.4', 1],
    ['2.3.4.5', 2],
    ['3.4.5.6', 3],
    ['4.5.6.7', 4],
    ['5.6.7.8', 5],
  ];

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
      wrapper = mount(<VmFloatingIPsForm recordId="1" isAssociat options={sampleFloatingIpChoice} />);
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
      wrapper = mount(<VmFloatingIPsForm recordId="1" isAssociat={false} options={sampleFloatingIpChoice} />);
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
    fetchMock.postOnce('/api/vms/1', submitData);
    const wrapper = mount(<VmFloatingIPsForm recordId="1" isAssociat options={sampleFloatingIpChoice} />);
    expect(toJson(wrapper)).toMatchSnapshot();
    done();
    fetchMock.reset();
    fetchMock.restore();
  });

  it('should submit Disassociate API call', async(done) => {
    const submitData = {
      action: 'disassociate',
      resource: {
        floating_ip: '1',
      },
    };
    fetchMock.postOnce('/api/vms/1', submitData);
    const wrapper = mount(<VmFloatingIPsForm recordId="1" isAssociat={false} options={sampleFloatingIpChoice} />);
    expect(toJson(wrapper)).toMatchSnapshot();
    done();
    fetchMock.reset();
    fetchMock.restore();
  });
});
