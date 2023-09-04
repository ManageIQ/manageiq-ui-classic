class ApplicationHelper::Toolbar::MiqAlertCenter < ApplicationHelper::Toolbar::Basic
  button_group('miq_alert_vmdb', [
                 select(
                   :miq_alert_vmdb_choice,
                   nil,
                   t = N_('Configuration'),
                   t,
                   :items => [
                     button(
                       :miq_alert_edit,
                       'pficon pficon-edit fa-lg',
                       t = N_('Edit this Alert'),
                       t,
                       :url          => "/edit",
                       :send_checked => true
                     ),
                     button(
                       :miq_alert_copy,
                       'fa fa-files-o fa-lg',
                       t = N_('Copy this Alert'),
                       t,
                       :confirm => N_("Are you sure you want to copy this Alert?"),
                       :url     => "/copy"
                     ),
                     button(
                       :miq_alert_delete,
                       'pficon pficon-delete fa-lg',
                       t = N_('Delete this Alert'),
                       t,
                       :klass => ApplicationHelper::Button::MiqAlertDelete,
                       :data  => {'function'      => 'sendDataWithRx',
                                  'function-data' => {:api_url        => 'alert_definitions',
                                                      :component_name => 'RemoveGenericItemModal',
                                                      :redirect_url   => '/miq_alert/show_list',
                                                      :controller     => 'provider_dialogs',
                                                      :display_field  => 'description',
                                                      :modal_text     => N_("Are you sure you want to delete this Alert?"),
                                                      :modal_title    => N_("Delete Alert")}}
                     ),
                   ]
                 ),
               ])
end
