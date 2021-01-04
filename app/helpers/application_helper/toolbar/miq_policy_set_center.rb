class ApplicationHelper::Toolbar::MiqPolicySetCenter < ApplicationHelper::Toolbar::Basic
  button_group('miq_policy_set_vmdb', [
    select(
      :miq_policy_set_vmdb_choice,
      nil,
      t = N_('Configuration'),
      t,
      :items => [
        button(
          :miq_policy_set_edit,
          'pficon pficon-edit fa-lg',
          t = N_('Edit this Policy Profile'),
          t,
          :url_parms    => "main_div",
          :send_checked => true,
          :klass        => ApplicationHelper::Button::ReadOnly),
        button(
          :miq_policy_set_delete,
          'pficon pficon-delete fa-lg',
          t = N_('Remove this Policy Profile'),
          t,
          :klass        => ApplicationHelper::Button::ReadOnly,
          :data  => {'function'      => 'sendDataWithRx',
                     'function-data' => {:api_url        => 'policy_profiles',
                                         :component_name => 'RemoveGenericItemModal',
                                         :controller     => 'provider_dialogs',
                                         :display_field  => 'description',
                                         :modal_text     => N_("Are you sure you want to delete this Policy Profile?"),
                                         :modal_title    => N_("Delete Policy Profile"),
                                         :ajax_reload    => true}}),
      ]
    ),
  ])
end
