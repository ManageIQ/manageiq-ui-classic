class ContainerGroupController < ApplicationController
  include Mixins::ContainersCommonMixin
  include Mixins::BreadcrumbsMixin

  # terminal_start/pod_ls are called via plain fetch() from React without a CSRF token;
  # without this skip, the CSRF failure resets the session and logs the user out.
  skip_before_action :verify_authenticity_token, only: [:terminal_start, :pod_ls]
  # before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  def show_list
    process_show_list(:named_scope => :active)
  end
  
  def button
    case params[:pressed]
    when "container_group_terminal"
      javascript_redirect(
        :action => "terminal",
        :id     => params[:id]
      )
    else
      super
    end
  end

  def terminal
    @record = identify_record(params[:id], ContainerGroup)

    @pod_name  = @record.name
    @namespace = @record.container_project.name
    @ems       = @record.ext_management_system
    
    drop_breadcrumb(
      :name => _("Terminal"),
      :url  => "/container_group/terminal/#{@record.id}"
    )

  end

  def terminal_ticket
    cg = ContainerGroup.find(params[:id])

    render :json => {
      :namespace => cg.container_project.name,
      :pod       => cg.name,
      :container => cg.containers.first.name,
      :host      => cg.ext_management_system.connect_options[:hostname],
      :port      => cg.ext_management_system.connect_options[:port]
    }
  end

  def terminal_start
    cg = ContainerGroup.find(params[:id])
    session = cg.start_terminal_session          # no oc/kubectl/PTY knowledge here at all
    POD_SESSIONS[cg.id.to_s] = session

    Thread.new do
      loop do
        output = session[:pty_out].readpartial(1024)
        ActionCable.server.broadcast("pod_terminal_#{cg.id}", { :output => output })
      end
    rescue EOFError, Errno::EIO
      Rails.logger.info "OC SESSION CLOSED"
    end

    render :json => { :status => "started" }
  end

  private

  def textual_group_list
    [
      %i[properties container_labels container_node_selectors volumes],
      %i[relationships conditions smart_management annotations]
    ]
  end
  helper_method :textual_group_list

  def display_name
    _("Pods")
  end

  def breadcrumbs_options
    {
      :breadcrumbs => [
        {:title => _("Compute")},
        {:title => _("Containers")},
        {:title => _("Pods"), :url => controller_url},
      ],
    }
  end

  menu_section :cnt

  feature_for_actions "#{controller_name}_show_list", *ADV_SEARCH_ACTIONS
  feature_for_actions "#{controller_name}_timeline", :tl_chooser
  feature_for_actions "#{controller_name}_perf", :perf_top_chart

  has_custom_buttons
end
