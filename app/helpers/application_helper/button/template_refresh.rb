class ApplicationHelper::Button::TemplateRefresh < ApplicationHelper::Button::Basic
  def visible?
    return true if @record.ext_management_system || @record.host.try(:vmm_product).to_s.casecmp("workstation").zero?

    true if @perf_options[:typ] == "realtime"
  end
end
