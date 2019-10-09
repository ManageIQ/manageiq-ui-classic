class ApplicationHelper::Toolbar::ContainerBuildsCenter < ApplicationHelper::Toolbar::Basic
  button_group('container_build_vmdb', [
    select(
      :container_build_vmdb_choice,
      nil,
      t = N_('Configuration'),
      t,
      :items => [
        button(
          :container_build_scan,
          'fa fa-search fa-lg',
          N_('Perform SmartState Analysis on the selected items'),
          N_('Perform SmartState Analysis'),
          :url_parms    => "main_div",
          :send_checked => true,
          :confirm      => N_("Perform SmartState Analysis on the selected items?"),
          :enabled      => false,
          :onwhen       => "1+"),
      ]
    ),
  ])
  button_group('container_build_policy', [
    select(
      :container_build_policy_choice,
      nil,
      t = N_('Policy'),
      t,
      :enabled => false,
      :onwhen  => "1+",
      :items   => [
        button(
          :container_build_tag,
          'pficon pficon-edit fa-lg',
          N_('Edit Tags for these Container Builds'),
          N_('Edit Tags'),
          :url_parms    => "main_div",
          :send_checked => true,
          :enabled      => false,
          :onwhen       => "1+"),
      ]
    ),
  ])
end
