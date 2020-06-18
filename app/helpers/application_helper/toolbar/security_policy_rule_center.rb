class ApplicationHelper::Toolbar::SecurityPolicyRuleCenter < ApplicationHelper::Toolbar::Basic
  button_group(
    'security_policy_rule_vmdb',
    [
      select(
        :security_policy_vmdb_choice,
        'fa fa-shield fa-lg',
        t = N_('Policy'),
        t,
        :items => [
          button(
            :security_security_rule_new,
            'pficon pficon-add-circle-o fa-lg',
            t = N_('Add a new Security Policy Rule'),
            t,
            :klass => ApplicationHelper::Button::SecurityPolicyRuleNew
          )
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
        :items => [
          button(
            :security_policy_rule_tag,
            'pficon pficon-edit fa-lg',
            N_('Edit Tags for this Security Policy Rule'),
            N_('Edit Tags')
          )
        ]
      )
    ]
  )
end
