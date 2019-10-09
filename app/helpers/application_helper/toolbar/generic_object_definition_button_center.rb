class ApplicationHelper::Toolbar::GenericObjectDefinitionButtonCenter < ApplicationHelper::Toolbar::Basic
  button_group('generic_object_definition', [
    select(
      :generic_object_definition_configuration,
      nil,
      N_('Configuration'),
      :items => [
        button(
          :ab_group_edit,
          'pficon pficon-edit fa-lg',
          N_('Edit this Button'),
          :url => 'custom_button_edit',
        ),
        button(
          :ab_button_delete,
          'pficon pficon-delete fa-lg',
          N_('Remove this Button from Inventory'),
          :data    => {'function'      => 'sendDataWithRx',
                       'function-data' => '{"type": "delete_custom_button", "controller": "genericObjectDefinitionToolbarController", "entity": "Button"}'},
          :confirm => N_("Warning: This Button will be permanently removed!"),
        )
      ]
    )
  ])
end
