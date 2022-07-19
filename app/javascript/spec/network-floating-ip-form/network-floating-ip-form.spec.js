import React from 'react';
import fetchMock from 'fetch-mock';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import NetworkFloatingIPsForm from '../../components/network-floatingIPs-form/index';
import '../helpers/miqFlashLater';
import '../helpers/sprintf';
import '../helpers/miqSparkle';
import '../helpers/addFlash';

describe('Floating Ips Profile Form Component', () => {
  let initialProps;
  beforeEach(() => {
    initialProps = {
      ems: [{
        href: 'http://localhost:3000/api/providers/54',
        id: '54',
        name: 'RHV Network Manager',
        type: 'ManageIQ::Providers::Redhat::NetworkManager',
      }],
    };
  });

  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  it('should render correctly', (done) => {
    const wrapper = shallow(<NetworkFloatingIPsForm {...initialProps} />);

    setImmediate(() => {
      wrapper.update();
      expect(toJson(wrapper)).toMatchSnapshot();
      done();
    });
  });
});
