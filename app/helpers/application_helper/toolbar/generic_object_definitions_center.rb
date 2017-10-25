class ApplicationHelper::Toolbar::GenericObjectDefinitionsCenter < ApplicationHelper::Toolbar::Basic
  button_group('generic_object_definition', [
    select(
      :generic_object_definition_configuration,
      'fa fa-cog fa-lg',
      t = N_('Configuration'),
      t,
      :items => [
        button(
          :generic_object_definition_new,
          'pficon pficon-add-circle-o fa-lg',
          t = N_('Add a new Generic Object Class'),
          t),
        button(
          :ab_group_new,
          'pficon pficon-add-circle-o fa-lg',
          t = N_('Add a new Button Group'),
          t,
          :enabled      => false,
          :onwhen       => "1",
          :url_parms    => "new_button_group_div",
          :send_checked => true,
          :klass => ApplicationHelper::Button::GenericObjectDefinition,
        ),
        button(
          :ab_button_new,
          'pficon pficon-add-circle-o fa-lg',
          t = N_('Add a new Button'),
          t,
          :enabled      => false,
          :onwhen       => "1",
          :url_parms    => "new_button_div",
          :send_checked => true,
          :klass => ApplicationHelper::Button::GenericObjectDefinition,
        ),
        button(
          :generic_object_definition_edit,
          'pficon pficon-edit fa-lg',
          t = N_('Edit Selected Generic Object Class'),
          t,
          :enabled      => false,
          :onwhen       => "1",
          :url_parms    => "edit_div",
          :send_checked => true),
        button(
          :generic_object_definition_delete,
          'pficon pficon-delete fa-lg',
          t = N_('Remove selected Generic Object Classes from Inventory'),
          t,
          :data                        => {'function'      => 'sendDataWithRx',
                       'function-data' => '{"type": "delete", "controller": "genericObjectDefinitionToolbarController"}'},
          :enabled                     => false,
          :onwhen                      => "1+",
          :confirm                     => N_("Warning: The selected Generic Object Classes will be permanently removed!")),
      ]
    )
  ])
end
