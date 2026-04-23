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
import { asyncValidator } from '../../components/pxe-servers-form/pxe-server-form.schema';

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
    }).getOnce('/api/pxe_servers?expand=resources&filter[]=name==%27%27', { resources: [] });

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

  it('should successfully call add action while editing', async(done) => {
    fetchMock
      .getOnce('/api/pxe_servers?expand=resources&filter[]=name==%27%27', { resources: [] })
      .getOnce('/api/pxe_servers?expand=resources&filter[]=name==%27my%20name%27', { resources: [] })
      .postOnce('/api/pxe_servers', {});

    const wrapper = mount(<PxeServersForm {...initialProps} />);

    await act(async() => {
      wrapper.find('input[name="name"]').simulate('change', { target: { value: 'my name' } });
      wrapper.find('input[name="uri"]').simulate('change', { target: { value: 'nfs://foo/bar' } });
    });

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
        wrapper.find('form').simulate('submit');
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

  it('should successfully call cancel add server action', async(done) => {
    fetchMock
      .getOnce('/api/pxe_servers?expand=resources&filter[]=name==%27%27', { resources: [] });

    let wrapper;
    await act(async() => {
      wrapper = mount(<PxeServersForm {...initialProps} />);
    });

    wrapper.find('button.cds--btn--secondary').first().simulate('click');
    expect(miqRedirectBack).toHaveBeenCalledWith('Add of new PXE Server was cancelled by the user', 'success', '/pxe/explorer');
    done();
  });

  it('should successfully call cancel edit server action', async(done) => {
    fetchMock.getOnce('/api/pxe_servers/123?attributes=access_url,authentications,customization_directory,name,pxe_directory,pxe_menus,uri,windows_images_directory', { // eslint-disable-line max-len
      pxe_menus: [{ file_name: 'bar' }],
      authentications: [],
      name: 'foo',
    }).getOnce('/api/pxe_servers?expand=resources&filter[]=name==%27%27', { resources: [] })
      .getOnce('/api/pxe_servers?expand=resources&filter[]=name==%27foo%27', { resources: [] });

    let wrapper;
    await act(async() => {
      wrapper = mount(<PxeServersForm {...initialProps} id="123" />);
    });

    wrapper.update();
    wrapper.find('button.cds--btn--secondary').last().simulate('click');
    expect(miqRedirectBack).toHaveBeenCalledWith('Edit of PXE Server foo was cancelled by the user', 'success', '/pxe/explorer');
    done();
  });

  describe('asyncValidator on name field', () => {
    afterEach(() => {
      fetchMock.reset();
    });

    it('should allow a unique name', async() => {
      const name = 'foo';
      const expectedUrl = `/api/pxe_servers?expand=resources&filter[]=name==%27${name}%27`;

      fetchMock.getOnce(expectedUrl, { resources: [] });

      await expect(asyncValidator(name, null)).resolves.toBeUndefined();
    });

    it('should handle duplicate name validation', async() => {
      const name = 'foo';
      const id = 123;
      const expectedUrl = `/api/pxe_servers?expand=resources&filter[]=name==%27${name}%27`;

      fetchMock.getOnce(expectedUrl, {
        resources: [
          { id: 456, name: name }, // different server id
        ],
      });

      await expect(asyncValidator(name, id)).rejects.toBe('Name has already been taken');
    });

    it('should allow same name when editing the same server', async() => {
      const name = 'foo';
      const id = 123;
      const expectedUrl = `/api/pxe_servers?expand=resources&filter[]=name==%27${name}%27`;

      fetchMock.getOnce(expectedUrl, {
        resources: [
          { id: id, name: name }, // same server id
        ],
      });

      await expect(asyncValidator(name, id)).resolves.toBeUndefined();
    });

    it('should properly encode all special characters in name parameter', async() => {
      const name = "test &=%#?'\"/ name";
      const encodedName = encodeURIComponent(name);
      const expectedUrl = `/api/pxe_servers?expand=resources&filter[]=name==%27${encodedName}%27`;

      fetchMock.getOnce(expectedUrl, { resources: [] });

      await expect(asyncValidator(name, null)).resolves.toBeUndefined();
    });

    it('should handle duplicate name validation with encoded characters', async() => {
      const name = 'test & server';
      const id = 123;
      const encodedName = encodeURIComponent(name);
      const expectedUrl = `/api/pxe_servers?expand=resources&filter[]=name==%27${encodedName}%27`;

      fetchMock.getOnce(expectedUrl, {
        resources: [
          { id: 456, name: name }, // different server id
        ],
      });

      await expect(asyncValidator(name, id)).rejects.toBe('Name has already been taken');
    });

    it('should reject empty name', async() => {
      await expect(asyncValidator('', null)).rejects.toBe('Required');
      expect(fetchMock.calls().length).toBe(0);
    });

    it('should reject undefined name', async() => {
      await expect(asyncValidator(undefined, null)).rejects.toBe('Required');
      expect(fetchMock.calls().length).toBe(0);
    });

    it('should reject null name', async() => {
      await expect(asyncValidator(null, null)).rejects.toBe('Required');
      expect(fetchMock.calls().length).toBe(0);
    });
  });
});
