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
