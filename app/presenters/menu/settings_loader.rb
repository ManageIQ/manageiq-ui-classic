module Menu
  class SettingsLoader < YamlLoader
    include Singleton

    def self.load
      instance.load_from_settings
    end

    def load_from_settings
      begin
        settings = ::Settings.ui.custom_menu
        items = (settings || []).map { |i| create_custom_item(HashWithIndifferentAccess.new(i)) }
      rescue => e
        # if we encounter an error while loading the menus, we ignore the whole settings
        $log.error("Error loading custom menu from settings: #{e}")
        $log.error("Settings were: #{settings}")
        return [[], []]
      end
      [[], items]
    end

    private 

    def create_custom_item(item)
      # only alow:
      #  * items,
      #  * displayed in the iframe,
      #  * and at the top menu level.
      create_custom_menu_item(item.merge(
        'type'      => 'items',
        'item_type' => 'big_iframe',
        'parent'    => nil
      ))
    end
  end
end
