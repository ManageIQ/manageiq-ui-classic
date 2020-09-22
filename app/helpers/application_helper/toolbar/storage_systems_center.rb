class ApplicationHelper::Toolbar::PhysicalStoragesCenter < ApplicationHelper::Toolbar::Basic
  button_group('physical_storage_configuration', [
                 select(
                   :physical_storage_configuration_choice,
                   nil,
                   t = N_('Configuration'),
                   t,
                   :items => [
                     button(
                       :physical_storage_new,
                       'pficon pficon-add-circle-o fa-lg',
                       t = N_('Attach a new storage system'),
                       t
                     ),
                   ]
                 ),
               ])
end
