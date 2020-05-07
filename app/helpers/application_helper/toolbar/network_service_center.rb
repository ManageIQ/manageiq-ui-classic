class ApplicationHelper::Toolbar::NetworkServiceCenter < ApplicationHelper::Toolbar::Basic
  button_group(
    'network_service_refreshing', [
      button(
        :network_service_refresh,
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
    'network_service_policy',
    [
      select(
        :network_service_policy_choice,
        'fa fa-shield fa-lg',
        t = N_('Policy'),
        t,
        :items => [
          button(
            :network_service_tag,
            'pficon pficon-edit fa-lg',
            N_('Edit Tags for this Network Service'),
            N_('Edit Tags')
          )
        ]
      )
    ]
  )
end
