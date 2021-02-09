class ApplicationHelper::Toolbar::HostInitiatorCenter < ApplicationHelper::Toolbar::Basic
  button_group(
    'host_initiator_vmdb',
    [
      select(
        :host_initiator_vmdb_choice,
        nil,
        t = N_('Configuration'),
        t,
        :items => [
          button(
            :host_initiator_refresh,
            'fa fa-refresh fa-lg',
            N_('Refresh relationships and power states for all items related to this Host Initiator'),
            N_('Refresh Relationships and Power States'),
            :image   => "refresh",
            :data    => {'function'      => 'sendDataWithRx',
                         'function-data' => {:type => "refresh", :controller => "hostInitiatorToolbarController"}},
            :confirm => N_("Refresh relationships and power states for all items related to this Host Initiator?"),
            :options => {:feature => :refresh}
          ),
        ]
      ),
    ]
  )
end
