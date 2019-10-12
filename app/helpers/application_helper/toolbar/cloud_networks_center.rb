class ApplicationHelper::Toolbar::CloudNetworksCenter < ApplicationHelper::Toolbar::Basic
  button_group(
    'cloud_network_vmdb',
    [
      select(
        :cloud_network_vmdb_choice,
        nil,
        t = N_('Configuration'),
        t,
        :items => [
          button(
            :cloud_network_new,
            'pficon pficon-add-circle-o fa-lg',
            t = N_('Add a new Cloud Network'),
            t,
            :klass => ApplicationHelper::Button::CloudNetworkNew
          ),
        ]
      )
    ]
  )
  button_group(
    'cloud_network_policy',
    [
      select(
        :cloud_network_policy_choice,
        nil,
        t = N_('Policy'),
        t,
        :enabled => false,
        :onwhen  => "1+",
        :items   => [
          button(
            :cloud_network_tag,
            'pficon pficon-edit fa-lg',
            N_('Edit Tags for the selected Cloud Networks'),
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
