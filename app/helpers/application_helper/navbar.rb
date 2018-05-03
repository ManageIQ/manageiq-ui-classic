module ApplicationHelper
  module Navbar
    # FIXME: The 'active' below is an active section not an item. That is wrong.
    # What works is the "legacy" part that compares @layout to item.id.
    # This assumes that these matches -- @layout and item.id. Moving forward we
    # need to remove that assumption. However to do that we need figure some way
    # to identify the active menu item here.
    def item_nav_class(item)
      active = controller.menu_section_id(controller.params) || @layout.to_sym

      # FIXME: remove @layout condition when every controller sets menu_section properly
      item.id.to_sym == active || item.id.to_sym == @layout.to_sym ? 'active' : nil
    end

    # special handling for custom menu sections and items
    def section_nav_class_iframe(section)
      if params[:sid].present?
        section.id.to_s == params[:sid] ? 'active' : nil
      elsif params[:id].present?
        section.contains_item_id?(params[:id]) ? 'active' : nil
      end
    end

    def section_nav_class(section)
      return section_nav_class_iframe(section) if params[:action] == 'iframe'

      active = controller.menu_section_id(controller.params) || @layout.to_sym

      if section.parent.nil?
        # first-level, fallback to old logic for now
        # FIXME: exception behavior to remove
        active = 'my_tasks' if %w(my_tasks all_tasks).include?(@layout)
        active = 'cloud_volume' if @layout == 'cloud_volume_snapshot' || @layout == 'cloud_volume_backup'
        active = 'cloud_object_store_container' if @layout == 'cloud_object_store_object'
        active = active.to_sym
      end

      return 'active' if section.id.to_sym == active

      # FIXME: remove to_s, to_sym once all items use symbol ids
      return 'active' if section.contains_item_id?(active.to_s)
      return 'active' if section.contains_item_id?(active.to_sym)
    end
  end
end
