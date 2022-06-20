module DashboardHelper
  REPORT_LABELS = {
    :striped   => "table table-striped table-bordered table-hover",
    :carbon    => "bx--data-table bx--data-table--normal bx--data-table--no-border miq-data-table miq_dashboard",
    :clickable => "clickable",
    :blank     => "No records found"
  }.freeze

  def ext_auth?(auth_option = nil)
    return false unless ::Settings.authentication.mode == 'httpd'

    auth_option ? ::Settings.authentication[auth_option] : true
  end

  def last_next_run(widget)
    last_run_on = widget.last_run_on_for_user(current_user)
    next_run_on = widget.next_run_on
    last_run = last_run_on ? format_timezone(last_run_on, session[:user_tz], "widget_footer") : _('Never')
    next_run = next_run_on ? format_timezone(next_run_on, session[:user_tz], "widget_footer") : _('Unknown')
    [last_run, next_run]
  end

  def column_widgets(dashboard)
    [:col1, :col2].map { |column| dashboard&.key?(column) ? dashboard[column].uniq : [] }
  end

  # Method to replace the old table classname to react carbon class name.
  def update_content(content)
    if label(content, :striped)
      return content.gsub!(REPORT_LABELS[:striped], carbon_class(content))
    end

    content
  end

  private

  # Method to find if content has a string specified in REPORT_LABELS.
  def label(content, type)
    content.include?(REPORT_LABELS[type])
  end

  # Method which returns a clickable carbon class if data exists.
  def carbon_class(content)
    label(content, :blank) ? REPORT_LABELS[:carbon] : [REPORT_LABELS[:carbon], REPORT_LABELS[:clickable]].join(' ')
  end
end
