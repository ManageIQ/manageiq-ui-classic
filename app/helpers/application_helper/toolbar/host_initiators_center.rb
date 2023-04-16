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
            N_('Refresh the provider of the selected host initiator(s)'),
            N_('Refresh the provider'),
            :image        => "refresh",
            :confirm      => N_("Refresh the provider of the selected host initiator(s)?"),
            :options      => {:feature => :refresh},
            :api          => {
              :action => 'refresh',
              :entity => 'host_initiators'
            },
            :send_checked => true,
            :enabled      => false,
            :onwhen       => '1+'
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
