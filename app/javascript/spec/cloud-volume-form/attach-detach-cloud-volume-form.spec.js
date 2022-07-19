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

  it('should render attach form variant', async(done) => {
    let wrapper;
    await act(async() => {
      wrapper = mount(<AttachDetachCloudVolumeForm recordId="1" vmChoices={sampleVmChoice} />);
    });

    setImmediate(() => {
      wrapper.update();
      expect(toJson(wrapper)).toMatchSnapshot();
      done();
    });
  });

  it('should render detach form variant', async(done) => {
    let wrapper;
    await act(async() => {
      wrapper = mount(<AttachDetachCloudVolumeForm isAttach={false} recordId="1" vmChoices={sampleVmChoice} />);
    });

    setImmediate(() => {
      wrapper.update();
      expect(toJson(wrapper)).toMatchSnapshot();
      done();
    });
  });
});
