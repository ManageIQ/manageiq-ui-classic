class ApplicationHelper::Toolbar::NetworkPortsCenter < ApplicationHelper::Toolbar::Basic
  button_group('network_port_policy', [
    select(
      :network_port_policy_choice,
      'fa fa-shield fa-lg',
      t = N_('Policy'),
      t,
      :enabled => false,
      :onwhen  => "1+",
      :items   => [
        button(
          :network_port_tag,
          'pficon pficon-edit fa-lg',
          N_('Edit Tags for the selected Network Ports'),
          N_('Edit Tags'),
          :url_parms    => "main_div",
          :send_checked => true,
          :enabled      => false,
          :onwhen       => "1+"),
      ]
    ),
  ])
end
