class ApplicationHelper::Toolbar::MiqPolicySetsCenter < ApplicationHelper::Toolbar::Basic
  button_group('miq_policy_set_new_vmdb', [
    select(
      :miq_policy_set_new_vmdb_choice,
      nil,
      t = N_('Configuration'),
      t,
      :items => [
        button(
          :miq_policy_set_new,
          'pficon pficon-add-circle-o fa-lg',
          t = N_('Add a New Policy Profile'),
          t,
          :url   => "/new",
          :klass => ApplicationHelper::Button::ButtonNewDiscover),
        button(
          :miq_policy_set_edit,
          'pficon pficon-edit fa-lg',
          t = N_('Edit the selected Policy Profile'),
          t,
          :url          => "/edit",
          :url_parms    => "main_div",
          :send_checked => true,
          :enabled      => false,
          :onwhen       => "1"),
        button(
          :catalogitem_delete,
          'pficon pficon-delete fa-lg',
          N_('Delete selected Policy Profiles'),
          N_('Delete Policy Profiles'),
          :enabled      => false,
          :onwhen       => "1+",
          :data         => {'function'      => 'sendDataWithRx',
                            'function-data' => {:api_url        => 'policy_profiles',
                                                :component_name => 'RemoveGenericItemModal',
                                                :controller     => 'provider_dialogs',
                                                :display_field  => 'description',
                                                :modal_text     => N_("Are you sure you want to delete this Policy Profiles?"),
                                                :modal_title    => N_("Delete Policy Profiles"),
                                                :redirect_url   => '/miq_policy_set/show_list'}}
        ),
      ]
    ),
  ])
end
