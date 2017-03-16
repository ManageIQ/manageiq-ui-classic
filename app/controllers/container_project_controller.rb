class ContainerProjectController < ApplicationController
  include ContainersCommonMixin

  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  def show_list
    process_show_list(:where_clause => 'container_projects.deleted_on IS NULL')
  end

  private

  def textual_group_list
    [%i(properties quota limits container_labels), %i(relationships smart_management)]
  end
  helper_method :textual_group_list

  def handled_buttons
    %w(container_project_tag)
  end

  menu_section :cnt
end
