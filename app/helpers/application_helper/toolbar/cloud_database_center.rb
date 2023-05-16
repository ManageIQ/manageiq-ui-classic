class ApplicationHelper::Toolbar::CloudDatabaseCenter < ApplicationHelper::Toolbar::Basic
  button_group('cloud_database_vmdb_choice', [  ## TODO: rename to something better?
                 select(
                   :cloud_database_vmdb_choice,
                   nil,
                   t = N_('Configuration'),
                   t,
                   :items => [
                     button(
                       :cloud_database_edit,
                       'pficon pficon-edit fa-lg',
                       N_('Select this Cloud Database'),
                       N_('Edit Cloud Database')
                     ),
                     button(
                       :cloud_database_delete,
                       'pficon pficon-edit fa-lg',
                       N_('Delete selected Cloud Database'),
                       N_('Delete Cloud Databases'),
                       :url_parms    => "main_div",
                       :send_checked => true,
                       :confirm      => N_("Warning: The selected Cloud Database will be permanently deleted!"),
                       :klass        => ApplicationHelper::Button::GenericFeatureButtonWithDisable,
                       :options      => {:feature => :delete}
                     )
                   ]
                 )
               ])
end
