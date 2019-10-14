class ApplicationHelper::Toolbar::ConfigurationJobsCenter < ApplicationHelper::Toolbar::Basic
  button_group('configuration_job_reloading', [
    button(
      :configuration_job_reload,
      'fa fa-refresh fa-lg',
      N_('Refresh this page'),
      N_('Refresh'),
      :url_parms    => "main_div",
      :send_checked => true,
      :klass        => ApplicationHelper::Button::ButtonWithoutRbacCheck
    ),
  ])
  button_group('configuration_job_vmdb', [
    select(
      :configuration_job_vmdb_choice,
      nil,
      t = N_('Configuration'),
      t,
      :items => [
        button(
          :configuration_job_delete,
          'pficon pficon-delete fa-lg',
          N_('Remove selected Jobs'),
          N_('Remove Jobs'),
          :url_parms    => "main_div",
          :send_checked => true,
          :confirm      => N_("Warning: The selected Jobs and ALL of their components will be permanently removed!"),
          :enabled      => false,
          :onwhen       => "1+"),
      ]
    ),
  ])
  button_group('configuration_job_policy', [
    select(
      :configuration_job_policy_choice,
      nil,
      t = N_('Policy'),
      t,
      :enabled => false,
      :onwhen  => "1+",
      :items   => [
        button(
          :configuration_job_tag,
          'pficon pficon-edit fa-lg',
          N_('Edit Tags for the selected Jobs'),
          N_('Edit Tags'),
          :url_parms    => "main_div",
          :send_checked => true,
          :enabled      => false,
          :onwhen       => "1+"),
      ]
    ),
  ])
end
