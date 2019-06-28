class ApplicationHelper::Toolbar::XVmCenter < ApplicationHelper::Toolbar::Basic
  button_group('vm_vmdb', [
    select(
      :vm_vmdb_choice,
      'fa fa-cog fa-lg',
      t = N_('Configuration'),
      t,
      :items => [
        button(
          :vm_refresh,
          'fa fa-refresh fa-lg',
          N_('Refresh relationships and power states for all items related to this VM'),
          N_('Refresh Relationships and Power States'),
          :confirm => N_("Refresh relationships and power states for all items related to this VM?"),
          :klass   => ApplicationHelper::Button::VmRefresh),
        button(
          :vm_scan,
          'fa fa-search fa-lg',
          N_('Perform SmartState Analysis on this VM'),
          N_('Perform SmartState Analysis'),
          :confirm => N_("Perform SmartState Analysis on this VM?"),
          :klass   => ApplicationHelper::Button::VmInstanceTemplateScan),
        button(
          :vm_collect_running_processes,
          'fa fa-eyedropper fa-lg',
          N_('Extract Running Processes for this VM'),
          N_('Extract Running Processes'),
          :confirm => N_("Extract Running Processes for this VM?"),
          :klass   => ApplicationHelper::Button::GenericFeatureButtonWithDisable,
          :options => {:feature => :collect_running_processes}),
        separator,
        button(
          :vm_edit,
          'pficon pficon-edit fa-lg',
          t = N_('Edit this VM'),
          t),
        button(
          :vm_rename,
          'pficon pficon-edit fa-lg',
          t = N_('Rename this VM'),
          t,
          :klass   => ApplicationHelper::Button::GenericFeatureButtonWithDisable,
          :options => {:feature => :rename}
        ),
        button(
          :vm_ownership,
          'pficon pficon-user fa-lg',
          N_('Set Ownership for this VM'),
          N_('Set Ownership')),
        button(
          :vm_delete,
          'pficon pficon-delete fa-lg',
          N_('Remove this Virtual machine from Inventory'),
          N_('Remove Virtual Machine from Inventory'),
          :url_parms => "&refresh=y",
          :confirm   => N_("Warning: This Virtual Machine and ALL of its components will be permanently removed!")),
        button(
          :vm_evm_relationship,
          'pficon pficon-edit fa-lg',
          t = N_('Edit Management Engine Relationship'),
          t),
        separator,
        button(
          :vm_right_size,
          'ff ff-database-squeezed fa-lg',
          N_('CPU/Memory Recommendations of this VM'),
          N_('Right-Size Recommendations')),
        button(
          :vm_reconfigure,
          'pficon pficon-edit fa-lg',
          N_('Reconfigure the Memory/CPU of this VM'),
          N_('Reconfigure this VM'),
          :klass => ApplicationHelper::Button::VmReconfigure),
      ]
    ),
  ])
  button_group('vm_policy', [
    select(
      :vm_policy_choice,
      'fa fa-shield fa-lg',
      t = N_('Policy'),
      t,
      :items => [
        button(
          :vm_protect,
          'pficon pficon-edit fa-lg',
          N_('Manage Policies for this VM'),
          N_('Manage Policies'),
          :klass => ApplicationHelper::Button::VmTemplatePolicy),
        button(
          :vm_policy_sim,
          'fa fa-play-circle-o fa-lg',
          N_('View Policy Simulation for this VM'),
          N_('Policy Simulation'),
          :klass => ApplicationHelper::Button::VmTemplatePolicy),
        button(
          :vm_tag,
          'pficon pficon-edit fa-lg',
          N_('Edit Tags for this VM'),
          N_('Edit Tags')),
        button(
          :vm_check_compliance,
          'fa fa-search fa-lg',
          N_('Check Compliance of the last known configuration for this VM'),
          N_('Check Compliance of Last Known Configuration'),
          :confirm => N_("Initiate Check Compliance of the last known configuration for this VM?"),
          :klass   => ApplicationHelper::Button::VmCheckCompliance),
      ]
    ),
  ])
  button_group('vm_lifecycle', [
    select(
      :vm_lifecycle_choice,
      'fa fa-recycle fa-lg',
      t = N_('Lifecycle'),
      t,
      :items => [
        button(
          :vm_clone,
          'ff ff-clone fa-lg',
          t = N_('Clone this VM'),
          t,
          :klass   => ApplicationHelper::Button::GenericFeatureButton,
          :options => {:feature => :clone}),
        button(
          :vm_publish,
          'pficon pficon-export fa-lg',
          t = N_('Publish this VM to a Template'),
          t,
          :klass   => ApplicationHelper::Button::GenericFeatureButton,
          :options => {:feature => :publish}),
        button(
          :vm_migrate,
          'pficon pficon-migration fa-lg',
          N_('Migrate this VM to another Host/Datastore'),
          N_('Migrate this VM'),
          :klass   => ApplicationHelper::Button::GenericFeatureButton,
          :options => {:feature => :migrate}),
        button(
          :vm_retire,
          'fa fa-clock-o fa-lg',
          N_('Set Retirement Dates for this VM'),
          N_('Set Retirement Date'),
          :klass => ApplicationHelper::Button::VmRetire),
        button(
          :vm_retire_now,
          'fa fa-clock-o fa-lg',
          t = N_('Retire this VM'),
          t,
          :confirm => N_("Retire this VM?"),
          :klass   => ApplicationHelper::Button::VmRetireNow),
      ]
    ),
  ])
  button_group('vm_monitoring', [
    select(
      :vm_monitoring_choice,
      'ff ff-monitoring fa-lg',
      t = N_('Monitoring'),
      t,
      :items => [
        button(
          :vm_perf,
          'ff ff-monitoring fa-lg',
          N_('Show Capacity & Utilization data for this VM'),
          N_('Utilization'),
          :url_parms => "?display=performance",
          :klass     => ApplicationHelper::Button::VmPerf),
        button(
          :vm_timeline,
          'ff ff-timeline fa-lg',
          N_('Show Timelines for this VM'),
          N_('Timelines'),
          :url_parms => "?display=timeline",
          :klass     => ApplicationHelper::Button::VmTimeline),
        button(
          :vm_chargeback,
          'fa fa-file-text-o fa-lg',
          N_('Show Chargeback preview'),
          N_('Chargeback Preview')
        ),
      ]
    ),
  ])
  button_group('vm_operations', [
    select(
      :vm_power_choice,
      'fa fa-power-off fa-lg',
      N_('VM Power Functions'),
      N_('Power'),
      :items => [
        button(
          :vm_guest_shutdown,
          nil,
          N_('Shutdown the Guest OS on this VM'),
          N_('Shutdown Guest'),
          :icon    => "fa fa-stop fa-lg",
          :confirm => N_("Shutdown the Guest OS on this VM?"),
          :klass   => ApplicationHelper::Button::GenericFeatureButtonWithDisable,
          :options => {:feature => :shutdown_guest}),
        button(
          :vm_guest_restart,
          nil,
          N_('Restart the Guest OS on this VM'),
          N_('Restart Guest'),
          :icon    => "pficon pficon-restart fa-lg",
          :confirm => N_("Restart the Guest OS on this VM?"),
          :klass   => ApplicationHelper::Button::GenericFeatureButtonWithDisable,
          :options => {:feature => :reboot_guest}),
        separator,
        button(
          :vm_start,
          nil,
          N_('Power On this VM'),
          N_('Power On'),
          :icon    => "pficon pficon-on fa-lg",
          :confirm => N_("Power On this VM?"),
          :klass   => ApplicationHelper::Button::GenericFeatureButtonWithDisable,
          :options => {:feature => :start}),
        button(
          :vm_stop,
          nil,
          N_('Power Off this VM'),
          N_('Power Off'),
          :icon    => "pficon pficon-off fa-lg",
          :confirm => N_("Power Off this VM?"),
          :klass   => ApplicationHelper::Button::GenericFeatureButtonWithDisable,
          :options => {:feature => :stop}),
        button(
          :vm_suspend,
          nil,
          N_('Suspend this VM'),
          N_('Suspend'),
          :icon    => "pficon pficon-paused fa-lg",
          :confirm => N_("Suspend this VM?"),
          :klass   => ApplicationHelper::Button::GenericFeatureButtonWithDisable,
          :options => {:feature => :suspend}),
        button(
          :vm_reset,
          nil,
          N_('Reset this VM'),
          N_('Reset'),
          :icon    => "fa fa-refresh fa-lg",
          :confirm => N_("Reset this VM?"),
          :klass   => ApplicationHelper::Button::GenericFeatureButtonWithDisable,
          :options => {:feature => :reset}),
      ]
    ),
  ])
  button_group('vm_access', [
    select(
      :vm_remote_access_choice,
      'pficon pficon-screen fa-lg',
      N_('VM Remote Access'),
      N_('Access'),
      :items => [
        button(
          :vm_html5_console,
          'pficon pficon-screen fa-lg',
          N_('Open a web-based HTML5 console for this VM'),
          N_('VM Console'),
          :url   => "html5_console",
          :klass => ApplicationHelper::Button::VmHtml5Console),
        button(
          :vm_vmrc_console,
          'pficon pficon-screen fa-lg',
          N_('Open a VMRC console for this VM.  This requires that VMRC is installed and pre-configured to work in your browser.'),
          N_('VMRC Console'),
          :url     => "vmrc_console",
          :confirm => N_("Opening a VMRC console requires that VMRC is installed and pre-configured to work in your browser. Are you sure?"),
          :klass   => ApplicationHelper::Button::VmVmrcConsole),
        button(
          :cockpit_console,
          'pficon pficon-screen fa-lg',
          N_('Open a new browser window with Cockpit for this VM.  This requires that Cockpit is pre-configured on the VM.'),
          N_('Web Console'),
          :url   => "launch_cockpit",
          :klass => ApplicationHelper::Button::CockpitConsole
        ),
      ]
    ),
  ])
end
