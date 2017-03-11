class ResourcePoolController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::GenericListMixin
  include Mixins::GenericButtonMixin
  include Mixins::GenericSessionMixin
  include Mixins::GenericShowMixin

  def self.display_methods
    %w(vms descendant_vms all_vms resource_pools)
  end

  private

  def textual_group_list
    [%i(properties relationships), %i(configuration smart_management)]
  end
  helper_method :textual_group_list

  def button_sub_item_display_values
    %w(all_vms vms resource_pools)
  end

  def handled_buttons
    %w(resource_pool_delete resource_pool_protect)
  end

  def handle_resource_pool_delete
    deleteresourcepools
    redirect_to_retire_screen_if_single_delete
  end

  def handle_resource_pool_protect
    assign_policies(ResourcePool)
  end

  menu_section :inf
end
