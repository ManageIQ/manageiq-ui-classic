import React from 'react';
import toJson from 'enzyme-to-json';
import fetchMock from 'fetch-mock';
import { shallow } from 'enzyme';
import AnsibleRepositoryForm from '../../components/ansible-repository-form';

require('../helpers/set_fixtures_helper.js');
require('../helpers/old_js_file_require_helper.js');
require('../helpers/miqSparkle.js');
require('../helpers/miqAjaxButton.js');

jest.mock('../../helpers/miq-redirect-back', () => jest.fn());

describe('Ansible Repository form component', () => {
  let submitSpyMiqSparkleOn;
  let submitSpyMiqSparkleOff;

  const attributes = ['name', 'description', 'scm_url', 'verify_ssl', 'authentication_id', 'scm_branch'];

  const repositoryMock = {
    authentication_id: null,
    description: 'playbooks for testing',
    href: 'http://localhost:3000/api/configuration_script_sources/23',
    id: '23',
    name: 'avaleror_test',
    scm_branch: '',
    scm_url: 'https://github.com/avaleror/ansible',
    verify_ssl: 0,
  };

  beforeEach(() => {
    submitSpyMiqSparkleOn = jest.spyOn(window, 'miqSparkleOn');
    submitSpyMiqSparkleOff = jest.spyOn(window, 'miqSparkleOff');
  });

  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
    submitSpyMiqSparkleOn.mockRestore();
    submitSpyMiqSparkleOff.mockRestore();
  });

  it('should render add form', (done) => {
    const wrapper = shallow(<AnsibleRepositoryForm />);

    setImmediate(() => {
      wrapper.update();
      expect(toJson(wrapper)).toMatchSnapshot();
      done();
    });
  });

  it('should render edit variant', async(done) => {
    fetchMock.get(`/api/configuration_script_sources/23?attributes=${attributes.join(',')}`, repositoryMock);
    const wrapper = shallow(<AnsibleRepositoryForm repositoryId="31" />);

    setImmediate(() => {
      wrapper.update();
      expect(toJson(wrapper)).toMatchSnapshot();
      done();
    });
  });

  it('should submit add form', async(done) => {
    const wrapper = shallow(<AnsibleRepositoryForm />);
    const data = {
      authentication_id: '149',
      description: 'playbooks for testing',
      name: 'avaleror_test',
      scm_branch: '',
      scm_url: 'https://github.com/avaleror/ansible',
      verify_ssl: true,
      manager_provider: { href: 'http://localhost:3000/api/providers/2' },
    };
    fetchMock.postOnce('/api/configuration_script_sources/', data);
    setImmediate(() => {
      wrapper.update();
      expect(toJson(wrapper)).toMatchSnapshot();
      done();
    });
  });

  it('should submit edit form', async(done) => {
    const wrapper = shallow(<AnsibleRepositoryForm />);
    fetchMock.get(`/api/configuration_script_sources/23?attributes=${attributes.join(',')}`, repositoryMock);
    const data = {
      authentication_id: null,
      description: 'playbooks for testing',
      name: 'avaleror_test1',
      scm_branch: '',
      scm_url: 'https://github.com/avaleror/ansible',
      verify_ssl: false,
    };
    fetchMock.postOnce('/api/configuration_script_sources/23', data);
    setImmediate(() => {
      wrapper.update();
      expect(toJson(wrapper)).toMatchSnapshot();
      done();
    });
  });
});
