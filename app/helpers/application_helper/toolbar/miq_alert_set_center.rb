class ApplicationHelper::Toolbar::MiqAlertSetCenter < ApplicationHelper::Toolbar::Basic
  button_group('miq_alert_set_vmdb', [
    select(
      :miq_alert_set_vmdb_choice,
      nil,
      t = N_('Configuration'),
      t,
      :items => [
        button(
          :miq_alert_set_edit,
          'pficon pficon-edit fa-lg',
          t = N_('Edit this Alert Profile'),
          t,
          :url_parms    => "main_div",
          :send_checked => true),
        button(
          :miq_alert_set_assign,
          'pficon pficon-edit fa-lg',
          t = N_('Edit assignments for this Alert Profile'),
          t,
          :url_parms    => "main_div",
          :send_checked => true),
        button(
          :miq_alert_set_delete,
          'pficon pficon-delete fa-lg',
          t = N_('Delete this Alert Profile'),
          t,
          :data  => {'function'      => 'sendDataWithRx',
                     'function-data' => {:api_url        => 'alert_definition_profiles',
                                         :component_name => 'RemoveGenericItemModal',
                                         :controller     => 'provider_dialogs',
                                         :display_field  => 'description',
                                         :modal_text     => N_("Are you sure you want to delete this Alert Profile?"),
                                         :modal_title    => N_("Delete Alert Profile"),
                                         :ajax_reload    => true}}),
      ]
    ),
  ])
end
