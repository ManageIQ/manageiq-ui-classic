class ContainerBuildController < ApplicationController
  include ContainersCommonMixin

  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  private

  def textual_group_list
    [%i(properties container_labels), %i(relationships smart_management), %i(build_instances)]
  end
  helper_method :textual_group_list

  def display_name
    "Builds"
  end

  def handled_buttons
    %w(container_build_tag)
  end

  menu_section :cnt
end
