class ContainerGroupController < ApplicationController
  include ContainersCommonMixin
  include Mixins::BreadcrumbsMixin

  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  def show_list
    process_show_list(:named_scope => :active)
  end

  private

  def textual_group_list
    [
      %i[properties container_labels container_node_selectors volumes],
      %i[relationships conditions smart_management]
    ]
  end
  helper_method :textual_group_list

  def display_name
    _("Pods")
  end

  def breadcrumbs_options
    {
      :breadcrumbs => [
        {:title => _("Compute")},
        {:title => _("Containers")},
        {:title => _("Pods"), :url => controller_url},
      ],
    }
  end

  menu_section :cnt

  feature_for_actions "#{controller_name}_show_list", *ADV_SEARCH_ACTIONS

  has_custom_buttons
end
