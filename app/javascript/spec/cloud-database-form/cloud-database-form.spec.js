import React from 'react';
import toJson from 'enzyme-to-json';
import fetchMock from 'fetch-mock';
import { shallow } from 'enzyme';
import { act } from 'react-dom/test-utils';
import CloudDatabaseForm from '../../components/cloud-database-form/cloud-database-form';
import { mount } from '../helpers/mountForm';
import miqRedirectBack from '../../helpers/miq-redirect-back';

describe('Cloud Database form component', () => {
  const dropdownOptions = {
    resources: [
      { name: 'Blue', id: '1' },
      { name: 'Yellow', id: '2' },
      { name: 'Green', id: '3' },
    ],
  };

  const initialData = {
    ems_id: '1',
  };

  const response = {
    data: {
      form_schema: {
        fields: [
          {
            component: 'text-field',
            name: 'Sample Component',
            id: 'sample_component',
            label: _('Sample Component'),
            isRequired: true,
            validate: [{ type: 'required' }],
          },
        ],
      },
    },
  };

  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  it('should render "Add New" form', (done) => {
    const wrapper = shallow(<CloudDatabaseForm />);
    setImmediate(() => {
      wrapper.update();
      expect(toJson(wrapper)).toMatchSnapshot();
      done();
    });
  });

  it('should render "Edit" form', async(done) => {
    fetchMock.once('/api/cloud_databases/1', initialData);
    fetchMock.once('/api/cloud_databases/1?ems_id=1', response);
    fetchMock.mock('/api/providers?expand=resources&attributes=id,name,supports_cloud_database_create,type&filter[]=supports_cloud_database_create=true', dropdownOptions);
    let wrapper;
    await act(async() => {
      wrapper = mount(<CloudDatabaseForm recordId="1" />);
    });

    setImmediate(() => {
      wrapper.update();
      expect(toJson(wrapper)).toMatchSnapshot();
      done();
    });
  });

  it('should call miqRedirectBack when canceling "Add New" form', async(done) => {
    fetchMock.mock('/api/providers?expand=resources&attributes=id,name,supports_cloud_database_create,type&filter[]=supports_cloud_database_create=true', dropdownOptions);
    let wrapper;
    await act(async() => {
      wrapper = mount(<CloudDatabaseForm />);
    });
    wrapper.find('button').last().simulate('click');

    expect(miqRedirectBack).toHaveBeenCalledWith('Creation of new Cloud Database was canceled by the user.', 'warning', '/cloud_database/show_list');
    done();
  });
});
