import React from 'react';
import toJson from 'enzyme-to-json';
import fetchMock from 'fetch-mock';
import { shallow } from 'enzyme';
import { act } from 'react-dom/test-utils';
import { mount } from '../helpers/mountForm';
import VmResizeForm from '../../components/vm-resize-form/vm-resize-form';

require('../helpers/miqSparkle.js');

describe('vm resize form component', () => {
  const response = {
    data: {
      form_schema: {
        fields: [
          {
            component: 'text-field',
            name: 'memory',
            id: 'memory',
            label: _('Memory (GiB)'),
            initialValue: 2,
            isRequired: true,
            validate: [{ type: 'required' }],
          },
        ],
      },
    },
  };

  beforeEach(() => {
    fetchMock.once('/api/vms/1?option_action=resize', response);
  });

  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  it('should render form', () => {
    const wrapper = shallow(<VmResizeForm />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render a resize form', async(done) => {
    let wrapper;
    await act(async() => {
      wrapper = mount(<VmResizeForm recordId="1" vmCloudResizeFormId="53" />);
    });

    setImmediate(() => {
      wrapper.update();
      expect(toJson(wrapper)).toMatchSnapshot();
      done();
    });
  });

  it('should submit resize API call', async(done) => {
    const submitData = {
      action: 'resize',
      resource: {
        resizeValues: { flavor: 'bh1-16x1600' },
      },
      resizeFormId: '53',
    };
    fetchMock.postOnce('/api/vms/1', submitData);
    let wrapper;
    await act(async() => {
      wrapper = mount(<VmResizeForm recordId="1" vmCloudResizeFormId="53" />);
    });
    expect(toJson(wrapper)).toMatchSnapshot();
    done();
  });
});
