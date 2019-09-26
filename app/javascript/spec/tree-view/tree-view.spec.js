import React from 'react';
import { mount } from '../helpers/mountForm';
import { HierarchicalTreeView } from '../../components/tree-view';

ManageIQ.redux.addReducer = ManageIQ.redux.store.injectReducers;

describe('Tree View component', () => {
  const props = {
    allow_reselect: false,
    bs_tree: JSON.stringify([
      {
        key: 'root',
        text: 'Providers',
        tooltip: '',
        icon: 'pficon pficon-folder-open',
        hideCheckbox: true,
        class: 'no-cursor',
        selectable: false,
        state: { expanded: true },
        nodes: [
          {
            key: 'e-38',
            text: 'Amazon',
            tooltip: 'Ems Cloud: Amazon',
            image: '/assets/svg/vendor-ec2-04c432db85be0fd670cd6da83b8685dab51e1b7a63258b70cccbdf8d7f72c988.svg',
            selectable: true,
            state: { checked: false, expanded: false },
          },
          {
            key: 'e-40',
            text: 'Amazon EBS Storage Manager',
            tooltip: 'Provider: Amazon EBS Storage Manager',
            image: '/assets/svg/vendor-ec2_ebs_storage-04c432db85be0fd670cd6da83b8685dab51e1b7a63258b70cccbdf8d7f72c988.svg',
            selectable: true,
            state: { checked: false, expanded: false },
          },
          {
            key: 'e-39',
            text: 'Amazon Network Manager',
            tooltip: 'Provider: Amazon Network Manager',
            image: '/assets/svg/vendor-ec2_network-04c432db85be0fd670cd6da83b8685dab51e1b7a63258b70cccbdf8d7f72c988.svg',
            selectable: true,
            state: { checked: false, expanded: false },
          },
          {
            key: 'at-19',
            text: 'Ansible Tower Automation Manager',
            tooltip: 'Provider: Ansible Tower Automation Manager',
            image: '/assets/svg/vendor-ansible-53cf0c18065b8e2c8b99cbde9dca3ac9245ec363b700af6e9fd2bc5b743c85a9.svg',
            selectable: true,
            state: { checked: false, expanded: false },
          },
          {
            key: 'e-3',
            text: 'Azure (East US)',
            tooltip: 'Ems Cloud: Azure (East US)',
            image: '/assets/svg/vendor-azure-9e2644144afcc98aa84451aee955851b15e6409a916d9054849b3a136a1f4887.svg',
            selectable: true,
            state: { checked: true, expanded: false },
          },
        ],
      },
    ]),
    checkboxes: true,
    tree_id: 'object_treebox',
    tree_name: 'object_tree',
  };

  it('should mount to the correct redux store', () => {
    mount(<HierarchicalTreeView {...props} />);
    expect(ManageIQ.redux.store.getState().tree_object_tree).toBeTruthy();
  });
});
