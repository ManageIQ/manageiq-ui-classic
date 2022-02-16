import React from 'react';
import toJson from 'enzyme-to-json';
import fetchMock from 'fetch-mock';
import { shallow } from 'enzyme';
import { act } from 'react-dom/test-utils';
import HostAggregateForm from '../../components/host-aggregate-form';
import AddRemoveHostAggregateForm from '../../components/host-aggregate-form/add-remove-host-aggregate-form'
import { mount } from '../helpers/mountForm';
import miqRedirectBack from '../../helpers/miq-redirect-back';

require('../helpers/miqSparkle.js');
require('../helpers/miqAjaxButton.js');

describe('Host aggregate form component', () => {
  const emsList = {
    resources: [
      { name: 'name1', id: 1 },
      { name: 'name2', id: 2 },
    ],
  };

  beforeEach(() => {
    fetchMock
      .mock('/api/providers?expand=resources&attributes=id,name,supports_create_host_aggregate&filter[]=supports_create_host_aggregate=true', emsList);
  });

  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  const values = {
    name: 'key1',
    availability_zone: 1,
    ems_id: 2,
  };

  it('should render adding form variant', (done) => {
    const wrapper = shallow(<HostAggregateForm />);
    setImmediate(() => {
      wrapper.update();
      expect(toJson(wrapper)).toMatchSnapshot();
      done();
    });
  });

  it('should render editing form variant', async(done) => {
    fetchMock.getOnce('/api/host_aggregates/1', values);
    let wrapper;
    await act(async() => {
      wrapper = mount(<HostAggregateForm recordId="1" />);
    });
    expect(fetchMock.called('/api/host_aggregates/1')).toBe(true);
    expect(toJson(wrapper)).toMatchSnapshot();
    done();
  });

  it('should call miqRedirectBack when canceling create form', async(done) => {
    let wrapper;
    await act(async() => {
      wrapper = mount(<HostAggregateForm />);
    });
    wrapper.find('button').last().simulate('click');
    expect(miqRedirectBack).toHaveBeenCalledWith('Creation of new Host Aggregate was canceled by the user.', 'warning', '/host_aggregate/show_list');
    done();
  });

  it('should render add host form', (done) => {
    const wrapper = shallow(<AddRemoveHostAggregateForm />);
    setImmediate(() => {
      wrapper.update();
      expect(toJson(wrapper)).toMatchSnapshot();
      done();
    });
  });

  it('should render add host form variant (remvove host)', (done) => {
    const wrapper = mount(<AddRemoveHostAggregateForm isAdd={false} />);
    setImmediate(() => {
      wrapper.update();
      expect(toJson(wrapper)).toMatchSnapshot();
      done();
    });
  });

  it('should call miqRedirectBack when canceling add host form', async(done) => {
    let wrapper;
    await act(async() => {
      wrapper = mount(<AddRemoveHostAggregateForm />);
    });
    wrapper.find('button').last().simulate('click');
    expect(miqRedirectBack).toHaveBeenCalledWith('Addition of Host was cancelled by the user.', 'warning', '/host_aggregate/show_list');
    done();
  });

  it('should call miqRedirectBack when canceling remove host form', async(done) => {
    let wrapper;
    await act(async() => {
      wrapper = mount(<AddRemoveHostAggregateForm isAdd={false} />);
    });
    wrapper.find('button').last().simulate('click');
    expect(miqRedirectBack).toHaveBeenCalledWith('Removal of Host was cancelled by the user.', 'warning', '/host_aggregate/show_list');
    done();
  });
});
