class ApplicationHelper::Toolbar::UserCenter < ApplicationHelper::Toolbar::Basic
  button_group('user_vmdb', [
    select(
      :user_vmdb_choice,
      'fa fa-cog fa-lg',
      t = N_('Configuration'),
      t,
      :items => [
        button(
          :rbac_user_edit,
          'pficon pficon-edit fa-lg',
          t = N_('Edit this User'),
          t,
          :data => {
            'function'      => 'sendDataWithRx',
            'function-data' => { :rbacRouting => { :type => "rbac-user-edit" } }
          }
        ),
        button(
          :rbac_user_copy,
          'fa fa-files-o fa-lg',
          t = N_('Copy this User to a new User'),
          t,
          :klass => ApplicationHelper::Button::RbacUserCopy,
          :data  => {
            'function'      => 'sendDataWithRx',
            'function-data' => { :rbacRouting => { :type => "rbac-user-copy" } }
          }
        ),
        button(
          :rbac_user_delete,
          'pficon pficon-delete fa-lg',
          t = N_('Delete this User'),
          t,
          :url_parms => "&refresh=y",
          :confirm   => N_("Are you sure you want to delete this User?"),
          :klass     => ApplicationHelper::Button::RbacUserDelete,
          :data      => {
            'function'      => 'sendDataWithRx',
            'function-data' => { :rbacRouting => { :type => "rbac-user-delete" } }
          }
        ),
      ]
    ),
  ])
  button_group('rbac_user_policy', [
    select(
      :rbac_user_policy_choice,
      'fa fa-shield fa-lg',
      t = N_('Policy'),
      t,
      :items => [
        button(
          :rbac_user_tags_edit,
          'pficon pficon-edit fa-lg',
          t = proc do
            _('Edit \'%{customer_name}\' Tags for this User') % {:customer_name => @view_context.session[:customer_name]}
          end,
          t,
          :data => {
            'function'      => 'sendDataWithRx',
            'function-data' => { :rbacRouting => { :type => "rbac-user-tags" } }
          }
        ),
      ]
    ),
  ])
end
