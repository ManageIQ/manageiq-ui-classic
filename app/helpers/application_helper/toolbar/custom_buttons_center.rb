class ApplicationHelper::Toolbar::CustomButtonsCenter < ApplicationHelper::Toolbar::Basic
  button_group('custom_button_vmdb', [
    select(
      :custom_button_vmdb_choice,
      nil,
      t = N_('Configuration'),
      t,
      :items => [
        button(
          :ab_group_edit,
          'pficon pficon-edit fa-lg',
          t = N_('Edit this Button Group'),
          t,
          :url_parms    => "main_div",
          :send_checked => true,
          :klass        => ApplicationHelper::Button::AbGroupEdit),
        button(
          :ab_button_new,
          'pficon pficon-add-circle-o fa-lg',
          t = N_('Add a new Button'),
          t,
          :klass => ApplicationHelper::Button::AbButtonNew),
        button(
          :ab_group_delete,
          'pficon pficon-delete fa-lg',
          t = N_('Remove this Button Group'),
          t,
          :klass => ApplicationHelper::Button::AbGroupDelete,
          :data  => {'function'      => 'sendDataWithRx',
                     'function-data' => {:controller     => 'provider_dialogs',
                                         :modal_title    => N_('Delete Button Group'),
                                         :modal_text     => N_('Are you sure you want to delete the following Button Group?'),
                                         :api_url        => 'custom_button_sets',
                                         :async_delete   => false,
                                         :ajax_reload    => true,
                                         :transform_fn   => 'buttonGroup',
                                         :component_name => 'RemoveGenericItemModal'}})
      ]
    ),
  ])
end
