class ApplicationHelper::Toolbar::HostInitiatorGroupCenter < ApplicationHelper::Toolbar::Basic
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
            N_('Refresh relationships and power states for all items related to this Host Initiator Group'),
            N_('Refresh Relationships and Power States'),
            :image   => "refresh",
            :data    => {'function'      => 'sendDataWithRx',
                         'function-data' => {:type => "refresh", :controller => "hostInitiatorGroupToolbarController"}},
            :confirm => N_("Refresh relationships and power states for all items related to this Host Initiator Cluster?"),
            :options => {:feature => :refresh}
          ),
          api_button(
            :host_initiator_group_delete,
            nil,
            t = N_('Delete the Host Initiator Group'),
            t,
            :icon         => "pficon pficon-delete fa-lg",
            :klass        => ApplicationHelper::Button::GenericFeatureButtonWithDisable,
            :options      => {:feature => :delete},
            :api          => {
              :action => 'delete',
              :entity => 'host_initiator_groups'
            },
            :confirm      => N_("Are you sure you want to delete this Host Initiator Group?"),
            :send_checked => true
          ),
          button(
            :host_initiator_group_edit,
            'pficon pficon-edit fa-lg',
            t = N_('Edit this Host Initiator Group'),
            t,
            :url_parms    => 'main_div',
            :send_checked => true,
            :klass        => ApplicationHelper::Button::GenericFeatureButtonWithDisable,
            :options      => {:feature => :update}
          ),
        ]
      ),
    ]
  )
end
