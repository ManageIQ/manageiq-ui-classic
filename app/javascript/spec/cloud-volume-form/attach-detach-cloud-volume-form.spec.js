import React from 'react';
import toJson from 'enzyme-to-json';
import fetchMock from 'fetch-mock';
import { shallow } from 'enzyme';
import { act } from 'react-dom/test-utils';
import AttachDetachCloudVolumeForm from '../../components/cloud-volume-form/attach-detach-cloud-volume-form';
import { mount } from '../helpers/mountForm';

describe('Attach / Detach form component', () => {
  const sampleVmChoice = [
    ['server1', 1],
    ['server2', 2],
    ['server3', 3],
    ['server4', 4],
    ['server5', 5],
  ];

  const response = {
    data: {
      form_schema: {
        fields: [
          {
            component: 'text-field',
            name: 'device_mountpoint',
            id: 'device_mountpoint',
            label: _('Device Mountpoint'),
            isRequired: true,
            validate: [{ type: 'required' }],
          },
        ],
      },
    },
  };

  beforeEach(() => {
    fetchMock
      .once('/api/cloud_volumes/1?option_action=attach', response);
  });

  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  it('should render form', (done) => {
    const wrapper = shallow(<AttachDetachCloudVolumeForm />);
    setImmediate(() => {
      wrapper.update();
      expect(toJson(wrapper)).toMatchSnapshot();
      done();
    });
  });

/* Steps to reach page tested:
  1. Storage > Volume
  2. Configuration > Attach / Detach to an Instance
*/
  it('should render Attach Selected Cloud Volume to an Instance form', async(done) => {
    let wrapper;
    await act(async() => {
      wrapper = mount(<AttachDetachCloudVolumeForm recordId="1" dropdownChoices={sampleVmChoice} dropdownLabel={"Instance"} />);
    });

    setImmediate(() => {
      wrapper.update();
      expect(toJson(wrapper)).toMatchSnapshot();
      done();
    });
  });

  it('should render Detach Selected Cloud Volume from an Instance form', async(done) => {
    let wrapper;
    await act(async() => {
      wrapper = mount(<AttachDetachCloudVolumeForm isAttach={false} recordId="1" dropdownChoices={sampleVmChoice} dropdownLabel={"Instance"} />);
    });

    setImmediate(() => {
      wrapper.update();
      expect(toJson(wrapper)).toMatchSnapshot();
      done();
    });
  });

/* Steps to reach page tested:
    1. Compute > Cloud > Instances
    2. Select an Instance that allows for attach/detach (Openstack, IBM Cloud, Amazon)
    3. Configuration > Attach / Detach a Cloud Volume from this Instance
*/
  it('should render Attach Cloud Volume to the Selected Instance form', async(done) => {
    let wrapper;
    await act(async() => {
      wrapper = mount(<AttachDetachCloudVolumeForm recordId="1" dropdownChoices={sampleVmChoice} dropdownLabel={"Volume"} />);
    });

    setImmediate(() => {
      wrapper.update();
      expect(toJson(wrapper)).toMatchSnapshot();
      done();
    });
  });

  it('should render Detach Cloud Volume from the Selected Instance form', async(done) => {
    let wrapper;
    await act(async() => {
      wrapper = mount(<AttachDetachCloudVolumeForm isAttach={false} recordId="1" dropdownChoices={sampleVmChoice} dropdownLabel={"Volume"} />);
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

  it('should submit Attach API call', async(done) => {
    const submitData = {
      "action": "attach",
      "resource": {
        "vm_id": "1",
        "device": "",
      }
    }
    fetchMock.postOnce('/api/cloud_volumes/1', submitData);
    const wrapper = mount(<AttachDetachCloudVolumeForm recordId="1" dropdownChoices={sampleVmChoice} dropdownLabel={"Instance"}/>);
    expect(toJson(wrapper)).toMatchSnapshot();
    done();
  });


  it('should submit Detach API call', async(done) => {
    const submitData = {
      "action": "attach",
      "resource": {
        "vm_id": "1",
        "device": "",
      }
    }
    fetchMock.postOnce('/api/cloud_volumes/1', submitData);
    const wrapper = mount(<AttachDetachCloudVolumeForm isAttach={false} recordId="1" dropdownChoices={sampleVmChoice} dropdownLabel={"Volume"}/>);
    expect(toJson(wrapper)).toMatchSnapshot();
    done();
  });
});
