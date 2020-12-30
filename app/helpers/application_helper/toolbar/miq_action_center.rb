class ApplicationHelper::Toolbar::MiqActionCenter < ApplicationHelper::Toolbar::Basic
  button_group('miq_action_vmdb', [
    select(
      :miq_action_vmdb_choice,
      nil,
      t = N_('Configuration'),
      t,
      :items => [
        button(
          :miq_action_edit,
          'pficon pficon-edit fa-lg',
          t = N_('Edit this Action'),
          t,
          :klass        => ApplicationHelper::Button::MiqActionEdit,
          :url          => "/edit",
          :send_checked => true,),
        button(
          :miq_action_delete,
          'pficon pficon-delete fa-lg',
          t = N_('Delete this Action'),
          t,
          :klass => ApplicationHelper::Button::MiqActionDelete,
          :data  => {'function'      => 'sendDataWithRx',
                     'function-data' => {:api_url        => 'actions',
                                         :redirect_url   => '/miq_action/show_list',
                                         :component_name => 'RemoveGenericItemModal',
                                         :controller     => 'provider_dialogs',
                                         :display_field  => 'description',
                                         :modal_text     => N_("Are you sure you want to delete this Action?"),
                                         :modal_title    => N_("Delete Action"),
                                         :ajax_reload    => true}}),
      ]
    ),
  ])
end
