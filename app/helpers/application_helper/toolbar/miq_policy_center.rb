class ApplicationHelper::Toolbar::MiqPolicyCenter < ApplicationHelper::Toolbar::Basic
  button_group('miq_policy_vmdb', [
    select(
      :miq_policy_vmdb_choice,
      nil,
      t = N_('Configuration'),
      t,
      :items => [
        button(
          :miq_policy_edit,
          'pficon pficon-edit fa-lg',
          t = N_('Edit Basic Info, Scope, and Notes'),
          t,
          :url     => "/edit",
          :klass   => ApplicationHelper::Button::PolicyEdit,
          :options => {:feature => 'miq_policy_edit'}
        ),
        button(
          :miq_policy_copy,
          'fa fa-files-o fa-lg',
          proc do
            _('Copy this Policy to new Policy [%{new_policy_description}]') % {
              :new_policy_description => truncate("Copy of #{@record.description}", :length => 255, :omission => "")
            }
          end,
          proc do
            _('Copy this %{policy_type} Policy') % {:policy_type => ui_lookup(:model => @record.towhat)}
          end,
          :confirm   => proc do
                          _("Are you sure you want to create Policy [%{new_policy_description}] from this Policy?") % {
                            :new_policy_description => truncate("Copy of #{@record.description}", :length => 255, :omission => "")
                          }
                        end,
          :url    => "/copy",
          :send_checked => true),
        button(
          :miq_policy_delete,
          'pficon pficon-delete fa-lg',
          t = proc do
            _('Delete this %{policy_type} Policy') % {:policy_type => ui_lookup(:model => @record.towhat)}
          end,
          t,
          :klass   => ApplicationHelper::Button::PolicyDelete,
          :options => {:feature => 'miq_policy_delete'},
          :data    => {'function'      => 'sendDataWithRx',
                       'function-data' => {:api_url        => 'policies',
                                           :component_name => 'RemoveGenericItemModal',
                                           :controller     => 'provider_dialogs',
                                           :redirect_url   => '/miq_policy/show_list',
                                           :display_field  => 'description'}}),
        button(
          :miq_policy_edit_conditions,
          'pficon pficon-edit fa-lg',
          t = N_('Edit this Policy\'s Condition assignments'),
          t,
          :url       => "/miq_policy_edit_conditions",
          :klass     => ApplicationHelper::Button::PolicyEditConditions,
          :options   => {:feature => 'miq_policy_edit_conditions'}
        ),
        button(
          :miq_policy_edit_events,
          'pficon pficon-edit fa-lg',
          t = N_('Edit this Policy\'s Event assignments'),
          t,
          :url       => "/miq_policy_edit_events",
          :klass     => ApplicationHelper::Button::PolicyEditEvents,
          :options   => {:feature => 'miq_policy_edit_events'}
        ),
        button(
          :miq_event_edit,
          'pficon pficon-edit fa-lg',
          t = N_('Edit Actions for this Policy\'s Event'),
          t,
          :url          => "/miq_event_edit",
          :send_checked => true,
          :klass        => ApplicationHelper::Button::MiqActionModify
        ),
      ]
    ),
  ])
end
