class PersistentVolumeController < ApplicationController
  include ContainersCommonMixin

  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  private

  def textual_group_list
    [%i(properties claim_properties), %i(relationships smart_management capacity)]
  end
  helper_method :textual_group_list

  def display_name
    _("Volumes")
  end

  menu_section :cnt

  has_custom_buttons
end
