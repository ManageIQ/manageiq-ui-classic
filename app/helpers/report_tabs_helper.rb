module ReportTabsHelper
  REPORT_TAB_LABELS = %w[report_info saved_reports].freeze

  def report_tab_configuration
    REPORT_TAB_LABELS
  end

  def report_tab_content(key_name, active_tab: nil, &)
    return unless REPORT_TAB_LABELS.include?(key_name.to_s)

    css_class = 'tab_content'
    css_class += ' active' if active_tab.to_s == key_name.to_s
    tag.div(:id => key_name.to_s, :class => css_class, &)
  end

  def report_tab_index(active_tab)
    idx = REPORT_TAB_LABELS.index(active_tab.to_s)
    idx || 0
  end
end
