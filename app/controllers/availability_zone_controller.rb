class AvailabilityZoneController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::GenericListMixin
  include Mixins::GenericSessionMixin
  include Mixins::MoreShowActions
  include Mixins::GenericShowMixin
  include EmsCommon

  def self.display_methods
    %w(ems_cloud instances cloud_volumes)
  end

  private

  def textual_group_list
    [%i(relationships), %i(availability_zone_totals tags)]
  end
  helper_method :textual_group_list

  menu_section :clo

  has_custom_buttons
end
