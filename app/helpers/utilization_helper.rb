module UtilizationHelper
  def utilization_tab_configuration
    [:summary, :details, :report].map do |item|
      {:name => item, :text => utilization_tabs_types[item]}
    end
  end

  def utilization_tab_content(key_name, &block)
    if utilization_tabs_types[key_name]
      class_name = key_name == :summary ? 'tab_content active' : 'tab_content'
      tag.div(:id => key_name, :class => class_name, &block)
    end
  end

  private

  def utilization_tabs_types
    {
      :summary => _('Summary'),
      :details => _('Details'),
      :report  => _('Report'),
    }
  end
end
