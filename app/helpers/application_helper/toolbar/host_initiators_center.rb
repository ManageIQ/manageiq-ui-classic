class ApplicationHelper::Toolbar::HostInitiatorsCenter < ApplicationHelper::Toolbar::Basic
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
            N_('Refresh relationships and power states for all items related to these Host Initiators'),
            N_('Refresh Relationships and Power States'),
            :image   => "refresh",
            :data    => {'function'      => 'sendDataWithRx',
                         'function-data' => {:type => "refresh", :controller => "hostInitiatorToolbarController"}},
            :confirm => N_("Refresh relationships and power states for all items related to these Host Initiators?"),
            :options => {:feature => :refresh}
          ),
          button(
            :host_initiator_new,
            'pficon pficon-add-circle-o fa-lg',
            t = N_('Define a new host initiator'),
            t,
            :klass => ApplicationHelper::Button::HostInitiatorNew
          ),
          api_button(
            :host_initiator_delete,
            nil,
            t = N_('Delete the Host Initiator'),
            t,
            :icon         => "pficon pficon-delete fa-lg",
            :klass        => ApplicationHelper::Button::PolymorphicConditionalButton,
            :options      => {:feature      => :delete,
                              :parent_class => "HostInitiator"},
            :api          => {
              :action => 'delete',
              :entity => 'host_initiators'
            },
            :confirm      => N_("Are you sure you want to delete this host initiators?"),
            :send_checked => true,
            :enabled      => false,
            :onwhen       => '1+'
          ),
        ]
      ),
    ]
  )
end
