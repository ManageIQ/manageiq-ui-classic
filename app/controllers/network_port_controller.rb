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
