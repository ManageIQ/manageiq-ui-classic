class ApplicationHelper::Toolbar::GenericObjectDefinitionButtonCenter < ApplicationHelper::Toolbar::Basic
  button_group('generic_object_definition', [
    select(
      :generic_object_definition_configuration,
      'fa fa-cog fa-lg',
      title = N_('Configuration'),
      title,
      :items => [
        button(
          :ab_group_edit,
          'pficon pficon-add-circle-o fa-lg',
          t = N_('Edit this Button'),
          t,
          :url => 'custom_button_edit',
        ),
        button(
          :ab_button_delete,
          'pficon pficon-delete fa-lg',
          t = N_('Remove this Button from Inventory'),
          t,
          :data    => {'function'      => 'sendDataWithRx',
                       'function-data' => '{"type": "delete_custom_button", "controller": "genericObjectDefinitionToolbarController", "entity": "Button"}'},
          :confirm => N_("Warning: This Button will be permanently removed!"),
        )
      ]
    )
  ])
end
