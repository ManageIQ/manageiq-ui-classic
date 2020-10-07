class ApplicationHelper::Toolbar::MiqPoliciesCenter < ApplicationHelper::Toolbar::Basic
  button_group('miq_policy_vmdb', [
    select(
      :miq_policy_vmdb_choice,
      nil,
      t = N_('Configuration'),
      t,
      :items => [
        button(
          :miq_policy_new,
          'pficon pficon-add-circle-o fa-lg',
          t = _('Add a New Policy'),
          t,
          :url   => "/new",
          :klass     => ApplicationHelper::Button::ButtonNewDiscover),
        button(
          :miq_policy_edit,
          'pficon pficon-edit fa-lg',
          t = N_('Edit the selected Policy'),
          t,
          :url          => "/edit",
          :url_parms    => "main_div",
          :send_checked => true,
          :enabled      => false,
          :onwhen       => "1"),
        button(
          :miq_policy_copy,
          'pficon pficon-edit fa-lg',
          t = N_('Copy the selected Policy'),
          t,
          :url          => "/copy",
          :url_parms    => "main_div",
          :send_checked => true,
          :enabled      => false,
          :onwhen       => "1"),
      ]
    ),
  ])
end
