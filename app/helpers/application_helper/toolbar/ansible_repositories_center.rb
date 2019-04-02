class ApplicationHelper::Toolbar::AnsibleRepositoriesCenter < ApplicationHelper::Toolbar::Basic
  button_group('ansible_repositories_reloading', [
    button(
      :ansible_repositories_reload,
      'fa fa-refresh fa-lg',
      N_('Refresh this page'),
      N_('Refresh'),
      :url_parms    => "main_div",
      :send_checked => true,
      :klass        => ApplicationHelper::Button::ButtonWithoutRbacCheck),
  ])
  button_group('ansible_repositories', [
    select(
      :ansible_repositories_configuration,
      'fa fa-cog fa-lg',
      t = N_('Configuration'),
      t,
      :items => [
        button(
          :embedded_configuration_script_source_refresh,
          'fa fa-refresh fa-lg',
          N_('Refresh Selected Ansible Repositories'),
          N_('Refresh Selected Ansible Repositories'),
          :klass        => ApplicationHelper::Button::EmbeddedAnsible,
          :url          => "repository_refresh",
          :confirm      => N_("Refresh selected Ansible Repositories?"),
          :enabled      => false,
          :url_parms    => 'unused_div',
          :send_checked => true,
          :onwhen       => "1+"),
        separator,
        button(
          :embedded_configuration_script_source_add,
          'pficon pficon-add-circle-o fa-lg',
          t = N_('Add New Repository'),
          t,
          :klass        => ApplicationHelper::Button::EmbeddedAnsible,
          :url_parms    => "unused_div",
          :send_checked => true),
        button(
          :embedded_configuration_script_source_edit,
          'pficon pficon-edit fa-lg',
          t = N_('Edit this Repository'),
          t,
          :klass        => ApplicationHelper::Button::EmbeddedAnsible,
          :enabled      => false,
          :onwhen       => "1",
          :url_parms    => "unused_div",
          :send_checked => true),
        button(
          :embedded_configuration_script_source_delete,
          'pficon pficon-delete fa-lg',
          t = N_('Remove selected Repositories from Inventory'),
          t,
          :klass        => ApplicationHelper::Button::EmbeddedAnsible,
          :url_parms    => "unused_div",
          :send_checked => true,
          :enabled      => false,
          :onwhen       => "1+",
          :confirm      => N_("Warning: The selected Repository will be permanently removed!")),
      ]
    )
  ])
  button_group('ansible_repositories_policy', [
                 select(
                   :ansible_repositories_policy_choice,
                   'fa fa-shield fa-lg',
                   t = N_('Policy'),
                   t,
                   :enabled => false,
                   :onwhen  => "1+",
                   :items   => [
                     button(
                       :ansible_repository_tag,
                       'pficon pficon-edit fa-lg',
                       N_('Edit Tags for the selected Ansible Repositories'),
                       N_('Edit Tags'),
                       :url_parms    => "main_div",
                       :send_checked => true,
                       :enabled      => false,
                       :onwhen       => "1+"
                     ),
                   ]
                 )
               ])
end
