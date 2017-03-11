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

  # handle buttons pressed on the button bar
  def button
    generic_button_setup

    handle_tag_presses(params[:pressed])
    handle_button_pressed(params[:pressed])

    handle_sub_item_presses(params[:pressed]) do |pfx|
      process_vm_buttons(pfx) unless params[:pressed].ends_with?("_tag")

      return if button_control_transferred?(params[:pressed])

      unless button_has_redirect_suffix?(params[:pressed])
        set_refresh_and_show
      end
    end

    return if response && performed?

    check_if_button_is_implemented

    if button_has_redirect_suffix?(params[:pressed])
      render_or_redirect_partial_for(params[:pressed])
    elsif button_replace_gtl_main?
      replace_gtl_main_div
    else
      render_flash
    end
  end

  private

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

  def textual_group_list
    [%i(properties relationships), %i(configuration smart_management)]
  end
  helper_method :textual_group_list

  def button_sub_item_display_values
    %w(all_vms vms resource_pools)
  end

  menu_section :inf
end
