import { waitFor } from '@testing-library/react';
import fetchMock from 'fetch-mock';
import { renderWithRedux } from '../helpers/mountForm';
import '../helpers/miqSparkle';
import RbacRoleForm from '../../components/rbac-role-form';

describe('Rbac Role Form Component', () => {
  const RbacRoleEditData = {
    id: 90,
    name: 'test',
    settings: {
      restrictions: {
        vms: 'user',
        service_templates: 'user',
      },
    },
    miq_product_features: [{ identifier: 'add_global_filter' }],
  };

  const RbacRoleCopyData = {
    id: null,
    name: 'copy of test',
    settings: {
      restrictions: {
        vms: 'user',
        service_templates: 'user',
      },
    },
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

  const customProps = {
    bs_tree: JSON.stringify([{
      key: 'everything__everything',
      text: 'Everything',
      icon: 'pficon pficon-folder-close',
      nodes: [{
        key: '109__add_global_filter',
        text: 'Add Global Filter',
        icon: 'fa fa-shield',
      }],
    }]),
  };

  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  it('render add rbac role form', async() => {
    const { container } = renderWithRedux(
      <RbacRoleForm
        selectOptions={selectOptions}
        customProps={customProps}
        role={{ id: null, name: null }}
      />
    );

    await waitFor(() => {
      expect(container.querySelector('.rbac-role-form')).toBeInTheDocument();
    });
  });

  it('render edit rbac role form', async() => {
    fetchMock.get(`/api/roles/${RbacRoleEditData.id}?expand=resources&attributes=miq_product_features`, RbacRoleEditData);

    const { container } = renderWithRedux(
      <RbacRoleForm
        selectOptions={selectOptions}
        customProps={customProps}
        role={RbacRoleEditData}
      />
    );

    await waitFor(() => {
      expect(container.querySelector('.rbac-role-form')).toBeInTheDocument();
    });
  });

  it('render copy rbac role form', async() => {
    const { container } = renderWithRedux(
      <RbacRoleForm
        selectOptions={selectOptions}
        customProps={customProps}
        role={RbacRoleCopyData}
        existingProductFeatures={[{ identifier: 'add_global_filter' }]}
      />
    );

    await waitFor(() => {
      expect(container.querySelector('.rbac-role-form')).toBeInTheDocument();
    });
  });
});
