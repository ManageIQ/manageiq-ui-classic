class ApplicationHelper::Toolbar::GenericObjectDefinitionButtonGroupCenter < ApplicationHelper::Toolbar::Basic
  button_group('generic_object_definition', [
    select(
      :generic_object_definition_configuration,
      nil,
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
          :ab_button_delete,
          'pficon pficon-delete fa-lg',
          N_('Remove this Button Group from Inventory'),
          :data    => {'function'      => 'sendDataWithRx',
                       'function-data' => '{"type": "delete_custom_button_set", "controller": "genericObjectDefinitionToolbarController", "entity": "Button Group"}'},
          :klass   => ApplicationHelper::Button::GenericObjectDefinitionButtonButtonGroupDelete,
          :confirm => N_("Warning: This Button Group will be permanently removed!"),
        ),
      ]
    )
  ])
end
