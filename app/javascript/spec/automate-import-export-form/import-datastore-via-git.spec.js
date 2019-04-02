import React from 'react';
import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import fetchMock from 'fetch-mock';
import ImportDatastoreViaGit from '../../components/automate-import-export-form/import-datastore-via-git';
import '../helpers/addFlash';

describe('Import datastore via git component', () => {
  /**
   * Shallow rendering is broken for some reason on newer version of jest
   * mount snapshoting works but has thousands of lines
   */
  it.skip('should render correctly', () => {
    const wrapper = shallow(<ImportDatastoreViaGit />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should have submit button disabled when url is not valid', () => {
    const wrapper = mount(<ImportDatastoreViaGit />);
    const button = wrapper.find('button');
    expect(button.props().disabled).toBe(true);
  });

  it('should have submit button always disabled', () => {
    const wrapper = mount(<ImportDatastoreViaGit disableSubmit />);
    wrapper.find('input#git_url').simulate('change', { target: { value: 'http://' } });
    const button = wrapper.find('button');
    expect(button.props().disabled).toBe(true);
  });

  it('should call api correct endpoint after submit', (done) => {
    const flashSpy = jest.spyOn(window, 'add_flash');
    fetchMock.postOnce('/miq_ae_tools/retrieve_git_datastore', [{ message: 'Foo', level: 'Bar' }]);

    const wrapper = mount(<ImportDatastoreViaGit />);
    wrapper.find('input#git_url').simulate('change', { target: { value: 'http://' } });
    wrapper.find('button').simulate('click');

    const expectedCall = expect.arrayContaining([
      '/miq_ae_tools/retrieve_git_datastore',
      expect.objectContaining({
        body: '{"git_verify_ssl":true,"git_url":"http://"}',
      }),
    ]);
    setImmediate(() => {
      expect(fetchMock.lastCall()).toEqual(expectedCall);
      expect(flashSpy).toHaveBeenCalledWith('Foo', 'Bar');
      done();
    });
  });
});
