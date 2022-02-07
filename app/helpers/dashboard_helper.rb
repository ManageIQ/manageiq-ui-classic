module DashboardHelper
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

  def column_data(dashboard, column)
    dashboard.key?(column) ? dashboard[column].uniq : []
  end

  # Method to convert 3 columns to 2 columns design for dashboard and sample dashboard page.
  def override_columns(dashboard)
    col1, col2, col3 = [:col1, :col2, :col3].map { |column| column_data(dashboard, column) }
    col2 = ((col2 + col3).uniq - col1)
    col3 = []
    col1, col2 = split_widgets(col1) if col2.empty? && col1.length >= 2
    col1, col2 = split_widgets(col2) if col1.empty? && col2.length >= 2
    return col1, col2, col3
  end

  private
  
  def split_widgets(widgets)
    length = widgets.length
    col1 = widgets.slice(0, length / 2)
    col2 = widgets.slice(length / 2, length)
    return col1, col2
  end
end
