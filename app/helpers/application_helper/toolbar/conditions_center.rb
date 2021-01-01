class ApplicationHelper::Toolbar::ConditionsCenter < ApplicationHelper::Toolbar::Basic
  button_group('condition_vmdb', [
    select(
      :condition_vmdb_choice,
      nil,
      t = N_('Configuration'),
      t,
      :items => [
        button(
          :condition_new,
          'pficon pficon-add-circle-o fa-lg',
          t = _('Add a New Condition'),
          t,
          :url   => "/new",
          :klass => ApplicationHelper::Button::ButtonNewDiscover),
        button(
          :condition_edit,
          'pficon pficon-edit fa-lg',
          t = N_('Edit the selected Condition'),
          t,
          :url          => "/edit",
          :url_parms    => "main_div",
          :send_checked => true,
          :enabled      => false,
          :onwhen       => "1"),
        button(
          :condition_delete,
          'pficon pficon-delete fa-lg',
          N_('Delete selected Conditions'),
          N_('Delete Conditions'),
          :enabled      => false,
          :onwhen       => "1+",
          :data         => {'function'      => 'sendDataWithRx',
                            'function-data' => {:api_url        => 'conditions',
                                                :redirect_url   => '/condition/show_list',
                                                :component_name => 'RemoveGenericItemModal',
                                                :controller     => 'provider_dialogs',
                                                :display_field  => 'description',
                                                :modal_text     => N_("Are you sure you want to delete selected Conditions?"),
                                                :modal_title    => N_("Delete Conditions")}})
      ]
    ),
  ])
end
