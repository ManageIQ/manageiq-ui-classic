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

  def download_data
    assert_privileges('network_service_view')
    super
  end

  def download_summary_pdf
    assert_privileges('network_service_view')
    super
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
        breadcrumbs_menu_section,
        {:title => _("Network Services"), :url => controller_url},
      ]
    }
  end

  feature_for_actions "#{controller_name}_show_list", *ADV_SEARCH_ACTIONS

  menu_section :net
end
