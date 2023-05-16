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
            N_('Refresh selected Host Initiators'),
            N_('Refresh selected Host Initiators'),
            :image        => "refresh",
            :confirm      => N_("Refresh the selected Host Initiators?"),
            :options      => {:feature => :refresh},
            :api          => {
              :action => 'refresh',
              :entity => 'host_initiators'
            },
            :send_checked => true,
            :enabled      => false,
            :onwhen       => '1+'
          ),
          button(
            :host_initiator_new,
            'pficon pficon-add-circle-o fa-lg',
            t = N_('Define a new Host Initiator'),
            t,
            :klass => ApplicationHelper::Button::HostInitiatorNew
          ),
          api_button(
            :host_initiator_delete,
            nil,
            t = N_('Delete selected Host Initiators'),
            t,
            :icon         => "pficon pficon-delete fa-lg",
            :klass        => ApplicationHelper::Button::PolymorphicConditionalButton,
            :options      => {:feature      => :delete,
                              :parent_class => "HostInitiator"},
            :api          => {
              :action => 'delete',
              :entity => 'host_initiators'
            },
            :confirm      => N_("Are you sure you want to delete the selected Host Initiators?"),
            :send_checked => true,
            :enabled      => false,
            :onwhen       => '1+'
          ),
        ]
      ),
    ]
  )
end
