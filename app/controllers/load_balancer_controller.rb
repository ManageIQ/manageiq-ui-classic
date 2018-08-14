class LoadBalancerController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::GenericButtonMixin
  include Mixins::GenericListMixin
  include Mixins::GenericSessionMixin
  include Mixins::GenericShowMixin
  include Mixins::NetworksBreadcrumbMixin

  def self.display_methods
    %w(instances network_ports floating_ips security_groups)
  end

  private

  def textual_group_list
    [%i(properties relationships), %i(tags)]
  end
  helper_method :textual_group_list

  def breadcrumbs_options
    @breadcrumbs_start = [{:title => _("Networks")}, {:title => _("Load Balancers"), :url => "/" + controller_name}]
  end

  menu_section :net

  has_custom_buttons
end
