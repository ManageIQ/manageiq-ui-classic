class ApplicationHelper::Toolbar::GenericObjectDefinitionsCenter < ApplicationHelper::Toolbar::Basic
  button_group('generic_object_definition', [
    select(
      :generic_object_definition_configuration,
      nil,
      N_('Configuration'),
      :items => [
        button(
          :generic_object_definition_new,
          'pficon pficon-add-circle-o fa-lg',
          t = N_('Add a new Generic Object Definition'),
          t,
        ),
        button(
          :generic_object_definition_edit,
          'pficon pficon-edit fa-lg',
          N_('Edit selected Generic Object Definition'),
          :enabled      => false,
          :onwhen       => "1",
          :url_parms    => "edit_div",
          :send_checked => true,
        ),
        button(
          :generic_object_definition_delete,
          'pficon pficon-delete fa-lg',
          t = N_('Remove selected Generic Object Definitions from Inventory'),
          t,
          :data    => {'function'      => 'sendDataWithRx',
                       'function-data' => {:type => "delete", :controller => "genericObjectDefinitionToolbarController", :entity => "Generic Object Definitions"}},
          :enabled                     => false,
          :onwhen                      => "1+",
          :confirm => N_("Warning: This Generic Object Definition will be permanently removed!")
        ),
      ]
    )
  ])
end
