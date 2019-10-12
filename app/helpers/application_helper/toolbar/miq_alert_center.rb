class ApplicationHelper::Toolbar::MiqAlertCenter < ApplicationHelper::Toolbar::Basic
  button_group('miq_alert_vmdb', [
    select(
      :miq_alert_vmdb_choice,
      nil,
      t = N_('Configuration'),
      t,
      :items => [
        button(
          :alert_edit,
          'pficon pficon-edit fa-lg',
          t = N_('Edit this Alert'),
          t,
          :url_parms    => "main_div",
          :send_checked => true),
        button(
          :alert_copy,
          'fa fa-files-o fa-lg',
          t = N_('Copy this Alert'),
          t,
          :confirm   => N_("Are you sure you want to copy this Alert?"),
          :url_parms => "?copy=true"),
        button(
          :alert_delete,
          'pficon pficon-delete fa-lg',
          t = N_('Delete this Alert'),
          t,
          :url_parms    => "main_div",
          :send_checked => true,
          :confirm      => N_("Are you sure you want to delete this Alert?"),
          :klass        => ApplicationHelper::Button::MiqAlertDelete),
      ]
    ),
  ])
end
