class ApplicationHelper::Toolbar::CloudTenantsCenter < ApplicationHelper::Toolbar::Basic
  button_group('cloud_tenant_vmdb', [
    select(
      :cloud_tenant_vmdb_choice,
      nil,
      t = N_('Configuration'),
      t,
      :items => [
        button(
          :cloud_tenant_new,
          'pficon pficon-add-circle-o fa-lg',
          t = N_('Create Cloud Tenant'),
          t,
          :klass => ApplicationHelper::Button::NewCloudTenant),
        button(
          :cloud_tenant_edit,
          'pficon pficon-edit fa-lg',
          N_('Select a single Cloud Tenant to edit'),
          N_('Edit Selected Cloud Tenant'),
          :url_parms    => "main_div",
          :send_checked => true,
          :enabled      => false,
          :onwhen       => "1"),
        button(
          :cloud_tenant_delete,
          'pficon pficon-delete fa-lg',
          N_('Delete selected Cloud Tenants'),
          N_('Delete Cloud Tenants'),
          :url_parms    => "main_div",
          :send_checked => true,
          :confirm      => N_("Warning: The selected Cloud Tenants will be permanently deleted!"),
          :enabled      => false,
          :onwhen       => "1+"),
      ]
    ),
  ])
  button_group('cloud_tenant_policy', [
    select(
      :cloud_tenant_policy_choice,
      nil,
      t = N_('Policy'),
      t,
      :enabled => false,
      :onwhen  => "1+",
      :items   => [
        button(
          :cloud_tenant_tag,
          'pficon pficon-edit fa-lg',
          N_('Edit tags for the selected items'),
          N_('Edit Tags'),
          :url_parms    => "main_div",
          :send_checked => true,
          :enabled      => false,
          :onwhen       => "1+"),
      ]
    ),
  ])
end
