class ApplicationHelper::Toolbar::StorageCenter < ApplicationHelper::Toolbar::Basic
  button_group('storage_vmdb', [
    select(
      :storage_vmdb_choice,
      nil,
      t = N_('Configuration'),
      t,
      :items => [
        button(
          :storage_scan,
          'fa fa-search fa-lg',
          N_('Perform SmartState Analysis on this Datastore'),
          N_('Perform SmartState Analysis'),
          :confirm => N_("Perform SmartState Analysis on this Datastore?"),
          :options => {:feature => :smartstate_analysis},
          :klass   => ApplicationHelper::Button::StorageScan),
        separator,
        button(
          :storage_delete,
          'pficon pficon-delete fa-lg',
          N_('Remove this Datastore from Inventory'),
          N_('Remove Datastore from Inventory'),
          :url_parms => "&refresh=y",
          :confirm   => N_("Warning: This Datastore and ALL of its components will be permanently removed!"),
          :klass     => ApplicationHelper::Button::StorageDelete),
      ]
    ),
  ])
  button_group('storage_policy', [
    select(
      :storage_policy_choice,
      nil,
      t = N_('Policy'),
      t,
      :items => [
        button(
          :storage_tag,
          'pficon pficon-edit fa-lg',
          N_('Edit Tags for this Datastore'),
          N_('Edit Tags')),
      ]
    ),
  ])
  button_group('storage_monitoring', [
    select(
      :storage_monitoring_choice,
      nil,
      t = N_('Monitoring'),
      t,
      :items => [
        button(
          :storage_perf,
          'ff ff-monitoring fa-lg',
          N_('Show Capacity & Utilization data for this Datastore'),
          N_('Utilization'),
          :url       => "/show",
          :url_parms => "?display=performance",
          :klass     => ApplicationHelper::Button::StoragePerf),
      ]
    ),
  ])
end
