class ApplicationHelper::Toolbar::MiqAlertSetsCenter < ApplicationHelper::Toolbar::Basic
  button_group('miq_alert_set_vmdb', [
    select(
      :miq_alert_set_vmdb_choice,
      nil,
      t = N_('Configuration'),
      t,
      :items => [
        button(
          :miq_alert_set_new,
          'pficon pficon-add-circle-o fa-lg',
          t = proc do
            _('Add a New Alert Profile')
          end,
          t,
          :url   => "/new",
          :klass => ApplicationHelper::Button::ButtonNewDiscover),
        button(
          :miq_alert_set_edit,
          'pficon pficon-edit fa-lg',
          t = N_('Edit the selected Alert Profile'),
          t,
          :url          => "/edit",
          :url_parms    => "main_div",
          :send_checked => true,
          :enabled      => false,
          :onwhen       => "1"),
        button(
          :miq_alert_set_delete,
          'pficon pficon-delete fa-lg',
          N_('Delete selected Alert Profiles'),
          N_('Delete Alert Profiles'),
          :enabled      => false,
          :onwhen       => "1+",
          :data         => {'function'      => 'sendDataWithRx',
                            'function-data' => {:api_url        => 'alert_definition_profiles',
                                                :redirect_url   => '/miq_alert_set/show_list',
                                                :component_name => 'RemoveGenericItemModal',
                                                :controller     => 'provider_dialogs',
                                                :display_field  => 'description',
                                                :modal_text     => N_("Are you sure you want to delete selected Actions?"),
                                                :modal_title    => N_("Delete Actions")}}
        ),
      ]
    ),
  ])
end
