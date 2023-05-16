class ApplicationHelper::Toolbar::GenericObjectDefinitionCenter < ApplicationHelper::Toolbar::Basic
  button_group('generic_object_definition', [
                 select(
                   :generic_object_definition_configuration,
                   nil,
                   N_('Configuration'),
                   :items => [
                     button(
                       :generic_object_definition_edit,
                       'pficon pficon-edit fa-lg',
                       t = N_('Edit this Generic Object Definition'),
                       t
                     ),
                     button(
                       :ab_group_new,
                       'pficon pficon-add-circle-o fa-lg',
                       N_('Add a new Button Group'),
                       :url => 'custom_button_group_new'
                     ),
                     button(
                       :ab_button_new,
                       'pficon pficon-add-circle-o fa-lg',
                       N_('Add a new Button'),
                       :url => 'custom_button_new'
                     ),
                     button(
                       :generic_object_definition_delete,
                       'pficon pficon-delete fa-lg',
                       N_('Remove this Generic Object Definitions from Inventory'),
                       :data => {'function'      => 'sendDataWithRx',
                                 'function-data' => {:controller     => 'provider_dialogs',
                                                     :modal_title    => N_('Delete Generic Object Definition'),
                                                     :modal_text     => N_('Warning: This Generic Object Definition will be permanently removed!'),
                                                     :api_url        => 'generic_object_definitions',
                                                     :async_delete   => false,
                                                     :redirect_url   => '/generic_object_definition/',
                                                     :component_name => 'RemoveGenericItemModal'}}
                     ),
                   ]
                 )
               ])
end
