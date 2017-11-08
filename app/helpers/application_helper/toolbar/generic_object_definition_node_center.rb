class ApplicationHelper::Toolbar::GenericObjectDefinitionNodeCenter < ApplicationHelper::Toolbar::Basic
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
        ),
        button(
          :ab_group_new,
          'pficon pficon-add-circle-o fa-lg',
          t = N_('Add a new Button Group'),
          t,
          :url => 'custom_button_group_new',
        ),
        button(
          :ab_button_new,
          'pficon pficon-add-circle-o fa-lg',
          t = N_('Add a new Button'),
          t,
          :url => 'custom_button_new',
        ),
        button(
          :generic_object_definition_delete,
          'pficon pficon-delete fa-lg',
          t = N_('Remove this Generic Object Classes from Inventory'),
          t,
          :data    => {'function'      => 'sendDataWithRx',
                       'function-data' => '{"type": "delete", "controller": "genericObjectDefinitionToolbarController", "entity": "Generic Object Class"}'},
          :klass   => ApplicationHelper::Button::GenericObjectDefinitionButtonDelete,
          :confirm => N_("Warning: This Generic Object Class will be permanently removed!"),
        ),
      ]
    )
  ])
end
