module ServiceTabsHelper
  def service_tab_configuration(record_type, has_stack, has_retirement_job, has_job)
    tabs = [:details]
    tabs << :output if %w[ServiceTerraformTemplate ServiceEmbeddedTerraform].include?(record_type) && has_stack
    if record_type == "ServiceAnsiblePlaybook"
      tabs << :provisioning
      tabs << :retirement if has_retirement_job
    end
    tabs << :tower_job if %w[ServiceAnsibleTower ServiceAwx].include?(record_type) && has_job
    tabs
  end

  def service_tab_content(key_name, &)
    if service_tabs_types[key_name]
      class_name = key_name == :details ? 'tab_content active' : 'tab_content'
      tag.div(:id => key_name, :class => class_name, &)
    end
  end

  private

  def service_tabs_types
    {
      :details      => _('Details'),
      :output       => _('Output'),
      :provisioning => _('Provisioning'),
      :retirement   => _('Retirement'),
      :tower_job    => _('Job'),
    }
  end
end
