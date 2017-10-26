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
          :klass => ApplicationHelper::Button::GenericObjectDefinitionButtonEdit,
        ),
        button(
          :ab_group_new,
          'pficon pficon-add-circle-o fa-lg',
          t = N_('Add a new Button Group'),
          t,
          :url => 'custom_button_group_new',
          :klass => ApplicationHelper::Button::GenericObjectDefinitionButtonEdit,
        ),
        button(
          :ab_group_edit,
          'pficon pficon-add-circle-o fa-lg',
          t = N_('Edit this Button Group'),
          t,
          :url => 'custom_button_group_edit',
          :klass => ApplicationHelper::Button::GenericObjectDefinitionButtonButtonGroupEdit,
        ),
        button(
          :ab_button_new,
          'pficon pficon-add-circle-o fa-lg',
          t = N_('Add a new Button'),
          t,
          :klass => ApplicationHelper::Button::GenericObjectDefinitionButtonEdit,
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
          :ab_button_delete,
          'pficon pficon-delete fa-lg',
          t = N_('Remove this Button Group from Inventory'),
          t,
          :klass   => ApplicationHelper::Button::GenericObjectDefinitionButtonButtonGroupDelete,
          :confirm => N_("Warning: This Generic Object Class will be permanently removed!"),
        )
      ]
    )
  ])
end
