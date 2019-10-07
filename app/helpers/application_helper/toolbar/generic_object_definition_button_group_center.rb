class ApplicationHelper::Toolbar::GenericObjectDefinitionButtonGroupCenter < ApplicationHelper::Toolbar::Basic
  button_group('generic_object_definition', [
    select(
      :generic_object_definition_configuration,
      'fa fa-cog fa-lg',
      N_('Configuration'),
      :items => [
        button(
          :ab_group_edit,
          'pficon pficon-edit fa-lg',
          N_('Edit this Button Group'),
          :url => 'custom_button_group_edit',
        ),
        button(
          :ab_button_new,
          'pficon pficon-add-circle-o fa-lg',
          N_('Add a new Button'),
          :url => 'custom_button_new',
        ),
        button(
          :custom_button_set_delete,
          'pficon pficon-delete fa-lg',
          N_('Remove this Custom Button Group from Inventory'),
          :confirm => N_("Warning: This Custom Button Group will be permanently removed!"),
          :klass   => ApplicationHelper::Button::GenericObjectDefinitionButtonButtonGroupDelete,
        ),
      ]
    )
  ])
end
