class SecurityPolicyRuleController < ApplicationController
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
    %w[custom_button_events source_security_groups source_vms destination_security_groups destination_vms network_services]
  end

  def display_source_security_groups
    nested_list(SecurityGroup, :association => :source_security_groups, :breadcrumb_title => _("Source Security Groups"))
  end

  def display_source_vms
    nested_list(SecurityGroup, :association => :source_vms, :breadcrumb_title => _("Source Virtual Machines"))
  end

  def display_destination_security_groups
    nested_list(SecurityGroup, :association => :destination_security_groups, :breadcrumb_title => _("Destination Security Groups"))
  end

  def display_destination_vms
    nested_list(SecurityGroup, :association => :destination_vms, :breadcrumb_title => _("Destination Virtual Machines"))
  end

  private

  def textual_group_list
    [%i[properties relationships], %i[source destination network_services tags]]
  end
  helper_method :textual_group_list

  def form_params
    options = {}
    options[:name] = params[:name] if params[:name]
    options[:ems_id] = params[:ems_id] if params[:ems_id]
    options[:security_policy] = find_record_with_rbac(SecurityPolicy, params[:security_policy_id]) if params[:security_policy_id]
    options
  end

  def breadcrumbs_options
    {
      :breadcrumbs => [
        {:title => _("Networks")},
        {:title => _("Security Policies")},
        {:title => _("Rules"), :url => controller_url},
      ]
    }.compact
  end

  menu_section :net
end
