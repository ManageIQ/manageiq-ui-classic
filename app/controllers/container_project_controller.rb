class ContainerProjectController < ApplicationController
  include ContainersCommonMixin
  include Mixins::DashboardViewMixin
  include Mixins::BreadcrumbsMixin

  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  def show_list
    @showtype = "main"
    process_show_list(:named_scope => :active)
  end

  private

  def textual_group_list
    [%i[properties quota limits container_labels], %i[relationships smart_management]]
  end
  helper_method :textual_group_list

  def breadcrumbs_options
    {
      :breadcrumbs => [
        {:title => _("Compute")},
        {:title => _("Containers")},
        {:title => _("Projects")},
        {:url   => controller_url, :title => _("Container Projects")},
      ],
    }
  end

  menu_section :cnt

  feature_for_actions "#{controller_name}_show_list", *ADV_SEARCH_ACTIONS

  has_custom_buttons
end
