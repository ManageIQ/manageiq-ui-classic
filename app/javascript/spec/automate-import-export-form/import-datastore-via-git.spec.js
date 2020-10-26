import React from 'react';
import toJson from 'enzyme-to-json';
import fetchMock from 'fetch-mock';
import { shallow } from 'enzyme';

import ImportDatastoreViaGit from '../../components/automate-import-export-form/import-datastore-via-git';
import '../helpers/addFlash';
import { mount } from '../helpers/mountForm';

describe('Import datastore via git component', () => {
  it('should render correctly', () => {
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
    wrapper.find('input[name="git_url"]').simulate('change', { target: { value: 'http://' } });
    const button = wrapper.find('button');
    expect(button.props().disabled).toBe(true);
  });

  it('should call api correct endpoint after submit', (done) => {
    const flashSpy = jest.spyOn(window, 'add_flash');
    fetchMock.postOnce('/miq_ae_tools/retrieve_git_datastore', [{ message: 'Foo', level: 'Bar' }]);

    const wrapper = mount(<ImportDatastoreViaGit />);
    wrapper.find('input[name="git_url"]').simulate('change', { target: { value: 'http://' } });
    wrapper.find('form').simulate('submit');

    const expectedCall = expect.arrayContaining([
      '/miq_ae_tools/retrieve_git_datastore',
      expect.objectContaining({
        body: '{"git_url":"http://","git_verify_ssl":true}',
      }),
    ]);
    setImmediate(() => {
      expect(fetchMock.lastCall()).toEqual(expectedCall);
      expect(flashSpy).toHaveBeenCalledWith('Foo', 'Bar');
      done();
    });
  });
});
