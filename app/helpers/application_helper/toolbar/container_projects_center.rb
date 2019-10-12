class ApplicationHelper::Toolbar::ContainerProjectsCenter < ApplicationHelper::Toolbar::Basic
  button_group('container_project_policy', [
    select(
      :container_project_policy_choice,
      nil,
      t = N_('Policy'),
      t,
      :enabled => false,
      :onwhen  => "1+",
      :items   => [
        button(
          :container_project_tag,
          'pficon pficon-edit fa-lg',
          N_('Edit Tags for this Service'),
          N_('Edit Tags'),
          :url_parms    => "main_div",
          :send_checked => true,
          :enabled      => false,
          :onwhen       => "1+"),
      ]
    ),
  ])
end
