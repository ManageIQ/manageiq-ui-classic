class SecurityPolicyController < ApplicationController
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
    params[:display] = @display if %w[security_policy_rules].include?(@display)
    params[:page] = @current_page unless @current_page.nil? # Save current page for list refresh

    @refresh_div = "main_div"

    case params[:pressed]
    when "security_policy_tag"
      return tag("SecurityPolicy")
    when "security_policies_refresh"
      show_list
      render :update do |page|
        page << javascript_prologue
        page.replace("gtl_div", :partial => "layouts/gtl")
      end
    when "security_policy_refresh"
      javascript_redirect(:action => 'show', :id => params[:id])
    when "custom_button"
      custom_buttons
      return
    end
  end

  def check_button_rbac
    # Allow refresh to skip RBAC check
    if %w[security_policies_refresh security_policy_refresh].include?(params[:pressed])
      true
    else
      super
    end
  end

  private

  def textual_group_list
    [%i[properties security_policy_rules], %i[relationships tags]]
  end
  helper_method :textual_group_list

  def form_params
    options = {}
    options[:name] = params[:name] if params[:name]
    options[:ems_id] = params[:ems_id] if params[:ems_id]
    options[:cloud_tenant] = find_record_with_rbac(CloudTenant, params[:cloud_tenant_id]) if params[:cloud_tenant_id]
    options
  end

  def breadcrumbs_options
    {
      :breadcrumbs => [
        {:title => _("Networks")},
        {:title => _("Security Policies"), :url => controller_url},
      ],
      :record_info => @router,
    }.compact
  end

  menu_section :net
end
