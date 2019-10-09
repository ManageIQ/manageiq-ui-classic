class ApplicationHelper::Toolbar::ScanProfileCenter < ApplicationHelper::Toolbar::Basic
  button_group('scan_vmdb', [
    select(
      :scan_vmdb_choice,
      nil,
      t = N_('Configuration'),
      t,
      :items => [
        button(
          :ap_edit,
          'pficon pficon-edit fa-lg',
          t = N_('Edit this Analysis Profile'),
          t,
          :klass => ApplicationHelper::Button::ApEdit),
        button(
          :ap_copy,
          'fa fa-files-o fa-lg',
          t = N_('Copy this selected Analysis Profile'),
          t,
          :url_parms => "?typ=copy"),
        button(
          :ap_delete,
          'pficon pficon-delete fa-lg',
          t = N_('Delete this Analysis Profile'),
          t,
          :url_parms => "&refresh=y",
          :confirm   => N_("Warning: This Analysis Profile and ALL of its components will be permanently removed!"),
          :klass     => ApplicationHelper::Button::ApDelete),
      ]
    ),
  ])
end
