class NetworkPortController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::GenericButtonMixin
  include Mixins::GenericListMixin
  include Mixins::GenericSessionMixin
  include Mixins::GenericShowMixin
  include Mixins::BreadcrumbsMixin

  def button
    @edit = session[:edit] # Restore @edit for adv search box
    params[:display] = @display if %w[vms instances images].include?(@display)
    params[:page] = @current_page unless @current_page.nil? # Save current page for list refresh

    @refresh_div = "main_div"

    case params[:pressed]
    when "network_ports_refresh"
      show_list
      render :update do |page|
        page << javascript_prologue
        page.replace("gtl_div", :partial => "layouts/gtl")
      end
    when "network_port_refresh"
      javascript_redirect(:action => 'show', :id => params[:id])
    end
  end

  def check_button_rbac
    # Allow refresh to skip RBAC check
    if %w[network_ports_refresh network_port_refresh].include?(params[:pressed])
      true
    else
      super
    end
  end

  def textual_group_list
    [%i[properties tags], %i[relationships]]
  end
  helper_method :textual_group_list

  def self.display_methods
    %w[cloud_subnets floating_ips security_groups]
  end

  def breadcrumbs_options
    {
      :breadcrumbs => [
        {:title => _("Networks")},
        {:title => _("Network Ports"), :url => controller_url},
      ],
      :record_info => @router,
    }.compact
  end

  menu_section :net
end
