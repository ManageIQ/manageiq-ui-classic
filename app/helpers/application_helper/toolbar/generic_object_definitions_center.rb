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
          :generic_object_definition_edit,
          'pficon pficon-edit fa-lg',
          t = N_('Edit Selected Generic Object Class'),
          t,
          :enabled      => false,
          :onwhen       => "1",
          :url_parms    => "edit_div",
          :send_checked => true),
        button(
          :generic_object_definition_custom_button_group_new,
          'pficon pficon-add-circle-o fa-lg',
          t = N_('Add a new Button Group'),
          t,
          :enabled   => false,
          :onwhen    => "1",
          :url_parms => "custom_button_group_new_div"
        ),
        button(
          :generic_object_definition_custom_button_new,
          'pficon pficon-add-circle-o fa-lg',
          t = N_('Add a new Button'),
          t,
          :enabled   => false,
          :onwhen    => "1",
          :url_parms => "custom_button_new_div"
        ),
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
