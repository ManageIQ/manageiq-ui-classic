module Menu
  class Manager
    include Enumerable
    include Singleton

    class << self
      extend Forwardable

      delegate %i[menu item_in_section? item items section section_id_string_to_symbol
                  section_for_item_id each map detect select] => :instance
    end

    def each
      @menu.each { |section| yield section }
    end

    def menu(placement = :default)
      @menu.each do |menu_section|
        yield menu_section if menu_section.placement == placement
      end
    end

    def items
      @menu
    end

    def item(item_id)
      @menu.each do |menu_section|
        return menu_section if menu_section.kind_of?(Menu::Item) && menu_section.id == item_id

        menu_section.items.each do |el|
          the_item = el.item(item_id)
          return the_item if the_item.present?
        end
      end
      nil
    end

    def section(section_id)
      # prevent .to_sym call on section_id
      section_id = section_id_string_to_symbol(section_id) if section_id.kind_of?(String)
      @id_to_section[section_id]
    end

    def section_for_item_id(item_id)
      found = nil
      @id_to_section.each do |_id, section|
        next unless section.contains_item_id?(item_id)

        found = section if !found || section.parent
      end

      found
    end

    def item_in_section?(item_id, section_id)
      @id_to_section[section_id].contains_item_id?(item_id)
    end

    #
    # Takes section id as string and returns section id symbol or null.
    #
    # Prevent calling to_sym on user input by using this method.
    #
    def section_id_string_to_symbol(section_id_string)
      valid_sections[section_id_string]
    end

    def menu_structure(placement=:default)
      m = []
      Menu::Manager.menu(placement) do |menu_section|
        next unless menu_section.visible?

        section = {
          id: menu_section.id,
          link_params: menu_section.link_params,
          name: menu_section.name,
          icon: menu_section.icon,
        }

        if menu_section.subsections?
          subsections = []
          menu_section.items.each do |menu_item|
            next unless menu_item.visible?

            subsection = {
              leaf: menu_item.leaf?,
              link_params: menu_item.link_params,
              name: menu_item.name,
              id: menu_item.id,
            }

            if !menu_item.leaf?
              items = []
              menu_item.items.each do |item|
                items << {
                  link_params: menu_item.link_params,
                  name: menu_item.name,
                  id: menu_item.id,
                }
              end
              subsection[:items] = items
            end
            subsections << subsection
          end
          section[:items] = subsections
        end

        m << section
      end
      m
    end

    private

    class InvalidMenuDefinition < Exception
    end

    def initialize
      load_default_items
      load_custom_items(Menu::YamlLoader)
      load_custom_items(Menu::CustomLoader)
      load_custom_items(Menu::SettingsLoader)
    end

    def merge_sections(sections)
      sections.each do |section|
        position = nil

        parent = if section.parent_id && @id_to_section.key?(section.parent_id)
                   @id_to_section[section.parent_id].items
                 else
                   @menu
                 end

        if section.before
          position = parent.index { |existing_section| existing_section.id == section.before }
        end

        if position
          parent.insert(position, section)
        else
          parent << section
        end
      end
    end

    def merge_items(items)
      items.each do |item|
        parent = @id_to_section[item.parent_id]
        if parent.nil?
          @menu << item
        else
          parent.items << item
          item.parent = parent
        end
      end
    end

    def load_custom_items(loader)
      sections, items = loader.load
      merge_sections(sections)
      preprocess_sections
      merge_items(items)
    end

    def load_default_items
      @menu = Menu::DefaultMenu.default_menu
      preprocess_sections
    end

    def preprocess_sections
      @id_to_section = @menu.index_by(&:id)
      # recursively add subsections to the @id_to_section hash
      @menu.each do |section|
        section.preprocess_sections(@id_to_section) if section.respond_to?(:preprocess_sections)
      end
    end

    def valid_sections
      # format is {"vi" => :vi, "svc" => :svc . . }
      @valid_sections ||= @id_to_section.keys.index_by(&:to_s)
    end
  end
end
