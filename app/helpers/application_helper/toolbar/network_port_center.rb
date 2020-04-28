class ApplicationHelper::Toolbar::NetworkPortCenter < ApplicationHelper::Toolbar::Basic
  button_group(
    'network_port_refreshing', [
      button(
        :network_port_refresh,
        'fa fa-refresh fa-lg',
        N_('Refresh this page'),
        nil,
        :url_parms    => "main_div",
        :send_checked => true,
        :klass        => ApplicationHelper::Button::ButtonWithoutRbacCheck
      )
    ]
  )  
  button_group('network_port_policy', [
    select(
      :network_port_policy_choice,
      nil,
      t = N_('Policy'),
      t,
      :items => [
        button(
          :network_port_tag,
          'pficon pficon-edit fa-lg',
          N_('Edit Tags for this Network Port'),
          N_('Edit Tags')),
      ]
    ),
  ])
end
