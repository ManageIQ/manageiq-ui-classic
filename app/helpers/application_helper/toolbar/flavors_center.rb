class ApplicationHelper::Toolbar::FlavorsCenter < ApplicationHelper::Toolbar::Basic
  button_group('flavor_configuration', [
    select(
      :flavor_configuration_choice,
      nil,
      t = N_('Configuration'),
      t,
      :items => [
        button(
          :flavor_create,
          'pficon pficon-add-circle-o fa-lg',
          t = N_('Add a new Flavor'),
          t,
          :klass => ApplicationHelper::Button::NewFlavor
        ),
        separator,
        button(
          :flavor_delete,
          'pficon pficon-delete fa-lg',
          t = N_('Remove selected Flavors'),
          t,
          :url_parms => "main_div",
          :send_checked => true,
          :confirm   => N_("Warning: The selected Flavors will be permanently removed!"),
          :enabled   => false,
          :onwhen    => "1+"
        ),
      ]
    ),
  ])
  button_group('flavor_policy', [
    select(
      :flavor_policy_choice,
      nil,
      t = N_('Policy'),
      t,
      :enabled => false,
      :onwhen  => "1+",
      :items   => [
        button(
          :flavor_tag,
          'pficon pficon-edit fa-lg',
          N_('Edit Tags for the selected Flavors'),
          N_('Edit Tags'),
          :url_parms    => "main_div",
          :send_checked => true,
          :enabled      => false,
          :onwhen       => "1+"),
      ]
    ),
  ])
end
