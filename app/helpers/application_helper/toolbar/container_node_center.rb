class ApplicationHelper::Toolbar::ContainerNodeCenter < ApplicationHelper::Toolbar::Basic
  button_group('container_node_monitoring', [
    select(
      :container_node_monitoring_choice,
      nil,
      t = N_('Monitoring'),
      t,
      :items => [
        button(
          :container_node_timeline,
          'ff ff-timeline fa-lg',
          N_('Show Timelines for this Node'),
          N_('Timelines'),
          :url       => "/show",
          :url_parms => "?display=timeline",
          :options   => {:entity => N_('Node')},
          :klass     => ApplicationHelper::Button::ContainerTimeline),
        button(
          :container_node_perf,
          'ff ff-monitoring fa-lg',
          N_('Show Capacity & Utilization data for this Node'),
          N_('Utilization'),
          :url       => "/show",
          :url_parms => "?display=performance",
          :options   => {:entity => N_('Node')},
          :klass     => ApplicationHelper::Button::ContainerPerf,
        ),
        button(
          :ems_container_ad_hoc_metrics,
          'fa fa-tachometer fa-1xplus',
          N_('Show Ad hoc Metrics for this Provider'),
          N_('Ad hoc Metrics'),
          :url       => "/show",
          :url_parms => "?display=ad_hoc_metrics"
        ),
        button(
          :ems_container_launch_external_logging,
          'ff ff-monitoring fa-lg',
          N_('Open a new browser window with the External Logging Presentation UI. ' \
             'This requires the External Logging to be deployed on this Proider.'),
          N_('External Logging'),
          :klass => ApplicationHelper::Button::EmsContainerLaunchExternalLoggingSupport,
          :url   => "launch_external_logging"
        ),
      ]
    ),
  ])
  button_group('container_node_policy', [
    select(
      :container_node_policy_choice,
      nil,
      t = N_('Policy'),
      t,
      :items => [
        button(
          :container_node_tag,
          'pficon pficon-edit fa-lg',
          N_('Edit Tags for this Node'),
          N_('Edit Tags')),
        button(
          :container_node_protect,
          'pficon pficon-edit fa-lg',
          N_('Manage Policies for this Node'),
          N_('Manage Policies')),
        button(
          :container_node_check_compliance,
          'fa fa-search fa-lg',
          N_('Check Compliance of the last known configuration for this Node'),
          N_('Check Compliance of Last Known Configuration'),
          :confirm => N_("Initiate Check Compliance of the last known configuration for this item?")),
      ]
    ),
  ])
  button_group('vm_access', [
    button(
      :cockpit_console,
      'pficon pficon-screen fa-lg',
      N_('Open a new browser window with Cockpit for this VM.  This requires that Cockpit is pre-configured on the VM.'),
      N_('Web Console'),
      :keepSpinner => true,
      :url         => "launch_cockpit",
      :klass       => ApplicationHelper::Button::CockpitConsole
    ),
  ])
end
