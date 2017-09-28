class ApplicationHelper::Toolbar::GenericObjectDefinitionCenter < ApplicationHelper::Toolbar::Basic
  button_group('generic_object_definition', [
    select(
      :generic_object_definition_configuration,
      'fa fa-cog fa-lg',
      title = N_('Configuration'),
      title,
      :items => [
        button(
          :generic_object_definition_edit,
          'pficon pficon-edit fa-lg',
          t = N_('Edit this Generic Object Class'),
          t,
          :klass => ApplicationHelper::Button::GenericObjectDefinition,
        ),
        button(
          :generic_object_definition_delete,
          'pficon pficon-delete fa-lg',
          t = N_('Remove this Generic Object Classes from Inventory'),
          t,
          :klass => ApplicationHelper::Button::GenericObjectDefinitionDeleteButton,
          :confirm => N_("Warning: This Generic Object Class will be permanently removed!"),
        )
      ]
    )
  ])
end
