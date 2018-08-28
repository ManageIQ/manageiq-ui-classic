class ApplicationHelper::Toolbar::UsersCenter < ApplicationHelper::Toolbar::Basic
  button_group('user_vmdb', [
    select(
      :user_vmdb_choice,
      'fa fa-cog fa-lg',
      t = N_('Configuration'),
      t,
      :items => [
        button(
          :rbac_user_add,
          'pficon pficon-add-circle-o fa-lg',
          t = N_('Add a new User'),
          t,
          :data => {
            'function' => 'sendDataWithRx',
            'function-data' => { rbacRouting: { "type": "rbac-user-list-add" } }
          }),
        button(
          :rbac_user_edit,
          'pficon pficon-edit fa-lg',
          N_('Select a single User to edit'),
          N_('Edit the selected User'),
          :send_checked => true,
          :enabled      => false,
          :onwhen       => "1",
          :data => {
            'function' => 'sendDataWithRx',
            'function-data' => { rbacRouting: { "type": "rbac-user-list-edit" } }
          }),
        button(
          :rbac_user_copy,
          'fa fa-files-o fa-lg',
          N_('Select a single User to copy'),
          N_('Copy the selected User to a new User'),
          :send_checked => true,
          :enabled      => false,
          :onwhen       => "1",
          :data => {
            'function' => 'sendDataWithRx',
            'function-data' => { rbacRouting: { "type": "rbac-user-list-copy" } }
          }),
        button(
          :rbac_user_delete,
          'pficon pficon-delete fa-lg',
          N_('Select one or more Users to delete'),
          N_('Delete selected Users'),
          :send_checked => true,
          :confirm      => N_("Delete all selected Users?"),
          :enabled      => false,
          :onwhen       => "1+",
          :data => {
            'function' => 'sendDataWithRx',
            'function-data' => { rbacRouting: { "type": "rbac-user-list-delete" } }
          }),
      ]
    ),
  ])
  button_group('rbac_user_policy', [
    select(
      :rbac_user_policy_choice,
      'fa fa-shield fa-lg',
      t = N_('Policy'),
      t,
      :enabled => false,
      :onwhen  => "1+",
      :items   => [
        button(
          :rbac_user_tags_edit,
          'pficon pficon-edit fa-lg',
          t = proc do
            _('Edit \'%{customer_name}\' Tags for the selected Users') % {:customer_name => @view_context.session[:customer_name]}
          end,
          t,
          :send_checked => true,
          :enabled      => false,
          :onwhen       => "1+",
          :data => {
            'function' => 'sendDataWithRx',
            'function-data' => { rbacRouting: { "type": "rbac-user-list-tags" } }
          }),
      ]
    ),
  ])
end