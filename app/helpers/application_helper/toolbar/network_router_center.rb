class ApplicationHelper::Toolbar::NetworkRouterCenter < ApplicationHelper::Toolbar::Basic
  button_group(
    'network_router_vmdb',
    [
      select(
        :network_router_vmdb_choice,
        'fa fa-cog fa-lg',
        t = N_('Configuration'),
        t,
        :items => [
          button(
            :network_router_edit,
            'pficon pficon-edit fa-lg',
            t = N_('Edit this Router'),
            t,
            :url_parms    => 'main_div',
            :send_checked => true,
            :klass        => ApplicationHelper::Button::GenericFeatureButtonWithDisable,
            :options      => {:feature => :update}
          ),
          button(
            :network_router_add_interface,
            'pficon pficon-edit fa-lg',
            t = N_('Add Interface to this Router'),
            t,
            :url_parms    => 'main_div',
            :send_checked => true,
            :klass        => ApplicationHelper::Button::GenericFeatureButtonWithDisable,
            :options      => {:feature => :add_interface}
          ),
          button(
            :network_router_remove_interface,
            'pficon pficon-edit fa-lg',
            t = N_('Remove Interface from this Router'),
            t,
            :url_parms    => 'main_div',
            :send_checked => true,
            :klass        => ApplicationHelper::Button::GenericFeatureButtonWithDisable,
            :options      => {:feature => :remove_interface}
          ),
          button(
            :network_router_delete,
            'pficon pficon-delete fa-lg',
            t = N_('Delete this Router'),
            t,
            :url_parms    => 'main_div',
            :send_checked => true,
            :confirm      => N_('Warning: This Router and ALL of its components will be removed!'),
            :klass        => ApplicationHelper::Button::GenericFeatureButtonWithDisable,
            :options      => {:feature => :delete},
            :data         => {
              'function'      => 'sendDataWithRx',
              'function-data' => {
                :type       => 'delete',
                :controller => 'toolbarActions',
                :payload    => {
                  :entity => 'network_routers',
                  :labels => {
                    :single   => _('Network Router'),
                    :multiple => _('Network Routers')
                  }
                }
              }.to_json
            },
          )
        ]
      )
    ]
  )
  button_group(
    'network_router_policy',
    [
      select(
        :network_router_policy_choice,
        'fa fa-shield fa-lg',
        t = N_('Policy'),
        t,
        :items => [
          button(
            :network_router_tag,
            'pficon pficon-edit fa-lg',
            N_('Edit Tags for this Network Router'),
            N_('Edit Tags'),
          )
        ]
      )
    ]
  )
end
