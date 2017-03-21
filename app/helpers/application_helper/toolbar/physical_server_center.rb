class ApplicationHelper::Toolbar::PhysicalServerCenter < ApplicationHelper::Toolbar::Basic
  button_group('host_vmdb', [
    select(
      :host_vmdb_choice,
      'fa fa-cog fa-lg',
      t = N_('Configuration'),
      t,
      :items => [
        button(
          :host_refresh,
          'fa fa-refresh fa-lg',
          N_('Refresh relationships and power states for all items related to the selected items'),
          N_('Refresh Relationships and Power States'),
          :url_parms => "main_div",
          :confirm   => N_("Refresh relationships and power states for all items related to the selected items?"),
          :enabled   => false,
          :onwhen    => "1+"
        ),
        button(
          :host_scan,
          'fa fa-search fa-lg',
          N_('Perform SmartState Analysis on the selected items'),
          N_('Perform SmartState Analysis'),
          :url_parms => "main_div",
          :confirm   => N_("Perform SmartState Analysis on the selected items?"),
          :enabled   => false,
          :onwhen    => "1+"
        ),
        button(
          :host_compare,
          'product product-compare fa-lg',
          N_('Select two or more items to compare'),
          N_('Compare Selected items'),
          :url_parms => "main_div",
          :enabled   => false,
          :onwhen    => "2+"
        ),
        button(
          :host_register_nodes,
          'pficon pficon-add-circle-o fa-lg',
          t = N_('Register Nodes'),
          t,
          :url   => "/register_nodes",
          :klass => ApplicationHelper::Button::HostRegisterNodes
        ),
        button(
          :host_manageable,
          'pficon pficon-edit fa-lg',
          N_('Set selected items to manageable state.'),
          N_('Set Nodes to Manageable'),
          :url_parms => "main_div",
          :confirm   => N_("Set selected items to manageable state?"),
          :onwhen    => "1+",
          :klass     => ApplicationHelper::Button::HostManageable
        ),
        button(
          :host_introspect,
          'pficon pficon-edit fa-lg',
          N_('Introspect selected items'),
          N_('Introspect Nodes'),
          :url_parms => "main_div",
          :confirm   => N_("Introspect selected items?"),
          :onwhen    => "1+",
          :klass     => ApplicationHelper::Button::HostIntrospectProvide
        ),
        button(
          :host_provide,
          'pficon pficon-edit fa-lg',
          N_('Provide selected items'),
          N_('Provide Nodes'),
          :url_parms => "main_div",
          :confirm   => N_("Provide selected items?"),
          :onwhen    => "1+",
          :klass     => ApplicationHelper::Button::HostIntrospectProvide
        ),
        button(
          :host_discover,
          'fa fa-search fa-lg',
          t = N_('Discover items'),
          t,
          :url       => "/discover",
          :url_parms => "?discover_type=hosts"
        ),
        separator,
        button(
          :host_new,
          'pficon pficon-add-circle-o fa-lg',
          t = N_('Add a New item'),
          t,
          :url => "/new"
        ),
        button(
          :host_edit,
          'pficon pficon-edit fa-lg',
          t = N_('Edit Selected items'),
          t,
          :url_parms => "main_div",
          :enabled   => false,
          :onwhen    => "1+"
        ),
        button(
          :host_delete,
          'pficon pficon-delete fa-lg',
          N_('Remove Selected items'),
          N_('Remove items'),
          :url_parms => "main_div",
          :confirm   => N_("Warning: The selected items and ALL of their components will be permanently removed!?"),
          :enabled   => false,
          :onwhen    => "1+"
        ),
      ]
    ),
  ])
  button_group('host_policy', [
    select(
      :host_policy_choice,
      'fa fa-shield fa-lg',
      t = N_('Policy'),
      t,
      :items => [
        button(
          :host_protect,
          'pficon pficon-edit fa-lg',
          N_('Manage Policies for this item'),
          N_('Manage Policies'),
          :klass => ApplicationHelper::Button::HostProtect
        ),
        button(
          :host_tag,
          'pficon pficon-edit fa-lg',
          N_('Edit Tags for this item'),
          N_('Edit Tags')
        ),
        button(
          :host_check_compliance,
          'fa fa-search fa-lg',
          N_('Check Compliance of the last known configuration for this item'),
          N_('Check Compliance of Last Known Configuration'),
          :confirm => N_("Initiate Check Compliance of the last known configuration for this item?")
        ),
        button(
          :host_analyze_check_compliance,
          'fa fa-search fa-lg',
          N_('Analyze then Check Compliance for this item'),
          N_('Analyze then Check Compliance'),
          :confirm => N_("Analyze then Check Compliance for this item?")
        ),
      ]
    ),
  ])
  button_group('host_lifecycle', [
    select(
      :host_lifecycle_choice,
      'fa fa-recycle fa-lg',
      t = N_('Lifecycle'),
      t,
      :items => [
        button(
          :host_miq_request_new,
          'pficon pficon-add-circle-o fa-lg',
          t = N_('Provision this item'),
          t
        ),
      ]
    ),
  ])
  button_group('physical_server_operations', [
    select(
      :physical_server_power_choice,
      'fa fa-power-off fa-lg',
      N_('Power Operations'),
      N_('Power'),
      :items => [
        button(
          :physical_server_power_on,
          nil,
          N_('Power on the server'),
          N_('Power On'),
          :image     => "power_on",
          :url_parms => "main_div",
          :confirm   => N_("Power on the server?"),
          :klass     => ApplicationHelper::Button::HostFeatureButton,
          :options   => {:feature => :power_on}
        ),
        button(
          :physical_server_power_off,
          nil,
          N_('Power off the server'),
          N_('Power Off'),
          :image     => "power_off",
          :url_parms => "main_div",
          :confirm   => N_("Power off the server?"),
          :klass     => ApplicationHelper::Button::HostFeatureButton,
          :options   => {:feature => :power_off}
        ),
        button(
          :physical_server_restart,
          nil,
          N_('Restart the server'),
          N_('Restart'),
          :image     => "power_reset",
          :url_parms => "main_div",
          :confirm   => N_("Restart the server?"),
          :klass     => ApplicationHelper::Button::HostFeatureButton,
          :options   => {:feature => :restart}
        ),
      ]
    ),
    select(
      :physical_server_identify_choice,
      nil,
      N_('Identify LED Operations'),
      N_('Identify'),
      :items => [
        button(
          :physical_server_blink_loc_led,
          nil,
          N_('Blink the Identify LED'),
          N_('Blink LED'),
          :image     => "blank_button",
          :url_parms => "main_div",
          :confirm   => N_("Blink the Identify LED?"),
          :klass     => ApplicationHelper::Button::HostFeatureButton,
          :options   => {:feature => :blink_loc_led}
        ),
        button(
          :physical_server_turn_on_loc_led,
          nil,
          N_('Turn on the Idenfity LED'),
          N_('Turn On LED'),
          :image     => "blank_button",
          :url_parms => "main_div",
          :confirm   => N_("Turn on the Identify LED?"),
          :klass     => ApplicationHelper::Button::HostFeatureButton,
          :options   => {:feature => :turn_on_loc_led}
        ),
        button(
          :physical_server_turn_off_loc_led,
          nil,
          N_('Turn off the Identify LED'),
          N_('Turn Off LED'),
          :image     => "blank_button",
          :url_parms => "main_div",
          :confirm   => N_("Turn off the Identify LED?"),
          :klass     => ApplicationHelper::Button::HostFeatureButton,
          :options   => {:feature => :turn_off_loc_led}
        ),
      ]
    ),
  ])
end
