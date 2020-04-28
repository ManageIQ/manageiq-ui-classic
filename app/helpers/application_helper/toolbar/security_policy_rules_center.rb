class ApplicationHelper::Toolbar::SecurityPolicyRulesCenter < ApplicationHelper::Toolbar::Basic
  button_group(
    'security_policy_rule_refreshing', [
      button(
        :security_policy_rules_refresh,
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
    'security_policy_rule_vmdb',
    [
      select(
        :security_policy_rule_vmdb_choice,
        'fa fa-cog fa-lg',
        t = N_('Configuration'),
        t,
        :items => [
        ]
      )
    ]
  )
  button_group(
    'security_policy_rule_policy',
    [
      select(
        :security_policy_rule_policy_choice,
        'fa fa-shield fa-lg',
        t = N_('Policy'),
        t,
        :enabled => false,
        :onwhen  => "1+",
        :items   => [
          button(
            :security_policy_rule_tag,
            'pficon pficon-edit fa-lg',
            N_('Edit Tags for the selected Security Policy Rules'),
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
