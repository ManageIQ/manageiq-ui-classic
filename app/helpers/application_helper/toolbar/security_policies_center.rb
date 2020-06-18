class ApplicationHelper::Toolbar::SecurityPoliciesCenter < ApplicationHelper::Toolbar::Basic
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
            :security_policy_edit,
            'pficon pficon-edit fa-lg',
            t = N_('Edit this Security Policy'),
            t,
            :url_parms    => 'main_div',
            :send_checked => true,
            :klass        => ApplicationHelper::Button::GenericFeatureButtonWithDisable,
            :options      => {:feature => :update}
          ),
          button(
            :security_policy_delete,
            'pficon pficon-delete fa-lg',
            t = N_('Delete this Security Policy'),
            t,
            :url_parms    => 'main_div',
            :send_checked => true,
            :confirm      => N_('Warning: This Security Policy and ALL of its components will be removed!'),
            :klass        => ApplicationHelper::Button::GenericFeatureButtonWithDisable,
            :options      => {:feature => :delete}
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
            :onwhen       => "1+")
        ]
      )
    ]
  )
end
