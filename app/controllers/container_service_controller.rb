class ContainerServiceController < ApplicationController
  include ContainersCommonMixin

  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  menu_section :cnt

  private

  def handled_buttons
    %w(container_service_tag)
  end

  def textual_group_list
    [%i(properties port_configs container_labels container_selectors), %i(relationships smart_management)]
  end
  helper_method :textual_group_list
end
