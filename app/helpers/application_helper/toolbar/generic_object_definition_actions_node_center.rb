class ApplicationHelper::Toolbar::GenericObjectDefinitionActionsNodeCenter < ApplicationHelper::Toolbar::Basic
  button_group('generic_object_definition', [
    select(
      :generic_object_definition_configuration,
      nil,
      N_('Configuration'),
      :items => [
        button(
          :ab_group_new,
          'pficon pficon-add-circle-o fa-lg',
          N_('Add a new Button Group'),
          :url => 'custom_button_group_new',
        ),
        button(
          :ab_button_new,
          'pficon pficon-add-circle-o fa-lg',
          N_('Add a new Button'),
          :url => 'custom_button_new',
        ),
      ]
    )
  ])
end
