class ApplicationHelper::Toolbar::NetworkRoutersCenter < ApplicationHelper::Toolbar::Basic
  button_group(
    'network_router_refreshing', [
      button(
        :network_routers_refresh,
        'fa fa-refresh fa-lg',
        N_('Refresh this page'),
        nil,
        :url_parms    => "main_div",
        :send_checked => true,
        :klass        => ApplicationHelper::Button::ButtonWithoutRbacCheck
      )
    ]
  )  
  button_group(
    'network_router_vmdb',
    [
      select(
        :network_router_vmdb_choice,
        nil,
        t = N_('Configuration'),
        t,
        :items => [
          button(
            :network_router_new,
            'pficon pficon-add-circle-o fa-lg',
            t = N_('Add a new Router'),
            t,
            :klass => ApplicationHelper::Button::NetworkRouterNew
          ),
          button(
            :network_router_delete,
            'pficon pficon-delete fa-lg',
            t = N_('Delete selected Routers'),
            t,
            :url_parms    => 'main_div',
            :send_checked => true,
            :confirm      => N_('Warning: This Router and ALL of its components will be removed!'),
            :enabled      => false,
            :onwhen       => "1+",
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
              }
            }
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
        nil,
        t = N_('Policy'),
        t,
        :enabled => false,
        :onwhen  => "1+",
        :items   => [
          button(
            :network_router_tag,
            'pficon pficon-edit fa-lg',
            N_('Edit Tags for the selected Network Routers'),
            N_('Edit Tags'),
            :url_parms    => "main_div",
            :send_checked => true,
            :enabled      => false,
            :onwhen       => "1+"),
        ]
      )
    ]
  )
end
