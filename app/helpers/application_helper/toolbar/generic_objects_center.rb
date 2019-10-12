class ApplicationHelper::Toolbar::GenericObjectsCenter < ApplicationHelper::Toolbar::Basic
  button_group('generic_object_policy', [
    select(
      :generic_object_policy_choice,
      nil,
      t = N_('Policy'),
      t,
      :enabled => false,
      :onwhen  => "1+",
      :items   => [
        button(
          :generic_object_tag,
          'pficon pficon-edit fa-lg',
          N_('Edit Tags for the selected Generic Object Instances'),
          N_('Edit Tags'),
          :url_parms    => "main_div",
          :send_checked => true,
          :enabled      => false,
          :onwhen       => "1+"
        ),
      ]
    ),
  ])
end
