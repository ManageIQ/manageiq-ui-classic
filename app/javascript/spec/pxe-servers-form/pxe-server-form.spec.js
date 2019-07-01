import React from 'react';
import { shallow, mount } from 'enzyme';
import { shallowToJson } from 'enzyme-to-json';
import fetchMock from 'fetch-mock';

import '../helpers/miqSparkle';
import '../helpers/miqFlashLater';
import '../helpers/sprintf';
import MiqFormRenderer from '../../forms/data-driven-form';
import PxeServersForm from '../../components/pxe-servers-form/pxe-server-form';

describe('PxeServersForm', () => {
  let initialProps;

  beforeEach(() => {
    initialProps = {};
  });

  afterEach(() => {
    fetchMock.reset();
  });

  it('should render correctly', () => {
    const wrapper = shallow(<PxeServersForm {...initialProps} />).dive();
    expect(shallowToJson(wrapper)).toMatchSnapshot();
  });

  it('should render correctly in edit variant', (done) => {
    fetchMock.getOnce('/api/pxe_servers/123?attributes=access_url,authentications,customization_directory,name,pxe_directory,pxe_menus,uri,windows_images_directory', { // eslint-disable-line max-len
      pxe_menus: [{ file_name: 'bar' }],
      authentications: [{ userid: 'Pepa', foo: 'bar' }],
    }).getOnce('/api/pxe_servers?expand=resources&filter[]=name=%27%27', { resources: [] });

    const wrapper = mount(<PxeServersForm {...initialProps} id="123" />);
    /**
     * Should not render form until initial values are received
     */
    expect(wrapper.find(MiqFormRenderer)).toHaveLength(0);
    /**
     * wait for name async validation and state updates
     */
    setTimeout(() => {
      wrapper.update();
      expect(wrapper.find(MiqFormRenderer)).toHaveLength(1);
      done();
    }, 500);
  });

  it('should sucesfully call add action while editing', (done) => {
    fetchMock
      .getOnce('/api/pxe_servers?expand=resources&filter[]=name=%27%27', { resources: [] })
      .getOnce('/api/pxe_servers?expand=resources&filter[]=name=%27my%20name%27', { resources: [] })
      .postOnce('/api/pxe_servers', {});

    const wrapper = mount(<PxeServersForm {...initialProps} />);
    const { form } = wrapper.find(MiqFormRenderer).children().children().instance();
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
    wrapper.update();
    /**
     * wait for name async validation
     */
    setTimeout(() => {
      wrapper.find('button').first().simulate('click');
      /**
       * wait for submit response
       */
      setImmediate(() => {
        const [_url, payload] = fetchMock.lastCall();
        expect(JSON.parse(payload.body)).toEqual({
          name: 'my name',
          uri: 'nfs://foo/bar',
          authentication: {},
        });
        done();
      });
    }, 500);
  });

  it('should sucesfully call cancel add server action', (done) => {
    const flashSpy = jest.spyOn(window, 'miqFlashLater');
    fetchMock
      .getOnce('/api/pxe_servers?expand=resources&filter[]=name=%27%27', { resources: [] });

    const wrapper = mount(<PxeServersForm {...initialProps} />);
    setTimeout(() => {
      wrapper.find('button').last().simulate('click');
      expect(flashSpy).toHaveBeenCalledWith({ level: 'success', message: 'Add of new PXE Server was cancelled by the user' });
      done();
    }, 500);
  });

  it('should sucesfully call cancel edit server action', (done) => {
    const flashSpy = jest.spyOn(window, 'miqFlashLater');
    fetchMock.getOnce('/api/pxe_servers/123?attributes=access_url,authentications,customization_directory,name,pxe_directory,pxe_menus,uri,windows_images_directory', { // eslint-disable-line max-len
      pxe_menus: [{ file_name: 'bar' }],
      authentications: [],
      name: 'foo',
    }).getOnce('/api/pxe_servers?expand=resources&filter[]=name=%27%27', { resources: [] })
      .getOnce('/api/pxe_servers?expand=resources&filter[]=name=%27foo%27', { resources: [] });

    const wrapper = mount(<PxeServersForm {...initialProps} id="123" />);
    setTimeout(() => {
      wrapper.update();
      wrapper.find('button').last().simulate('click');
      expect(flashSpy).toHaveBeenCalledWith({ level: 'success', message: 'Edit of PXE Server foo was cancelled by the user' });
      done();
    }, 500);
  });
});
