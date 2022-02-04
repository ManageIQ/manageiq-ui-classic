class ContainerNodeController < ApplicationController
  include ContainersCommonMixin
  include ContainersExternalLoggingSupportMixin
  include Mixins::BreadcrumbsMixin

  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  def show_list
    process_show_list(:named_scope => :active)
  end

  def textual_group_list
    [
      %i[properties container_labels compliance miq_custom_attributes],
      %i[relationships conditions smart_management]
    ]
  end
  helper_method :textual_group_list

  def download_data
    assert_privileges('container_node_show_list')
    super
  end

  def download_summary_pdf
    assert_privileges('container_node_show')
    super
  end

  def breadcrumbs_options
    {
      :breadcrumbs => [
        {:title => _("Compute")},
        {:title => _("Containers")},
        {:title => _("Nodes"), :url => controller_url},
      ],
    }
  end

  menu_section :cnt

  feature_for_actions "#{controller_name}_show_list", *ADV_SEARCH_ACTIONS
  feature_for_actions "#{controller_name}_timeline", :tl_chooser
  feature_for_actions "#{controller_name}_perf", :perf_top_chart

  has_custom_buttons
end
