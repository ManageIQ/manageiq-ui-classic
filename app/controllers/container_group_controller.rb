class ContainerGroupController < ApplicationController
  include ContainersCommonMixin

  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  def show_list
    process_show_list(:where_clause => 'container_groups.deleted_on IS NULL')
  end

  private

  def textual_group_list
    [
      %i(properties container_labels container_node_selectors volumes),
      %i(relationships conditions smart_management container_statuses_summary)
    ]
  end
  helper_method :textual_group_list

  def display_name
    "Pods"
  end

  def handled_buttons
    %(
      container_group_tag
      container_group_protect
      container_group_check_compliance
    )
  end

  def handle_container_group_protect
    assign_policies(ContainerGroup)
  end

  def handle_container_group_check_compliance
    check_compliance(ContainerGroup)
  end

  menu_section :cnt
end
