class ContainerServiceController < ApplicationController
  include Mixins::ContainersCommonMixin
  include Mixins::BreadcrumbsMixin

  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  menu_section :cnt

  feature_for_actions "#{controller_name}_show_list", *ADV_SEARCH_ACTIONS
  feature_for_actions "#{controller_name}_perf", :perf_top_chart

  def download_data
    assert_privileges('container_template_show_list')
    super
  end

  def download_summary_pdf
    assert_privileges('container_template_show')
    super
  end

  private

  def textual_group_list
    [%i[properties port_configs container_labels container_selectors], %i[relationships smart_management annotations]]
  end
  helper_method :textual_group_list

  def breadcrumbs_options
    {
      :breadcrumbs => [
        {:title => _("Compute")},
        {:title => _("Containers")},
        {:title => _("Services"), :url => controller_url},
      ],
    }
  end
end
