class ApplicationHelper::Toolbar::ConditionCenter < ApplicationHelper::Toolbar::Basic
  button_group('condition_vmdb', [
                 select(
                   :condition_vmdb_choice,
                   nil,
                   t = N_('Configuration'),
                   t,
                   :items => [
                     button(
                       :condition_edit,
                       'pficon pficon-edit fa-lg',
                       t = N_('Edit this Condition'),
                       t,
                       :url   => "/edit",
                       :klass => ApplicationHelper::Button::ReadOnly
                     ),
                     button(
                       :condition_copy,
                       'fa fa-files-o fa-lg',
                       t = N_('Copy this Condition to a new Condition'),
                       t,
                       :url   => "/copy",
                       :klass => ApplicationHelper::Button::Condition
                     ),
                     button(
                       :condition_delete,
                       'pficon pficon-delete fa-lg',
                       t = proc do
                         _('Delete this %{condition_type} Condition') % {:condition_type => ui_lookup(:model => @condition.towhat)}
                       end,
                       t,
                       :klass => ApplicationHelper::Button::ConditionDelete,
                       :data  => {'function'      => 'sendDataWithRx',
                                  'function-data' => {:api_url        => 'conditions',
                                                      :redirect_url   => '/condition/show_list',
                                                      :component_name => 'RemoveGenericItemModal',
                                                      :controller     => 'provider_dialogs',
                                                      :display_field  => 'description'}}
                     ),
                   ]
                 ),
               ])
end
