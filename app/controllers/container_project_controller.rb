class ContainerProjectController < ApplicationController
  include Mixins::ContainersCommonMixin
  include Mixins::DashboardViewMixin
  include Mixins::BreadcrumbsMixin
  include Mixins::Actions::VmActions::Ownership

  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  def show_list
    @showtype = "main"
    process_show_list(:named_scope => :active)
  end

  def button
    if params[:pressed] == 'container_project_ownership'
      @ownershipitems = find_records_with_rbac(ContainerProject, checked_or_params)
      javascript_redirect(:action => 'ownership', :rec_ids => @ownershipitems.map(&:id))
    else
      super
    end
  end

  def download_data
    assert_privileges('container_project_show_list')
    super
  end

  def download_summary_pdf
    assert_privileges('container_project_show')
    super
  end

  private

  def textual_group_list
    [%i[properties quota limits container_labels], %i[relationships lifecycle smart_management]]
  end
  helper_method :textual_group_list

  def breadcrumbs_options
    {
      :breadcrumbs => [
        {:title => _("Compute")},
        {:title => _("Containers")},
        {:title => _("Projects"), :url => controller_url},
      ],
    }
  end

  menu_section :cnt

  feature_for_actions "#{controller_name}_show_list", *ADV_SEARCH_ACTIONS
  feature_for_actions "#{controller_name}_timeline", :tl_chooser
  feature_for_actions "#{controller_name}_perf", :perf_top_chart
  feature_for_actions "#{controller_name}_ownership", :ownership, :ownership_update

  has_custom_buttons
end
