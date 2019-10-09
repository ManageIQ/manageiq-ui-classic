class ApplicationHelper::Toolbar::EmsCloudsCenter < ApplicationHelper::Toolbar::Basic
  button_group('ems_cloud_vmdb', [
    select(
      :ems_cloud_vmdb_choice,
      nil,
      t = N_('Configuration'),
      t,
      :items => [
        button(
          :ems_cloud_refresh,
          'fa fa-refresh fa-lg',
          N_('Refresh relationships and power states for all items related to the selected Cloud Providers'),
          N_('Refresh Relationships and Power States'),
          :url_parms    => "main_div",
          :send_checked => true,
          :confirm      => N_("Refresh relationships and power states for all items related to the selected Cloud Providers?"),
          :enabled      => false,
          :onwhen       => "1+"),
        separator,
        button(
          :ems_cloud_new,
          'pficon pficon-add-circle-o fa-lg',
          t = N_('Add a New Cloud Provider'),
          t,
          :url   => "/new",
          :klass => ApplicationHelper::Button::ButtonNewDiscover),
        button(
          :ems_cloud_edit,
          'pficon pficon-edit fa-lg',
          N_('Select a single Cloud Provider to edit'),
          N_('Edit Selected Cloud Provider'),
          :url_parms    => "main_div",
          :send_checked => true,
          :enabled      => false,
          :onwhen       => "1"),
        button(
          :ems_cloud_delete,
          'pficon pficon-delete fa-lg',
          N_('Remove selected Cloud Providers from Inventory'),
          N_('Remove Cloud Providers from Inventory'),
          :url_parms    => "main_div",
          :send_checked => true,
          :confirm      => N_("Warning: The selected Cloud Providers and ALL related components will be permanently removed!"),
          :enabled      => false,
          :onwhen       => "1+"),
      ]
    ),
  ])
  button_group('ems_cloud_policy', [
    select(
      :ems_cloud_policy_choice,
      nil,
      t = N_('Policy'),
      t,
      :enabled => false,
      :onwhen  => "1+",
      :items   => [
        button(
          :ems_cloud_protect,
          'pficon pficon-edit fa-lg',
          N_('Manage Policies for the selected Cloud Providers'),
          N_('Manage Policies'),
          :url_parms    => "main_div",
          :send_checked => true,
          :enabled      => false,
          :onwhen       => "1+"),
        button(
          :ems_cloud_tag,
          'pficon pficon-edit fa-lg',
          N_('Edit Tags for the selected Cloud Providers'),
          N_('Edit Tags'),
          :url_parms    => "main_div",
          :send_checked => true,
          :enabled      => false,
          :onwhen       => "1+"),
        button(
          :ems_cloud_check_compliance,
          'fa fa-search fa-lg',
          N_('Check Compliance of the last known configuration for these Cloud Managers'),
          N_('Check Compliance of Last Known Configuration'),
          :url_parms    => "main_div",
          :send_checked => true,
          :confirm      => N_("Initiate Check Compliance of the last known configuration for the selected items?"),
          :enabled      => "false",
          :onwhen       => "1+")
      ]
    ),
  ])
  button_group('ems_cloud_authentication', [
    select(
      :ems_cloud_authentication_choice,
      'fa fa-lock fa-lg',
      t = N_('Authentication'),
      t,
      :enabled => false,
      :onwhen  => "1+",
      :items   => [
        button(
          :ems_cloud_recheck_auth_status,
          'fa fa-search fa-lg',
          N_('Re-check Authentication Status for the selected Cloud Providers'),
          N_('Re-check Authentication Status'),
          :url_parms    => "main_div",
          :send_checked => true,
          :enabled      => false,
          :onwhen       => "1+"),
          ]
      ),
  ])
end
