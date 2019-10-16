class ApplicationHelper::Toolbar::EmsPhysicalInfrasCenter < ApplicationHelper::Toolbar::Basic
  button_group('ems_physical_infra_vmdb', [
    select(
      :ems_physical_infra_vmdb_choice,
      nil,
      t = N_('Configuration'),
      t,
      :items => [
        button(
          :ems_physical_infra_refresh,
          'fa fa-refresh fa-lg',
          N_('Refresh relationships and power states for all items related to the selected Physical Infrastructure Providers'),
          N_('Refresh Relationships and Power States'),
          :url_parms    => "main_div",
          :send_checked => true,
          :confirm      => N_("Refresh relationships and power states for all items related to the selected Physical Infrastructure Providers?"),
          :enabled      => false,
          :onwhen       => "1+"),
        button(
          :ems_physical_infra_discover,
          'fa fa-search fa-lg',
          t = N_('Discover Physical Infrastructure Providers'),
          t,
          :url       => "/discover",
          :url_parms => "?discover_type=ems"),
        separator,
        button(
          :ems_physical_infra_new,
          'pficon pficon-add-circle-o fa-lg',
          t = N_('Add a New Physical Infrastructure Provider'),
          t,
          :url => "/new"),
        button(
          :ems_physical_infra_edit,
          'pficon pficon-edit fa-lg',
          N_('Select a single Physical Infrastructure Provider to edit'),
          N_('Edit Selected Physical Infrastructure Providers'),
          :url_parms    => "main_div",
          :send_checked => true,
          :enabled      => false,
          :onwhen       => "1"),
        button(
          :ems_physical_infra_delete,
          'pficon pficon-delete fa-lg',
          N_('Remove selected Physical Infrastructure Providers from Inventory'),
          N_('Remove Physical Infrastructure Providers from Inventory'),
          :url_parms    => "main_div",
          :send_checked => true,
          :confirm      => N_("Warning: The selected Physical Infrastructure Providers and ALL of their components will be permanently removed!"),
          :enabled      => false,
          :onwhen       => "1+"),
      ]
    ),
  ])
  button_group('ems_physical_infra_policy', [
    select(
      :ems_physical_infra_policy_choice,
      nil,
      t = N_('Policy'),
      t,
      :enabled => false,
      :onwhen  => "1+",
      :items   => [
        button(
          :ems_physical_infra_protect,
          'pficon pficon-edit fa-lg',
          N_('Manage Policies for the selected Physical Infrastructure Providers'),
          N_('Manage Policies'),
          :url_parms    => "main_div",
          :send_checked => true,
          :enabled      => false,
          :onwhen       => "1+"),
        button(
          :ems_physical_infra_tag,
          'pficon pficon-edit fa-lg',
          N_('Edit Tags for the selected Physical Infrastructure Providers'),
          N_('Edit Tags'),
          :url_parms    => "main_div",
          :send_checked => true,
          :enabled      => false,
          :onwhen       => "1+"),
        button(
          :ems_physical_infra_check_compliance,
          'fa fa-search fa-lg',
          N_('Check Compliance of the last known configuration for these Physical Infra Managers'),
          N_('Check Compliance of Last Known Configuration'),
          :url_parms    => "main_div",
          :send_checked => true,
          :confirm      => N_("Initiate Check Compliance of the last known configuration for the selected items?"),
          :enabled      => "false",
          :onwhen       => "1+")
      ]
    ),
  ])
  button_group('ems_physical_infra_authentication', [
    select(
      :ems_physical_infra_authentication_choice,
      nil,
      t = N_('Authentication'),
      t,
      :enabled => false,
      :onwhen  => "1+",
      :items   => [
        button(
          :ems_infra_change_password,
          'pficon pficon-edit fa-lg',
          N_('Select a single Infrastructure Provider to Change password'),
          N_('Change Password'),
          :send_checked => true,
          :enabled      => false,
          :onwhen       => "1"
        ),
        button(
          :ems_physical_infra_recheck_auth_status,
          'fa fa-search fa-lg',
          N_('Re-check Authentication Status for the selected Physical Infrastructure Providers'),
          N_('Re-check Authentication Status'),
          :url_parms    => "main_div",
          :send_checked => true,
          :enabled      => false,
          :onwhen       => "1+"),
      ]
    ),
  ])
end
