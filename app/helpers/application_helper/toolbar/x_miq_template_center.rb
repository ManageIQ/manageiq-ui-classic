class ApplicationHelper::Toolbar::XMiqTemplateCenter < ApplicationHelper::Toolbar::Basic
  button_group('miq_template_vmdb', [
    select(
      :miq_template_vmdb_choice,
      nil,
      t = N_('Configuration'),
      t,
      :items => [
        button(
          :miq_template_refresh,
          'fa fa-refresh fa-lg',
          N_('Refresh relationships and power states for all items related to this Template'),
          N_('Refresh Relationships and Power States'),
          :confirm => N_("Refresh relationships and power states for all items related to this Template?"),
          :klass   => ApplicationHelper::Button::TemplateRefresh),
        button(
          :miq_template_scan,
          'fa fa-search fa-lg',
          N_('Perform SmartState Analysis on this Template'),
          N_('Perform SmartState Analysis'),
          :confirm => N_("Perform SmartState Analysis on this Template?"),
          :klass   => ApplicationHelper::Button::VmInstanceTemplateScan),
        separator,
        button(
          :miq_template_edit,
          'pficon pficon-edit fa-lg',
          t = N_('Edit this Template'),
          t),
        button(
          :miq_template_ownership,
          'pficon pficon-user fa-lg',
          N_('Set Ownership for this Template'),
          N_('Set Ownership')),
        button(
          :miq_template_delete,
          'pficon pficon-delete fa-lg',
          N_('Remove this Template from Inventory'),
          N_('Remove Template from Inventory'),
          :url_parms => "&refresh=y",
          :confirm   => N_("Warning: This Template and ALL of its components will be permanently removed!")),
      ]
    ),
  ])
  button_group('miq_template_policy', [
    select(
      :miq_template_policy_choice,
      nil,
      t = N_('Policy'),
      t,
      :items => [
        button(
          :miq_template_protect,
          'pficon pficon-edit fa-lg',
          N_('Manage Policies for this Template'),
          N_('Manage Policies'),
          :klass => ApplicationHelper::Button::VmTemplatePolicy),
        button(
          :miq_template_policy_sim,
          'fa fa-play-circle-o fa-lg',
          N_('View Policy Simulation for this Template'),
          N_('Policy Simulation'),
          :klass => ApplicationHelper::Button::VmTemplatePolicy),
        button(
          :miq_template_tag,
          'pficon pficon-edit fa-lg',
          N_('Edit Tags for this Template'),
          N_('Edit Tags')),
        button(
          :miq_template_check_compliance,
          'fa fa-search fa-lg',
          N_('Check Compliance of the last known configuration for this Template'),
          N_('Check Compliance of Last Known Configuration'),
          :confirm => N_("Initiate Check Compliance of the last known configuration for this Template?"),
          :klass   => ApplicationHelper::Button::MiqCheckCompliance),
      ]
    ),
  ])
  button_group('miq_template_lifecycle', [
    select(
      :miq_template_lifecycle_choice,
      nil,
      t = N_('Lifecycle'),
      t,
      :items => [
        button(
          :miq_template_miq_request_new,
          'pficon pficon-add-circle-o fa-lg',
          t = N_('Provision VMs using this Template'),
          t,
          :klass   => ApplicationHelper::Button::MiqTemplateMiqRequestNew,
          :options => {:feature => :provisioning}),
        button(
          :miq_template_clone,
          'ff ff-clone fa-lg',
          t = N_('Clone this Template'),
          t,
          :klass   => ApplicationHelper::Button::GenericFeatureButton,
          :options => {:feature => :clone}),
      ]
    ),
  ])
  button_group('miq_template_monitoring', [
    select(
      :miq_template_monitoring_choice,
      nil,
      t = N_('Monitoring'),
      t,
      :items => [
        button(
          :miq_template_perf,
          'ff ff-monitoring fa-lg',
          N_('Show Capacity & Utilization data for this Template'),
          N_('Utilization'),
          :url_parms => "?display=performance",
          :klass     => ApplicationHelper::Button::MiqTemplatePerf),
        button(
          :miq_template_timeline,
          'ff ff-timeline fa-lg',
          N_('Show Timelines for this Template'),
          N_('Timelines'),
          :url_parms => "?display=timeline",
          :klass     => ApplicationHelper::Button::MiqTemplateTimeline),
      ]
    ),
  ])
end
