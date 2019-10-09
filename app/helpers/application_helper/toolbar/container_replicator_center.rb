class ApplicationHelper::Toolbar::ContainerReplicatorCenter < ApplicationHelper::Toolbar::Basic
  button_group('container_replicator_monitoring', [
    select(
      :container_replicator_monitoring_choice,
      nil,
      t = N_('Monitoring'),
      t,
      :items => [
        button(
          :container_replicator_timeline,
          'ff ff-timeline fa-lg',
          N_('Show Timelines for this Replicator'),
          N_('Timelines'),
          :url       => "/show",
          :url_parms => "?display=timeline",
          :options   => {:entity => 'Replicator'},
          :klass     => ApplicationHelper::Button::ContainerTimeline),
        button(
          :container_replicator_perf,
          'ff ff-monitoring fa-lg',
          N_('Show Capacity & Utilization data for this Replicator'),
          N_('Utilization'),
          :url       => "/show",
          :url_parms => "?display=performance"),
      ]
    ),
  ])
  button_group('container_replicator_policy', [
    select(
      :container_replicator_policy_choice,
      nil,
      t = N_('Policy'),
      t,
      :items => [
        button(
          :container_replicator_tag,
          'pficon pficon-edit fa-lg',
          N_('Edit Tags for this Replicator'),
          N_('Edit Tags')),
        button(
          :container_replicator_protect,
          'pficon pficon-edit fa-lg',
          N_('Manage Policies for this Replicator'),
          N_('Manage Policies')),
        button(
          :container_replicator_check_compliance,
          'fa fa-search fa-lg',
          N_('Check Compliance of the last known configuration for this Replicator'),
          N_('Check Compliance of Last Known Configuration'),
          :confirm => N_("Initiate Check Compliance of the last known configuration for this item?")),
      ]
    ),
  ])
end
