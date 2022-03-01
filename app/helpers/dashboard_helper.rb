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

  def column_widgets(dashboard)
    [:col1, :col2].map { |column| dashboard.key?(column) ? dashboard[column].uniq : [] }
  end
end
