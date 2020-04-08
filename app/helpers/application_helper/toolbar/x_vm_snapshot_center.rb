class ApplicationHelper::Toolbar::XVmSnapshotCenter < ApplicationHelper::Toolbar::Basic
  button_group('snapshot_tasks', [
    button(
      :vm_snapshot_add,
      'pficon pficon-add-circle-o fa-lg',
      N_('Create a new snapshot for this VM'),
      nil,
      :klass  => ApplicationHelper::Button::VmSnapshotAdd),
    select(
      :vm_delete_snap_choice,
      'pficon pficon-delete fa-lg',
      N_('Delete Snapshots'),
      nil,
      :items => [
        button(
          :vm_snapshot_delete,
          'pficon pficon-delete fa-lg',
          t = N_('Delete Selected Snapshot'),
          t,
          :confirm      => N_("The selected snapshot will be permanently deleted. Are you sure you want to delete the selected snapshot?"),
          :url_parms    => "main_div",
          :send_checked => true,
          :onwhen       => "1",
          :klass        => ApplicationHelper::Button::VmSnapshotRemoveOne
        ),
        button(
          :vm_snapshot_delete_all,
          'pficon pficon-delete fa-lg',
          t = N_('Delete All Existing Snapshots'),
          t,
          :confirm => N_("Delete all of this VMs existing snapshots?"),
          :klass   => ApplicationHelper::Button::GenericFeatureButtonWithDisable,
          :options => {:feature => :remove_all_snapshots}),
      ]
    ),
    button(
      :vm_snapshot_revert,
      'fa fa-undo fa-lg',
      N_('Revert to selected snapshot'),
      nil,
      :confirm => N_("This VM will revert to selected snapshot. Are you sure you want to revert to the selected snapshot?"),
      :onwhen  => "1",
      :klass   => ApplicationHelper::Button::VmSnapshotRevert),
  ])
end
