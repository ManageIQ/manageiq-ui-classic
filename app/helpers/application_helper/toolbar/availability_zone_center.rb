class ApplicationHelper::Toolbar::AvailabilityZoneCenter < ApplicationHelper::Toolbar::Basic
  button_group('availability_zone_policy', [
    select(
      :availability_zone_policy_choice,
      nil,
      t = N_('Policy'),
      t,
      :items => [
        button(
          :availability_zone_tag,
          'pficon pficon-edit fa-lg',
          N_('Edit Tags for this Availability Zone'),
          N_('Edit Tags')),
      ]
    ),
  ])
  button_group('availability_zone_monitoring', [
    select(
      :availability_zone_monitoring_choice,
      nil,
      t = N_('Monitoring'),
      t,
      :items => [
        button(
          :availability_zone_perf,
          'ff ff-monitoring fa-lg',
          N_('Show Capacity & Utilization data for this Availability Zone'),
          N_('Utilization'),
          :url       => "/show",
          :url_parms => "?display=performance",
          :klass     => ApplicationHelper::Button::AvailabilityZonePerformance),
        button(
          :availability_zone_timeline,
          'ff ff-timeline fa-lg',
          N_('Show Timelines for this Availability Zone'),
          N_('Timelines'),
          :url       => "/show",
          :url_parms => "?display=timeline",
          :klass     => ApplicationHelper::Button::AvailabilityZoneTimeline),
      ]
    ),
  ])
end
