class NetworkServiceController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::GenericButtonMixin
  include Mixins::GenericListMixin
  include Mixins::GenericSessionMixin
  include Mixins::GenericShowMixin
  include Mixins::BreadcrumbsMixin

  def self.display_methods
    %w[custom_button_events security_policy_rules]
  end

  def button
    @edit = session[:edit] # Restore @edit for adv search box
    params[:display] = @display if %w[vms instances images].include?(@display)
    params[:page] = @current_page unless @current_page.nil? # Save current page for list refresh

    @refresh_div = "main_div"

    case params[:pressed]
    when "network_service_tag"
      return tag("SecurityPolicy")
    when "network_services_refresh"
      show_list
      render :update do |page|
        page << javascript_prologue
        page.replace("gtl_div", :partial => "layouts/gtl")
      end
    when "network_service_refresh"
      javascript_redirect(:action => 'show', :id => params[:id])
    when "custom_button"
      custom_buttons
      return
    end
  end

  def check_button_rbac
    # Allow refresh to skip RBAC check
    if %w[network_services_refresh network_service_refresh].include?(params[:pressed])
      true
    else
      super
    end
  end

  private

  def textual_group_list
    [%i[properties relationships], %i[entries tags]]
  end
  helper_method :textual_group_list

  def form_params
    options = {}
    options[:name] = params[:name] if params[:name]
    options[:ems_id] = params[:ems_id] if params[:ems_id]
    options
  end

  def breadcrumbs_options
    {
      :breadcrumbs => [
        {:title => _("Networks")},
        {:title => _("Network Services"), :url => controller_url},
      ]
    }
  end

  menu_section :net
end
