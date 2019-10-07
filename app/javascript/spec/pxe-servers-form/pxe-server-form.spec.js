import React from 'react';
import { act } from 'react-dom/test-utils';
import { shallowToJson } from 'enzyme-to-json';
import fetchMock from 'fetch-mock';
import { shallow } from 'enzyme';

import '../helpers/miqFlashLater';
import '../helpers/sprintf';
import MiqFormRenderer from '../../forms/data-driven-form';
import PxeServersForm from '../../components/pxe-servers-form/pxe-server-form';
import { mount } from '../helpers/mountForm';
import '../helpers/miqSparkle';
import miqRedirectBack from '../../helpers/miq-redirect-back';

describe('PxeServersForm', () => {
  let initialProps;

  beforeEach(() => {
    initialProps = {};
  });

  afterEach(() => {
    fetchMock.reset();
  });

  it('should render correctly', () => {
    const wrapper = shallow(<PxeServersForm {...initialProps} />);
    expect(shallowToJson(wrapper)).toMatchSnapshot();
  });

  it('should render correctly in edit variant', async(done) => {
    fetchMock.getOnce('/api/pxe_servers/123?attributes=access_url,authentications,customization_directory,name,pxe_directory,pxe_menus,uri,windows_images_directory', { // eslint-disable-line max-len
      pxe_menus: [{ file_name: 'bar' }],
      authentications: [{ userid: 'Pepa', foo: 'bar' }],
    }).getOnce('/api/pxe_servers?expand=resources&filter[]=name=%27%27', { resources: [] });

    let wrapper;
    await act(async() => {
      wrapper = mount(<PxeServersForm {...initialProps} id="123" />);
    });
    /**
     * Should not render form until initial values are received
     */
    expect(wrapper.find(MiqFormRenderer)).toHaveLength(0);
    /**
     * wait for name async validation and state updates
     */
    wrapper.update();
    expect(wrapper.find(MiqFormRenderer)).toHaveLength(1);
    done();
  });

  it('should sucesfully call add action while editing', async(done) => {
    fetchMock
      .getOnce('/api/pxe_servers?expand=resources&filter[]=name=%27%27', { resources: [] })
      .getOnce('/api/pxe_servers?expand=resources&filter[]=name=%27my%20name%27', { resources: [] })
      .postOnce('/api/pxe_servers', {});

    const wrapper = mount(<PxeServersForm {...initialProps} />);
    const { form } = wrapper.find(MiqFormRenderer).children().children().children()
      .instance();
    /**
     * pause validation so we dont need async mocks
     */
    form.pauseValidation();
    wrapper.find('input#name').simulate('change', { target: { value: 'my name' } });
    form.change('uri', 'nfs://foo/bar');
    /**
     * unpause validation before final submit
     */
    form.resumeValidation();

    /**
     * wait for name async validation
     */
    setTimeout(async() => {
      await act(async() => {
        wrapper.update();
      });

      /**
       * wait for submit response
       */
      await act(async() => {
        wrapper.find('button').first().simulate('click');
      });

      const [_url, payload] = fetchMock.lastCall();
      expect(JSON.parse(payload.body)).toEqual({
        name: 'my name',
        uri: 'nfs://foo/bar',
        authentication: {},
      });
      done();
    }, 500);
  });

  it('should sucesfully call cancel add server action', async(done) => {
    fetchMock
      .getOnce('/api/pxe_servers?expand=resources&filter[]=name=%27%27', { resources: [] });

    let wrapper;
    await act(async() => {
      wrapper = mount(<PxeServersForm {...initialProps} />);
    });

    wrapper.find('button').last().simulate('click');
    expect(miqRedirectBack).toHaveBeenCalledWith('Add of new PXE Server was cancelled by the user', 'success', '/pxe/explorer');
    done();
  });

  it('should sucesfully call cancel edit server action', async(done) => {
    fetchMock.getOnce('/api/pxe_servers/123?attributes=access_url,authentications,customization_directory,name,pxe_directory,pxe_menus,uri,windows_images_directory', { // eslint-disable-line max-len
      pxe_menus: [{ file_name: 'bar' }],
      authentications: [],
      name: 'foo',
    }).getOnce('/api/pxe_servers?expand=resources&filter[]=name=%27%27', { resources: [] })
      .getOnce('/api/pxe_servers?expand=resources&filter[]=name=%27foo%27', { resources: [] });

    let wrapper;
    await act(async() => {
      wrapper = mount(<PxeServersForm {...initialProps} id="123" />);
    });

    wrapper.update();
    wrapper.find('button').last().simulate('click');
    expect(miqRedirectBack).toHaveBeenCalledWith('Edit of PXE Server foo was cancelled by the user', 'success', '/pxe/explorer');
    done();
  });
});
