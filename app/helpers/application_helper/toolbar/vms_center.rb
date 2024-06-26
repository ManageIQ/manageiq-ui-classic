class ApplicationHelper::Toolbar::VmsCenter < ApplicationHelper::Toolbar::Basic
  button_group('vm_vmdb', [
    select(
      :vm_vmdb_choice,
      nil,
      N_('Configuration'),
      :enabled => false,
      :onwhen  => "1+",
      :items   => [
        button(
          :vm_refresh,
          'fa fa-refresh fa-lg',
          N_('Refresh relationships and power states for all items related to the selected items'),
          N_('Refresh Relationships and Power States'),
          :url_parms    => "main_div",
          :send_checked => true,
          :confirm      => N_("Refresh relationships and power states for all items related to the selected items?"),
          :enabled      => false,
          :onwhen       => "1+"),
        button(
          :vm_compare,
          'ff ff-compare-same fa-lg',
          N_('Select two or more items to compare'),
          N_('Compare Selected items'),
          :url_parms    => "main_div",
          :send_checked => true,
          :enabled      => false,
          :onwhen       => "2+"),
        separator,
        button(
          :vm_edit,
          'pficon pficon-edit fa-lg',
          N_('Select a single item to edit'),
          N_('Edit Selected item'),
          :url_parms    => "main_div",
          :send_checked => true,
          :enabled      => false,
          :onwhen       => "1"),
        button(
          :vm_ownership,
          'pficon pficon-user fa-lg',
          N_('Set Ownership for the selected items'),
          N_('Set Ownership'),
          :url_parms    => "main_div",
          :send_checked => true,
          :enabled      => false,
          :onwhen       => "1+"),
        button(
          :vm_delete,
          'pficon pficon-delete fa-lg',
          N_('Remove selected items from Inventory'),
          :url_parms    => "main_div",
          :send_checked => true,
          :confirm      => N_("Warning: The selected items and ALL of their components will be permanently removed!"),
          :enabled      => false,
          :onwhen       => "1+"),
        separator,
      ]
    ),
  ])
  button_group('vm_policy', [
    select(
      :vm_policy_choice,
      nil,
      N_('Policy'),
      :enabled => false,
      :onwhen  => "1+",
      :items   => [
        button(
          :vm_protect,
          'pficon pficon-edit fa-lg',
          N_('Manage Policies for the selected items'),
          N_('Manage Policies'),
          :url_parms    => "main_div",
          :send_checked => true,
          :enabled      => false,
          :onwhen       => "1+"),
        # TODO: Add this button back when the page is fixed
        # button(
        #   :vm_policy_sim,
        #   'fa fa-play-circle-o fa-lg',
        #   N_('View Policy Simulation for the selected items'),
        #   N_('Policy Simulation'),
        #   :url_parms    => "main_div",
        #   :send_checked => true,
        #   :enabled      => false,
        #   :onwhen       => "1+"),
        button(
          :vm_tag,
          'pficon pficon-edit fa-lg',
          N_('Edit tags for the selected items'),
          N_('Edit Tags'),
          :url_parms    => "main_div",
          :send_checked => true,
          :enabled      => false,
          :onwhen       => "1+"),
        button(
          :vm_check_compliance,
          'fa fa-search fa-lg',
          N_('Check Compliance of the last known configuration for the selected items'),
          N_('Check Compliance of Last Known Configuration'),
          :url_parms    => "main_div",
          :send_checked => true,
          :confirm      => N_("Initiate Check Compliance of the last known configuration for the selected items?"),
          :enabled      => false,
          :onwhen       => "1+",
          :klass        => ApplicationHelper::Button::VmCheckCompliance),
      ]
    ),
  ])
  button_group('vm_lifecycle', [
    select(
      :vm_lifecycle_choice,
      nil,
      N_('Lifecycle'),
      :items => [
        button(
          :vm_miq_request_new,
          'pficon pficon-add-circle-o fa-lg',
          N_('Request to Provision'),
          N_('Provision'),
          :url_parms    => "main_div",
          :send_checked => true,
          :klass        => ApplicationHelper::Button::ButtonNewDiscover),
      ]
    ),
  ])
end
