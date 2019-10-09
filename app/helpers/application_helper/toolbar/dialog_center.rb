class ApplicationHelper::Toolbar::DialogCenter < ApplicationHelper::Toolbar::Basic
  button_group('dialog_vmdb', [
    select(
      :dialog_vmdb_choice,
      nil,
      t = N_('Configuration'),
      t,
      :items => [
        button(
          :dialog_edit_editor,
          'pficon pficon-edit fa-lg',
          t = N_('Edit this Dialog'),
          t,
          :url_parms    => "main_div",
          :send_checked => true,
          :klass        => ApplicationHelper::Button::DialogAction),
        button(
          :dialog_copy_editor,
          'fa fa-files-o fa-lg',
          t = N_('Copy this Dialog'),
          t,
          :url_parms    => "main_div",
          :send_checked => true,
          :klass        => ApplicationHelper::Button::DialogAction),
        button(
          :dialog_delete,
          'pficon pficon-delete fa-lg',
          N_('Remove this Dialog'),
          N_('Remove Dialog'),
          :url_parms    => "main_div",
          :send_checked => true,
          :confirm      => N_("Warning: This Dialog will be permanently removed!"),
          :klass        => ApplicationHelper::Button::DialogAction),
      ]
    ),
  ])
end
