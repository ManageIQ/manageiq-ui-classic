module UtilizationHelper
  def utilization_tab_configuration
    [:summary, :details, :report]
  end

  def utilization_tab_content(key_name, &block)
    if utilization_tab_configuration.include?(key_name)
      class_name = key_name == :summary ? 'tab_content active' : 'tab_content'
      tag.div(:id => key_name, :class => class_name, &block)
    end
  end
end
