class ApplicationHelper::Toolbar::ContainerTemplatesCenter < ApplicationHelper::Toolbar::Basic
  button_group('container_template_policy', [
    select(
      :container_template_policy_choice,
      nil,
      t = N_('Policy'),
      t,
      :enabled => false,
      :onwhen  => "1+",
      :items   => [
        button(
          :container_template_tag,
          'pficon pficon-edit fa-lg',
          N_('Edit Tags for these Container Templates'),
          N_('Edit Tags'),
          :url_parms    => "main_div",
          :send_checked => true,
          :enabled      => false,
          :onwhen       => "1+"),
      ]
    ),
  ])
end
