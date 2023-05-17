class ApplicationHelper::Toolbar::HostInitiatorGroupsCenter < ApplicationHelper::Toolbar::Basic
  button_group(
    'host_initiator_group_vmdb',
    [
      select(
        :host_initiator_group_vmdb_choice,
        nil,
        t = N_('Configuration'),
        t,
        :items => [
          button(
            :host_initiator_group_refresh,
            'fa fa-refresh fa-lg',
            N_('Refresh selected Host Initiator Groups'),
            N_('Refresh selected Host Initiator Groups'),
            :image        => "refresh",
            :confirm      => N_("Refresh the selected Host Initiator Groups?"),
            :options      => {:feature      => :refresh,
                              :parent_class => "HostInitiatorGroup"},
            :api          => {
              :action => 'refresh',
              :entity => 'host_initiator_groups'
            },
            :send_checked => true,
            :enabled      => false,
            :onwhen       => '1+'
          ),
          button(
            :host_initiator_group_new,
            'pficon pficon-add-circle-o fa-lg',
            t = N_('Add new host initiator group'),
            t,
            :klass => ApplicationHelper::Button::HostInitiatorGroupNew
          ),
          api_button(
            :host_initiator_group_delete,
            nil,
            t = N_('Delete selected Host Initiator Groups'),
            t,
            :icon         => "pficon pficon-delete fa-lg",
            :klass        => ApplicationHelper::Button::PolymorphicConditionalButton,
            :options      => {:feature      => :delete,
                              :parent_class => "HostInitiatorGroup"},
            :api          => {
              :action => 'delete',
              :entity => 'host_initiator_groups'
            },
            :confirm      => N_("Are you sure you want to delete the selected Host Initiator Groups?"),
            :send_checked => true,
            :enabled      => false,
            :onwhen       => '1+'
          ),
          button(
            :host_initiator_group_edit,
            'pficon pficon-edit fa-lg',
            t = N_('Edit selected Host Initiator Group'),
            t,
            :url_parms    => 'main_div',
            :send_checked => true,
            :enabled      => false,
            :onwhen       => '1'
          ),
        ]
      ),
    ]
  )
end
