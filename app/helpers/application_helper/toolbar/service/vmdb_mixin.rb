module ApplicationHelper::Toolbar::Service::VmdbMixin
  def self.included(included_class)
    included_class.button_group('service_vmdb', [
                                  included_class.select(
                                    :service_vmdb_choice,
                                    nil,
                                    t = N_('Configuration'),
                                    t,
                                    :enabled => false,
                                    :onwhen  => "1+",
                                    :items   => [
                                      included_class.button(
                                        :service_edit,
                                        'pficon pficon-edit fa-lg',
                                        N_('Select a single service to edit'),
                                        N_('Edit Selected Service'),
                                        :url          => "/edit",
                                        :url_parms    => "main_div",
                                        :send_checked => true,
                                        :enabled      => false,
                                        :onwhen       => "1"
                                      ),
                                      included_class.button(
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
                                      included_class.separator,
                                      included_class.button(
                                        :service_ownership,
                                        'pficon pficon-user fa-lg',
                                        N_('Set Ownership for the selected Services'),
                                        N_('Set Ownership'),
                                        :url_parms    => "main_div",
                                        :send_checked => true,
                                        :enabled      => false,
                                        :onwhen       => "1+"
                                      ),
                                    ]
                                  ),
                                ])
  end
end
