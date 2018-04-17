class ApplicationHelper::Toolbar::PhysicalServerCenter < ApplicationHelper::Toolbar::Basic
  button_group(
    'physical_server_vmdb',
    [
      select(
        :physical_server_vmdb_choice,
        'fa fa-cog fa-lg',
        t = N_('Configuration'),
        t,
        :items => [
          button(
            :physical_server_refresh,
            'fa fa-refresh fa-lg',
            N_('Refresh relationships and power states for all items related to the selected Physical Servers'),
            N_('Refresh Relationships and Power States'),
            :image   => "refresh",
            :data    => {'function'      => 'sendDataWithRx',
                         'function-data' => '{"type": "refresh", "controller": "physicalServerToolbarController"}'},
            :confirm => N_("Refresh relationships and power states for all items related to the selected Physical Servers?"),
            :options => {:feature => :refresh}
          ),
        ]
      ),
    ]
  )

  include ApplicationHelper::Toolbar::PhysicalInfrastructure::OperationsButtonGroupMixin

  button_group(
    'physical_server_policy',
    [
      select(
        :physical_server_policy_choice,
        'fa fa-shield fa-lg',
        N_('Policy'),
        :enabled => true,
        :onwhen  => "1+",
        :items   => [
          button(
            :physical_server_protect,
            'pficon pficon-edit fa-lg',
            N_('Manage Policies for the selected items'),
            N_('Manage Policies'),
            :url_parms    => "main_div",
            :send_checked => true,
            :enabled      => true,
            :onwhen       => "1+"
          ),
          button(
            :physical_server_tag,
            'pficon pficon-edit fa-lg',
            N_('Edit tags for the selected items'),
            N_('Edit Tags'),
            :url_parms    => "main_div",
            :send_checked => true,
            :enabled      => true,
            :onwhen       => "1+"
          ),
        ]
      ),
      select(
        :physical_server_lifecycle_choice,
        'fa fa-recycle fa-lg',
        t = N_('Lifecycle'),
        t,
        :enabled => true,
        :items   => [
          button(
            :physical_server_provision,
            'pficon pficon-add-circle-o fa-lg',
            t = N_('Provision Physical Server'),
            t,
            :url       => "provision",
            :url_parms => "main_div",
            :enabled   => true,
            :onwhen    => "0+",
            :klass     => ApplicationHelper::Button::ConfiguredSystemProvision
          )
        ]
      )
    ]
  )

  button_group(
    'physical_server_monitoring',
    [
      select(
        :physical_server_monitoring_choice,
        'ff ff-monitoring fa-lg',
        t = N_('Monitoring'),
        t,
        :items => [
          button(
            :physical_server_timeline,
            'ff ff-timeline fa-lg',
            N_('Show Timelines for this Physical Server'),
            N_('Timelines'),
            :klass     => ApplicationHelper::Button::PhysicalServerTimeline,
            :url_parms => "?display=timeline"
          )
        ]
      )
    ]
  )

  button_group(
    'physical_server_remote_access',
    [
      select(
        :physical_server_remote_access_choice,
        'fa pficon-screen fa-lg',
        N_('Physical Server Remote Access'),
        N_('Access'),
        :enabled => true,
        :items   => [
          button(
            :physical_server_remote_console,
            'pficon pficon-screen fa-lg',
            N_('Open a remote console for this Physical Server'),
            N_('Physical Server Console'),
            :url     => "console",
            :method  => :get,
            :enabled => true,
            :options => {:feature => :physical_server_remote_access}
          )
        ],
      ),
    ]
  )
end
