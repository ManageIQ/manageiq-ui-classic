class ApplicationHelper::Toolbar::EmsContainerCenter < ApplicationHelper::Toolbar::Basic
  button_group('ems_container_vmdb', [
    button(
      :refresh_server_summary,
      'fa fa-refresh fa-lg',
      N_('Refresh this page'),
      nil),
    select(
      :ems_container_vmdb_choice,
      'fa fa-cog fa-lg',
      t = N_('Configuration'),
      t,
      :items => [
        button(
          :ems_container_refresh,
          'fa fa-refresh fa-lg',
          N_('Refresh items and relationships related to this Containers Provider'),
          N_('Refresh items and relationships'),
          :confirm => N_("Refresh items and relationships related to this Containers Provider?"),
          :klass   => ApplicationHelper::Button::EmsRefresh),
        button(
          :ems_container_capture_metrics,
          'pficon pficon-import fa-lg',
          N_('Capture metrics related to this Containers Provider'),
          N_('Capture metrics'),
          :confirm => N_("Capture metrics related to this Containers Provider?"),
          :klass   => ApplicationHelper::Button::EmsCaptureMetrics,
        ),
        separator,
        button(
          :ems_container_edit,
          'pficon pficon-edit fa-lg',
          t = N_('Edit this Containers Provider'),
          t,),
        button(
          :ems_container_delete,
          'pficon pficon-delete fa-lg',
          t = N_('Remove this Containers Provider from Inventory'),
          t,
          :url_parms => "&refresh=y",
          :confirm   => N_("Warning: This Containers Provider and ALL of its components will be permanently removed!")),
      ]
    ),
  ])
  button_group('ems_container_monitoring', [
    select(
      :ems_container_monitoring_choice,
      'ff ff-monitoring fa-lg',
      t = N_('Monitoring'),
      t,
      :items => [
        button(
          :ems_container_timeline,
          'ff ff-timeline fa-lg',
          N_('Show Timelines for this Containers Provider'),
          N_('Timelines'),
          :klass     => ApplicationHelper::Button::ContainerTimeline,
          :options   => {:feature => :timeline, :entity => N_('Provider')},
          :url_parms => "?display=timeline"),
        button(
          :ems_container_perf,
          'ff ff-monitoring fa-lg',
          N_('Show Capacity & Utilization data for this Provider'),
          N_('Utilization'),
          :klass     => ApplicationHelper::Button::ContainerPerf,
          :options   => {:feature => :performance, :entity => N_('Provider')},
          :url_parms => "?display=performance"),
        button(
          :ems_container_ad_hoc_metrics,
          'fa fa-tachometer fa-1xplus',
          N_('Show Ad hoc Metrics for this Provider'),
          N_('Ad hoc Metrics'),
          :klass     => ApplicationHelper::Button::GenericFeatureButton,
          :options   => {:feature => :ad_hoc_metrics},
          :url_parms => "?display=ad_hoc_metrics"),
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
  button_group('ems_container_policy', [
    select(
      :ems_container_policy_choice,
      'fa fa-shield fa-lg',
      t = N_('Policy'),
      t,
      :items => [
        button(
          :ems_container_tag,
          'pficon pficon-edit fa-lg',
          N_('Edit Tags for this Containers Provider'),
          N_('Edit Tags')),
        button(
          :ems_container_protect,
          'pficon pficon-edit fa-lg',
          N_('Manage Policies for this Containers Provider'),
          N_('Manage Policies')),
        button(
          :ems_container_check_compliance,
          'fa fa-search fa-lg',
          N_('Check Compliance of the last known configuration for this Container Manager'),
          N_('Check Compliance of Last Known Configuration'),
          :confirm => N_("Initiate Check Compliance of the last known configuration for this item?")),
      ]
    ),
  ])
  button_group('ems_container_authentication', [
    select(
      :ems_container_authentication_choice,
      'fa fa-lock fa-lg',
      t = N_('Authentication'),
      t,
      :items => [
        button(
          :ems_container_recheck_auth_status,
          'fa fa-search fa-lg',
          N_('Re-check Authentication Status for this Containers Provider'),
          N_('Re-check Authentication Status'),
          :klass => ApplicationHelper::Button::GenericFeatureButton,
          :options => {:feature => :authentication_status}),
      ]
    ),
  ])
end
