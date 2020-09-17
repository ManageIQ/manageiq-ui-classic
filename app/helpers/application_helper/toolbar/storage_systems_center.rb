class ApplicationHelper::Toolbar::StorageSystemsCenter < ApplicationHelper::Toolbar::Basic
  button_group('storage_system_configuration', [
                 select(
                   :storage_system_configuration_choice,
                   nil,
                   t = N_('Configuration'),
                   t,
                   :items => [
                     button(
                       :storage_system_new,
                       'pficon pficon-add-circle-o fa-lg',
                       t = N_('Attach a new storage system'),
                       t
                     ),
                   ]
                 ),
               ])
end
