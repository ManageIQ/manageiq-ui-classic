class ApplicationHelper::Toolbar::GenericObjectDefinitionCenter < ApplicationHelper::Toolbar::Basic
  button_group('generic_object_definition', [
    select(
      :generic_object_definition_configuration,
      'fa fa-cog fa-lg',
      title = N_('Configuration'),
      title,
      :items => [
        button(
          :generic_object_definition_custom_button_group_new,
          'pficon pficon-add-circle-o fa-lg',
          t = N_('Add a new Button Group'),
          t,
          :klass     => ApplicationHelper::Button::GenericObjectDefinitionCustomButtonGroupButtonNew,
          :url_parms => "custom_button_group_new_div"
        ),
        button(
          :generic_object_definition_custom_button_group_edit,
          'pficon pficon-edit fa-lg',
          t = N_('Edit this Custom Button Group'),
          t,
          :klass => ApplicationHelper::Button::GenericObjectDefinitionCustomButtonGroupButtonEdit,
        ),
        button(
          :generic_object_definition_custom_button_new,
          'pficon pficon-add-circle-o fa-lg',
          t = N_('Add a new Button'),
          t,
          :klass     => ApplicationHelper::Button::GenericObjectDefinitionCustomButtonButtonNew,
          :url_parms => "custom_button_new_div"
        ),
        button(
          :generic_object_definition_custom_button_edit,
          'pficon pficon-edit fa-lg',
          t = N_('Edit this Custom Button'),
          t,
          :klass => ApplicationHelper::Button::GenericObjectDefinitionCustomButtonButtonEdit,
        ),
        button(
          :generic_object_definition_edit,
          'pficon pficon-edit fa-lg',
          t = N_('Edit this Generic Object Class'),
          t,
          :klass => ApplicationHelper::Button::GenericObjectDefinitionButtonEdit,
        ),
        button(
          :generic_object_definition_custom_button_group_delete,
          'pficon pficon-delete fa-lg',
          t = N_('Remove this Custom Button Group from Inventory'),
          t,
          :klass   => ApplicationHelper::Button::GenericObjectDefinitionCustomButtonGroupButtonEdit,
          :confirm => N_("Warning: This Custom Button Group will be permanently removed!"),
        ),
        button(
          :generic_object_definition_custom_button_delete,
          'pficon pficon-delete fa-lg',
          t = N_('Remove this Custom Button from Inventory'),
          t,
          :klass   => ApplicationHelper::Button::GenericObjectDefinitionCustomButtonButtonEdit,
          :confirm => N_("Warning: This Custom Button will be permanently removed!"),
        ),
        button(
          :generic_object_definition_delete,
          'pficon pficon-delete fa-lg',
          t = N_('Remove this Generic Object Classes from Inventory'),
          t,
          :data    => {'function'      => 'sendDataWithRx',
                       'function-data' => '{"type": "delete", "controller": "genericObjectDefinitionToolbarController"}'},
          :klass   => ApplicationHelper::Button::GenericObjectDefinitionButtonDelete,
          :confirm => N_("Warning: This Generic Object Class will be permanently removed!"),
        )
      ]
    )
  ])
end
