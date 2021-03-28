class ApplicationHelper::Toolbar::ServiceCenter < ApplicationHelper::Toolbar::Basic
  button_group('service_vmdb', [
                 select(
                   :service_vmdb_choice,
                   nil,
                   t = N_('Configuration'),
                   t,
                   :items => [
                     button(
                       :service_edit,
                       'pficon pficon-edit fa-lg',
                       t = N_('Edit this Service'),
                       t
                     ),
                     button(
                       :service_delete,
                       'pficon pficon-delete fa-lg',
                       t = N_('Remove Service from Inventory'),
                       t,
                       :data => {'function'      => 'sendDataWithRx',
                                 'function-data' => {:controller     => 'provider_dialogs',
                                                     :modal_title    => N_('Remove this Service from Inventory'),
                                                     :modal_text     => N_('Are you sure you want to delete the following Service?'),
                                                     :api_url        => 'services',
                                                     :async_delete   => true,
                                                     :redirect_url   => '/service/show_list',
                                                     :component_name => 'RemoveGenericItemModal'}}
                     ),
                     separator,
                     button(
                       :service_ownership,
                       'pficon pficon-user fa-lg',
                       N_('Set Ownership for this Service'),
                       N_('Set Ownership'),
                       :klass => ApplicationHelper::Button::SetOwnership
                     ),
                     separator,
                     button(
                       :service_reconfigure,
                       'pficon pficon-edit fa-lg',
                       N_('Reconfigure the options of this Service'),
                       N_('Reconfigure this Service'),
                       :klass   => ApplicationHelper::Button::GenericFeatureButton,
                       :options => {:feature => :reconfigure}
                     ),
                   ]
                 ),
               ])
  button_group('service_policy', [
                 select(
                   :service_policy_choice,
                   nil,
                   t = N_('Policy'),
                   t,
                   :items => [
                     button(
                       :service_tag,
                       'pficon pficon-edit fa-lg',
                       N_('Edit Tags for this Service'),
                       N_('Edit Tags'),
                       :url_parms => "main_div"
                     ),
                   ]
                 ),
               ])
  button_group('service_lifecycle', [
                 select(
                   :service_lifecycle_choice,
                   nil,
                   t = N_('Lifecycle'),
                   t,
                   :items => [
                     button(
                       :service_retire,
                       'fa fa-clock-o fa-lg',
                       t = N_('Set Retirement Dates for this Service'),
                       t,
                       :klass => ApplicationHelper::Button::ServiceRetire
                     ),
                     button(
                       :service_retire_now,
                       'fa fa-clock-o fa-lg',
                       t = N_('Retire this Service'),
                       t,
                       :confirm => N_("Retire this Service?"),
                       :klass   => ApplicationHelper::Button::ServiceRetireNow
                     ),
                   ]
                 ),
               ])
end
