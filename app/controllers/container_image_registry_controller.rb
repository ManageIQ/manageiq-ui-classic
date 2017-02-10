class ContainerImageRegistryController < ApplicationController
  include ContainersCommonMixin

  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  menu_section :cnt

  private

  # app/views/container_image_registry/_main.html.haml
  def textual_group_list
    [%i(properties), %i(relationships smart_management)]
  end
  helper_method :textual_group_list
end
