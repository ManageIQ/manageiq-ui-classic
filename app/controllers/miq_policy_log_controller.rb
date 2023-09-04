class MiqPolicyLogController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::GenericSessionMixin
  include Mixins::BreadcrumbsMixin

  def index
    assert_privileges('policy_log')
    flash_to_session
    assert_privileges('policy_log')
    @breadcrumbs = []
    @log = Vmdb::Loggers.contents($policy_log)
    add_flash(_("Logs for this %{product} Server are not available for viewing") % {:product => Vmdb::Appliance.PRODUCT_NAME}, :warning) if @log.blank?
    @lastaction = "policy_logs"
    @layout = "miq_policy_logs"
    @msg_title = "Policy"
    drop_breadcrumb(:name => _("Log"), :url => "/miq_ae_policy/log")
  end

  # handle buttons pressed on the button bar
  def button
    @edit = session[:edit] # Restore @edit for adv search box
    @refresh_div = "main_div" # Default div for button.rjs to refresh
    if params[:pressed] == "refresh_log"
      refresh_log
      return
    end

    unless @refresh_partial # if no button handler ran, show not implemented msg
      add_flash(_("Button not yet implemented"), :error)
      @refresh_partial = "layouts/flash_msg"
      @refresh_div = "flash_msg_div"
    end
  end

  def refresh_log
    assert_privileges('policy_log')
    @log = Vmdb::Loggers.contents($policy_log)
    @server = MiqServer.my_server
    add_flash(_("Logs for this %{product} Server are not available for viewing") % {:product => Vmdb::Appliance.PRODUCT_NAME}, :warning) if @log.blank?
    replace_main_div(:partial => "layouts/log_viewer")
  end

  # Send the log in text format
  def fetch_log
    assert_privileges('policy_log')
    disable_client_cache
    send_data(Vmdb::Loggers.contents($policy_log, nil),
              :filename => "policy.log")
    AuditEvent.success(:userid  => session[:userid],
                       :event   => "download_policy_log",
                       :message => "Policy log downloaded")
  end

  def self.table_name
    @table_name = "log"
  end

  private

  def get_session_data
    @title = _("Log")
    @layout = "miq_policy_log"
    @lastaction = session[:miq_policy_log_lastaction]
  end

  def set_session_data
    super
    session[:layout] = @layout
    session[:miq_policy_log_lastaction] = @lastaction
  end

  def breadcrumbs_options
    {
      :breadcrumbs => [
        {:title => _("Control")},
        menu_breadcrumb,
      ].compact,
    }
  end

  def menu_breadcrumb
    {:title => _('Log')}
  end

  menu_section :con
end
