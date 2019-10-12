class ApplicationHelper::Toolbar::FlavorCenter < ApplicationHelper::Toolbar::Basic
  button_group('flavor_configuration', [
    select(
      :flavor_configuration_choice,
      nil,
      t = N_('Configuration'),
      t,
      :items => [
        button(
          :flavor_delete,
          'pficon pficon-delete fa-lg',
          t = N_('Remove Flavor'),
          t,
          :url_parms => "main_div",
          :confirm   => N_("Warning: The selected Flavor will be permanently removed!"),
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
      :items => [
        button(
          :flavor_tag,
          'pficon pficon-edit fa-lg',
          N_('Edit Tags for this Flavor'),
          N_('Edit Tags')),
      ]
    ),
  ])
end
