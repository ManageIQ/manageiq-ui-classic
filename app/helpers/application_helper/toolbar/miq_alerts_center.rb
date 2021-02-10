class ApplicationHelper::Toolbar::MiqAlertsCenter < ApplicationHelper::Toolbar::Basic
  button_group('miq_alert_vmdb', [
    select(
      :miq_alert_vmdb_choice,
      nil,
      t = N_('Configuration'),
      t,
      :items => [
        button(
          :miq_alert_new,
          'pficon pficon-add-circle-o fa-lg',
          t = N_('Add a New Alert'),
          t,
          :url   => "/new",
          :klass => ApplicationHelper::Button::ButtonNewDiscover),
        button(
          :miq_alert_edit,
          'pficon pficon-edit fa-lg',
          t = N_('Edit the selected Policy Alert'),
          t,
          :url          => "/edit",
          :url_parms    => "main_div",
          :send_checked => true,
          :enabled      => false,
          :onwhen       => "1"),
        button(
          :miq_alert_copy,
          'pficon pficon-edit fa-lg',
          t = N_('Copy the selected Policy Alert'),
          t,
          :url          => "/copy",
          :url_parms    => "main_div",
          :send_checked => true,
          :enabled      => false,
          :onwhen       => "1"),
        button(
          :miq_alert,
          'pficon pficon-delete fa-lg',
          N_('Delete selected Policy Alerts'),
          N_('Delete Policy Alerts'),
          :enabled      => false,
          :onwhen       => "1+",
          :data         => {'function'      => 'sendDataWithRx',
                            'function-data' => {:api_url        => 'alert_definitions',
                                                :component_name => 'RemoveGenericItemModal',
                                                :redirect_url   => '/miq_alert/show_list',
                                                :controller     => 'provider_dialogs',
                                                :display_field  => 'description',
                                                :modal_text     => N_("Are you sure you want to delete this Policy Alerts?"),
                                                :modal_title    => N_("Delete Policy Alerts")}}
        ),
      ]
    ),
  ])
end
