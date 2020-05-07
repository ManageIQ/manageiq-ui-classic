class ApplicationHelper::Toolbar::SecurityPolicyCenter < ApplicationHelper::Toolbar::Basic
  button_group(
    'security_policy_refreshing', [
      button(
        :security_policy_refresh,
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
    'security_policy_vmdb',
    [
      select(
        :security_policy_vmdb_choice,
        'fa fa-shield fa-lg',
        t = N_('Policy'),
        t,
        :items => []
      )
    ]
  )
  button_group(
    'security_policy_policy',
    [
      select(
        :security_policy_policy_choice,
        'fa fa-shield fa-lg',
        t = N_('Policy'),
        t,
        :items => [
          button(
            :security_policy_tag,
            'pficon pficon-edit fa-lg',
            N_('Edit Tags for this Security Policy'),
            N_('Edit Tags')
          )
        ]
      )
    ]
  )
end
