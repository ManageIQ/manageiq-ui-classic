class ApplicationHelper::Toolbar::GenericObjectDefinitionsCenter < ApplicationHelper::Toolbar::Basic
  button_group('generic_object_definition', [
    select(
      :generic_object_definition_configuration,
      'fa fa-cog fa-lg',
      title = N_('Configuration'),
      title,
      :items => [
        button(
          :generic_object_definition_new,
          'pficon pficon-add-circle-o fa-lg',
          t = N_('Add a new Generic Object Class'),
          t,
          :klass => ApplicationHelper::Button::GenericObjectDefinitionButtonRoot
        ),
        button(
          :generic_object_definition_edit,
          'pficon pficon-edit fa-lg',
          t = N_('Edit this Generic Object Class'),
          t,
          :klass => ApplicationHelper::Button::GenericObjectDefinitionButtonEdit,
        ),
        button(
          :generic_object_definition_edit,
          'pficon pficon-edit fa-lg',
          t = N_('Edit selected Generic Object Class'),
          t,
          :enabled      => false,
          :onwhen       => "1",
          :url_parms    => "edit_div",
          :send_checked => true,
          :klass        => ApplicationHelper::Button::GenericObjectDefinitionButtonRoot
        ),
        button(
          :ab_group_new,
          'pficon pficon-add-circle-o fa-lg',
          t = N_('Add a new Button Group'),
          t,
          :url   => 'custom_button_group_new',
          :klass => ApplicationHelper::Button::GenericObjectDefinitionButtonButtonGroupNew,
        ),
        button(
          :ab_group_edit,
          'pficon pficon-add-circle-o fa-lg',
          t = N_('Edit this Button Group'),
          t,
          :url   => 'custom_button_group_edit',
          :klass => ApplicationHelper::Button::GenericObjectDefinitionButtonButtonGroupEdit,
        ),
        button(
          :ab_group_edit,
          'pficon pficon-add-circle-o fa-lg',
          t = N_('Edit this Button'),
          t,
          :url   => 'custom_button_edit',
          :klass => ApplicationHelper::Button::GenericObjectDefinitionButtonButtonEdit,
        ),
        button(
          :ab_button_new,
          'pficon pficon-add-circle-o fa-lg',
          t = N_('Add a new Button'),
          t,
          :url   => 'custom_button_new',
          :klass => ApplicationHelper::Button::GenericObjectDefinitionButtonButtonNew,
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
        ),
        button(
          :generic_object_definition_delete,
          'pficon pficon-delete fa-lg',
          t = N_('Remove selected Generic Object Classes from Inventory'),
          t,
          :data    => {'function'      => 'sendDataWithRx',
                       'function-data' => '{"type": "delete", "controller": "genericObjectDefinitionToolbarController"}'},
          :enabled                     => false,
          :onwhen                      => "1+",
          :klass   => ApplicationHelper::Button::GenericObjectDefinitionButtonRoot,
          :confirm => N_("Warning: This Generic Object Class will be permanently removed!")
        ),
        button(
          :ab_button_delete,
          'pficon pficon-delete fa-lg',
          t = N_('Remove this Button Group from Inventory'),
          t,
          :data    => {'function'      => 'sendDataWithRx',
                       'function-data' => '{"type": "delete_custom_button_set", "controller": "genericObjectDefinitionToolbarController", "entity": "Button Group"}'},
          :klass   => ApplicationHelper::Button::GenericObjectDefinitionButtonButtonGroupDelete,
          :confirm => N_("Warning: This Button Group will be permanently removed!"),
        ),
        button(
          :ab_button_delete,
          'pficon pficon-delete fa-lg',
          t = N_('Remove this Button from Inventory'),
          t,
          :data    => {'function'      => 'sendDataWithRx',
                       'function-data' => '{"type": "delete_custom_button", "controller": "genericObjectDefinitionToolbarController", "entity": "Button"}'},
          :klass   => ApplicationHelper::Button::GenericObjectDefinitionButtonButtonDelete,
          :confirm => N_("Warning: This Button will be permanently removed!"),
        )
      ]
    )
  ])
end
