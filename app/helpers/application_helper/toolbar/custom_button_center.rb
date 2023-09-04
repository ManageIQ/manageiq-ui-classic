class ApplicationHelper::Toolbar::CustomButtonCenter < ApplicationHelper::Toolbar::Basic
  button_group('custom_button_vmdb', [
                 select(
                   :custom_button_vmdb_choice,
                   nil,
                   t = N_('Configuration'),
                   t,
                   :items => [
                     button(
                       :ab_button_edit,
                       'pficon pficon-edit fa-lg',
                       t = N_('Edit this Button'),
                       t,
                       :url_parms    => "main_div",
                       :send_checked => true
                     ),
                     button(
                       :ab_button_delete,
                       'pficon pficon-delete fa-lg',
                       t = N_('Remove this Button'),
                       t,
                       :klass => ApplicationHelper::Button::CatalogItemButton,
                       :data  => {'function'      => 'sendDataWithRx',
                                  'function-data' => {:controller     => 'provider_dialogs',
                                                      :modal_title    => N_('Delete Button'),
                                                      :modal_text     => N_('Are you sure you want to delete the following Button?'),
                                                      :api_url        => 'custom_buttons',
                                                      :async_delete   => false,
                                                      :ajax_reload    => true,
                                                      :component_name => 'RemoveGenericItemModal'}}
                     ),
                     separator,
                     button(
                       :ab_button_simulate,
                       'fa fa-play-circle-o fa-lg',
                       N_('Simulate using Button details'),
                       N_('Simulate'),
                       :keepSpinner => true,
                       :url         => "resolve",
                       :url_parms   => "?button=simulate"
                     ),
                   ]
                 ),
               ])
end
