class ApplicationHelper::Toolbar::MiqPoliciesCenter < ApplicationHelper::Toolbar::Basic
  button_group('miq_policy_vmdb', [
                 select(
                   :miq_policy_vmdb_choice,
                   nil,
                   t = N_('Configuration'),
                   t,
                   :items => [
                     button(
                       :miq_policy_new,
                       'pficon pficon-add-circle-o fa-lg',
                       t = N_('Add a New Policy'),
                       t,
                       :url   => "/new",
                       :klass => ApplicationHelper::Button::ButtonNewDiscover
                     ),
                     button(
                       :miq_policy_edit,
                       'pficon pficon-edit fa-lg',
                       t = N_('Edit the selected Policy'),
                       t,
                       :url          => "/edit",
                       :url_parms    => "main_div",
                       :send_checked => true,
                       :enabled      => false,
                       :onwhen       => "1"
                     ),
                     button(
                       :miq_policy_copy,
                       'fa fa-files-o fa-lg',
                       t = N_('Copy the selected Policy'),
                       t,
                       :url          => "/copy",
                       :url_parms    => "main_div",
                       :send_checked => true,
                       :enabled      => false,
                       :onwhen       => "1"
                     ),
                     button(
                       :miq_policy_delete,
                       'pficon pficon-delete fa-lg',
                       N_('Delete the selected Policies'),
                       N_('Delete Policies'),
                       :enabled => false,
                       :onwhen  => "1+",
                       :data    => {'function'      => 'sendDataWithRx',
                                    'function-data' => {:api_url        => 'policies',
                                                        :component_name => 'RemoveGenericItemModal',
                                                        :controller     => 'provider_dialogs',
                                                        :modal_text     => N_("Are you sure you want to delete these Policies?"),
                                                        :modal_title    => N_("Delete Policies"),
                                                        :redirect_url   => '/miq_policy/show_list',
                                                        :display_field  => 'description'}}
                     ),
                     button(
                       :miq_policy_conditions_assignment,
                       'pficon pficon-edit fa-lg',
                       t = N_('Edit the selected Policy\'s Condition assignments'),
                       t,
                       :url          => "/miq_policy_edit_conditions",
                       :url_parms    => "main_div",
                       :send_checked => true,
                       :enabled      => false,
                       :onwhen       => "1"
                     ),
                     button(
                       :miq_policy_events_assignment,
                       'pficon pficon-edit fa-lg',
                       t = N_('Edit the selected Policy\'s Event assignments'),
                       t,
                       :url          => "/miq_policy_edit_events",
                       :url_parms    => "main_div",
                       :send_checked => true,
                       :enabled      => false,
                       :onwhen       => "1"
                     ),
                     button(
                       :miq_policy_event_edit,
                       'pficon pficon-edit fa-lg',
                       t = N_('Edit Actions for the selected Policy\'s Event'),
                       t,
                       :url          => "/miq_event_edit",
                       :url_parms    => "main_div",
                       :send_checked => true,
                       :enabled      => false,
                       :onwhen       => "1"
                     ),
                   ]
                 ),
               ])
end
