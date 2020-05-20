class ApplicationHelper::Toolbar::SecurityPoliciesCenter < ApplicationHelper::Toolbar::Basic
  button_group(
    'security_policy_refreshing', [
      button(
        :security_policies_refresh,
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
        'fa fa-cog fa-lg',
        t = N_('Configuration'),
        t,
        :items => [
          button(
            :security_security_new,
            'pficon pficon-add-circle-o fa-lg',
            t = N_('Add a new Security Policy Rule'),
            t,
            :klass => ApplicationHelper::Button::SecurityPolicyNew
          )
        ]
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
        :enabled => false,
        :onwhen  => "1+",
        :items   => [
          button(
            :security_policy_tag,
            'pficon pficon-edit fa-lg',
            N_('Edit Tags for the selected Security Policies'),
            N_('Edit Tags'),
            :url_parms    => "main_div",
            :send_checked => true,
            :enabled      => false,
            :onwhen       => "1+"
          )
        ]
      )
    ]
  )
end
