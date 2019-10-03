module ApplicationHelper::Toolbar::Cloud::InstanceOperationsButtonGroupMixin
  def self.included(included_class)
    included_class.button_group('instance_operations', [
      included_class.select(
        :instance_power_choice,
        'fa fa-power-off fa-lg',
        N_('Instance Power Functions'),
        N_('Power'),
        :items => [
          included_class.button(
            :instance_stop,
            nil,
            N_('Stop this Instance'),
            N_('Stop'),
            :icon    => "fa fa-stop fa-lg",
            :confirm => N_("Stop this Instance?"),
            :klass   => ApplicationHelper::Button::GenericFeatureButton,
            :options => {:feature => :stop}),
          included_class.button(
            :instance_start,
            nil,
            N_('Start this Instance'),
            N_('Start'),
            :icon    => "fa fa-play fa-lg",
            :confirm => N_("Start this Instance?"),
            :klass   => ApplicationHelper::Button::GenericFeatureButton,
            :options => {:feature => :start}),
          included_class.button(
            :instance_pause,
            nil,
            N_('Pause this Instance'),
            N_('Pause'),
            :icon    => "fa fa-pause fa-lg",
            :confirm => N_("Pause this Instance?"),
            :klass   => ApplicationHelper::Button::GenericFeatureButton,
            :options => {:feature => :pause}),
          included_class.button(
            :instance_suspend,
            nil,
            N_('Suspend this Instance'),
            N_('Suspend'),
            :icon    => "fa fa-pause fa-lg",
            :confirm => N_("Suspend this Instance?"),
            :klass   => ApplicationHelper::Button::GenericFeatureButton,
            :options => {:feature => :suspend}),
          included_class.button(
            :instance_shelve,
            nil,
            N_('Shelve this Instance'),
            N_('Shelve'),
            :icon    => "pficon pficon-pending fa-lg",
            :confirm => N_("Shelve this Instance?"),
            :klass   => ApplicationHelper::Button::GenericFeatureButton,
            :options => {:feature => :shelve}),
          included_class.button(
            :instance_shelve_offload,
            nil,
            N_('Shelve Offload this Instance'),
            N_('Shelve Offload'),
            :icon    => "pficon pficon-pending fa-lg",
            :confirm => N_("Shelve Offload this Instance?"),
            :klass   => ApplicationHelper::Button::GenericFeatureButton,
            :options => {:feature => :shelve_offload}),
          included_class.button(
            :instance_resume,
            nil,
            N_('Resume this Instance'),
            N_('Resume'),
            :icon    => "fa fa-play fa-lg",
            :confirm => N_("Resume this Instance?"),
            :klass   => ApplicationHelper::Button::GenericFeatureButton,
            :options => {:feature => :start}),
          included_class.separator,
          included_class.button(
            :instance_guest_restart,
            nil,
            N_('Soft Reboot this Instance'),
            N_('Soft Reboot'),
            :icon    => "pficon pficon-restart fa-lg",
            :confirm => N_("Soft Reboot this Instance?"),
            :klass   => ApplicationHelper::Button::GenericFeatureButton,
            :options => {:feature => :reboot_guest}),
          included_class.button(
            :instance_reset,
            nil,
            N_('Hard Reboot the Guest OS on this Instance'),
            N_('Hard Reboot'),
            :icon    => "pficon pficon-restart fa-lg",
            :confirm => N_("Hard Reboot the Guest OS on this Instance?"),
            :klass   => ApplicationHelper::Button::InstanceReset),
          included_class.button(
            :instance_terminate,
            nil,
            N_('Delete this Instance'),
            N_('Delete'),
            :icon    => "pficon pficon-delete fa-lg",
            :confirm => N_("Delete this Instance?"),
            :klass   => ApplicationHelper::Button::GenericFeatureButton,
            :options => {:feature => :terminate}),
        ]
      ),
    ])
    included_class.button_group('vm_access', [
      included_class.select(
        :vm_remote_access_choice,
        'pficon pficon-screen fa-lg',
        N_('VM Remote Access'),
        N_('Access'),
        :items => [
          included_class.button(
            :vm_vnc_console,
            'pficon pficon-screen fa-lg',
            N_('Open a web-based HTML5 console for this VM'),
            N_('VM Console'),
            :keepSpinner => true,
            :url         => "html5_console",
            :klass       => ApplicationHelper::Button::VmHtml5Console),
          included_class.button(
            :cockpit_console,
            'pficon pficon-screen fa-lg',
            N_('Open a new browser window with Cockpit for this VM.  This requires that Cockpit is pre-configured on the VM.'),
            N_('Web Console'),
            :keepSpinner => true,
            :url         => "launch_cockpit",
            :klass       => ApplicationHelper::Button::CockpitConsole
          ),
        ]
      ),
    ])
  end
end
