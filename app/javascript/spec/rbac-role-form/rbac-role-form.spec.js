import React from 'react';
import { shallow } from 'enzyme';
import fetchMock from 'fetch-mock';
import toJson from 'enzyme-to-json';
import RbacRoleForm from '../../components/rbac-role-form';

describe('Rbac Role Form Component', () => {
  const rbacRoleMockData = [
    {
      href: `/ops/rbac_role_add/90/`,
      id: '90',
      name: 'test',
      vm_restriction: 'user_or_group',
      service_template_restriction: 'user_or_group',
      featureswithId: ['109__add_global_filter#1433'],
    },
  ];

  const RbacRoleEditData = {
    id: '90',
    name: 'test',
    vm_restriction: 'user',
    service_template_restriction: 'user',
    featureswithId: ['109__add_global_filter#1433'],
  };

  const RbacRoleCopyData = {
    id: '90',
    name: 'copy of test',
    vm_restriction: 'user',
    service_template_restriction: 'user',
    featureswithId: ['109__add_global_filter#1433'],
  };

  const selectOptions = [
    [
      '-1', "<#{_('None')}>",
    ],
    [
      'user', 'Only User Owned',
    ],
    [
      'user_or_group', 'Only User Owned or Group Owned',
    ],
  ];

  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  it('render add rbac role form', async() => {
    const wrapper = shallow(<RbacRoleForm
      selectOptions={selectOptions}
    />);

    fetchMock.get(`/ops/rbac_role_add/`, rbacRoleMockData);

    await new Promise((resolve) => {
      setImmediate(() => {
        wrapper.update();
        expect(toJson(wrapper)).toMatchSnapshot();
        resolve();
      });
    });
  });

  it('render edit rbac role form', async() => {
    const wrapper = shallow(<RbacRoleForm
      selectOptions={selectOptions}
      role={RbacRoleEditData}
    />);

    fetchMock.get(`/ops/rbac_role_edit_get/${RbacRoleEditData.id}`, RbacRoleEditData);
    await new Promise((resolve) => {
      setImmediate(() => {
        wrapper.update();
        expect(toJson(wrapper)).toMatchSnapshot();
        resolve();
      });
    });
  });

  it('render copy rbac role form', async() => {
    const wrapper = shallow(<RbacRoleForm
      selectOptions={selectOptions}
      role={RbacRoleCopyData}
    />);
    fetchMock.get(`/ops/rbac_role_copy/`, RbacRoleCopyData);

    await new Promise((resolve) => {
      setImmediate(() => {
        wrapper.update();
        expect(toJson(wrapper)).toMatchSnapshot();
        resolve();
      });
    });
  });
});