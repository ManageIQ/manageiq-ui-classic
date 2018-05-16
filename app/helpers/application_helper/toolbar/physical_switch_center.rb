class ApplicationHelper::Toolbar::PhysicalSwitchCenter < ApplicationHelper::Toolbar::Basic
  button_group(
    'physical_switch_vmdb',
    [
      select(
        :physical_switch_vmdb_choice,
        'fa fa-cog fa-lg',
        t = N_('Configuration'),
        t,
        :items => [
          button(
            :physical_switch_refresh,
            'fa fa-refresh fa-lg',
            N_('Refresh relationships and power states for all items related to this Physical Switch'),
            N_('Refresh Relationships and Power States'),
            :image   => "refresh",
            :data    => {'function'      => 'sendDataWithRx',
                         'function-data' => '{"type": "refresh", "controller": "physicalSwitchToolbarController"}'},
            :confirm => N_("Refresh relationships and power states for all items related to this Physical Switch?"),
            :options => {:feature => :refresh}
          ),
        ]
      ),
    ]
  )
end
