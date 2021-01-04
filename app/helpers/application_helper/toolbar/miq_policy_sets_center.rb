class ApplicationHelper::Toolbar::MiqPolicySetsCenter < ApplicationHelper::Toolbar::Basic
  button_group('miq_policy_set_new_vmdb', [
    select(
      :miq_policy_set_new_vmdb_choice,
      nil,
      t = N_('Configuration'),
      t,
      :items => [
        button(
          :miq_policy_set_new,
          'pficon pficon-add-circle-o fa-lg',
          t = N_('Add a New Policy Profile'),
          t,
          :klass => ApplicationHelper::Button::ButtonNewDiscover),
      ]
    ),
  ])
end
