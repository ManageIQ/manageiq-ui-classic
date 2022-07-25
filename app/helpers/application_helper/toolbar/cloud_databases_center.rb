class ApplicationHelper::Toolbar::CloudDatabasesCenter < ApplicationHelper::Toolbar::Basic
  button_group('cloud_database_vmdb_choice', [ ## TODO: rename to something better?
    select(
      :cloud_database_vmdb_choice,
      nil,
      t = N_('Configuration'),
      t,
      :items => [
        button(
          :cloud_database_new,
          'pficon pficon-edit fa-lg',
          t = N_('Add a new Cloud Database'),
          t,
          :url   => "/new", # TODO: is this still needed?
          :klass => ApplicationHelper::Button::NewCloudDatabase
        ),
        button(
          :cloud_database_edit,
          'pficon pficon-edit fa-lg',
          N_('Select a single cloud database edit '),
          N_('Edit Selected Cloud Database'),
          :url_parms    => "main_div",
          :send_checked => true,
          :enabled      => false,
          :onwhen       => "1"
        ),
        button(
          :cloud_database_delete,
          'pficon pficon-edit fa-lg',
          N_('Delete selected Cloud Database'),
          N_('Delete Cloud Database'),
          :url_parms    => "main_div",
          :send_checked => true,
          :confirm      => N_("Warning: The selected Cloud Database will be permanently deleted!"),
          :enabled      => false,
          :onwhen       => "1+"
        )
      ]
    )
  ])
end
