class ContainerTemplateController < ApplicationController
  include ContainersCommonMixin

  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  private

  def textual_group_list
    [%i(properties parameters objects), %i(relationships container_labels smart_management)]
  end
  helper_method :textual_group_list

  menu_section :cnt

  has_custom_buttons
end
