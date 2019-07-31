module ApplicationHelper
  module Navbar
    def menu_to_json(placement = :default)
      structure = []
      Menu::Manager.menu(placement) do |menu_section|
        next unless menu_section.visible?
        
        structure << item_to_hash(menu_section)
      end
      structure
    end

    def item_to_hash(item)
      {
        :id          => item.id,
        :title       => item.name,
        :iconClass   => item.icon,
        :href        => item.link_params[:href],
        :preventHref => !item.href,
        :visible     => item.visible?,
        :active      => item_active?(item),
        :items       => item.items.to_a.map(&method(:item_to_hash))
      }
    end

    # FIXME: The 'active' below is an active section not an item. That is wrong.
    # What works is the "legacy" part that compares @layout to item.id.
    # This assumes that these matches -- @layout and item.id. Moving forward we
    # need to remove that assumption. However to do that we need figure some way
    # to identify the active menu item here.
    def item_active?(item)
      if item.leaf?
        # FIXME: remove @layout condition when every controller sets menu_section properly
        active = controller.menu_section_id(controller.params) || @layout.to_sym
        item.id.to_sym == active || item.id.to_sym == @layout.to_sym
      else
        return section_nav_class_iframe(item) if params[:action] == 'iframe'
        
        active = controller.menu_section_id(controller.params) || @layout.to_sym

        if item.parent.nil?
          # first-level, fallback to old logic for now
          # FIXME: exception behavior to remove
          active = 'my_tasks' if %w[my_tasks all_tasks].include?(@layout)
          active = 'cloud_volume' if @layout == 'cloud_volume_snapshot' || @layout == 'cloud_volume_backup'
          active = 'cloud_object_store_container' if @layout == 'cloud_object_store_object'
          active = active.to_sym
        end

        # FIXME: remove to_s, to_sym once all items use symbol ids
        item.id.to_sym == active ||
          item.contains_item_id?(active.to_s) ||
          item.contains_item_id?(active.to_sym)
      end
    end

    # special handling for custom menu sections and items
    def section_nav_class_iframe(section)
      params[:sid].present? && section.id.to_s == params[:sid] ||
        params[:id].present? && section.contains_item_id?(params[:id])
    end
  end
end
