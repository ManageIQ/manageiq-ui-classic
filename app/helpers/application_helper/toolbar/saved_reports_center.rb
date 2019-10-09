class ApplicationHelper::Toolbar::SavedReportsCenter < ApplicationHelper::Toolbar::Basic
  button_group('saved_report_reloading', [
    button(
      :reload,
      'fa fa-refresh fa-lg',
      N_('Refresh selected Reports'),
      nil,
      :url   => "reload",
      :klass => ApplicationHelper::Button::Reload)
  ])
  button_group('saved_report_vmdb', [
    select(
      :saved_report_vmdb_choice,
      nil,
      t = N_('Configuration'),
      t,
      :items => [
        button(
          :saved_report_delete,
          'pficon pficon-delete fa-lg',
          t = N_('Delete selected Saved Reports'),
          t,
          :url_parms    => "main_div",
          :send_checked => true,
          :confirm      => N_("Warning: The selected Saved Reports will be permanently removed from the database!"),
          :enabled      => false,
          :onwhen       => "1+",
          :klass        => ApplicationHelper::Button::SavedReportDelete),
      ]
    ),
  ])
end
