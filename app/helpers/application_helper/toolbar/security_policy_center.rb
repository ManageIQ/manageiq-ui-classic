class ApplicationHelper::Toolbar::SecurityPolicyCenter < ApplicationHelper::Toolbar::Basic
  button_group(
    'security_policy_vmdb',
    [
      select(
        :security_policy_vmdb_choice,
        'fa fa-shield fa-lg',
        t = N_('Policy'),
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
        t = N_('Configuration'),
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
