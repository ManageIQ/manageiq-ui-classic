class ApplicationHelper::Toolbar::MiqActionsCenter < ApplicationHelper::Toolbar::Basic
  button_group('miq_action_vmdb', [
    select(
      :miq_action_vmdb_choice,
      nil,
      t = N_('Configuration'),
      t,
      :items => [
        button(
          :miq_action_new,
          'pficon pficon-add-circle-o fa-lg',
          t = N_('Add a new Action'),
          t,
          :url   => "/new",
          :klass => ApplicationHelper::Button::ButtonNewDiscover),
        button(
          :miq_action_edit,
          'pficon pficon-edit fa-lg',
          t = N_('Edit the selected Action'),
          t,
          :url          => "/edit",
          :url_parms    => "main_div",
          :send_checked => true,
          :enabled      => false,
          :onwhen       => "1"),
        button(
          :miq_action_delete,
          'pficon pficon-delete fa-lg',
          N_('Delete selected Actions'),
          N_('Delete Actions'),
          :enabled      => false,
          :onwhen       => "1+",
          :data         => {'function'      => 'sendDataWithRx',
                            'function-data' => {:api_url        => 'actions',
                                                :redirect_url   => '/miq_action/show_list',
                                                :component_name => 'RemoveGenericItemModal',
                                                :controller     => 'provider_dialogs',
                                                :display_field  => 'description',
                                                :modal_text     => N_("Are you sure you want to delete selected Actions?"),
                                                :modal_title    => N_("Delete Actions")}}
        ),

      ]
    ),
  ])
end
