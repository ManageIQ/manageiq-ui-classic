module Menu
  class YamlLoader
    def load
      sections = []
      items    = []
      Dir.glob(Rails.root.join('product/menubar/*.yml')).each do |f|
        load_custom_item(f, sections, items)
      end
      [sections, items]
    end

    private

    def load_custom_item(file_name, sections, items)
      properties = YAML.load(File.read(file_name))
      if properties['type'] == 'section'
        sections << create_custom_menu_section(properties)
      else
        items << create_custom_menu_item(properties)
      end
    end

    # In case `rbac` is a Hash, convert keys to symbols.
    #   Example: { :feature => 'vm_explorer', :any => true }
    #
    # Else assume string and return:
    #   { :feature => rbac }
    def parse_rbac_property(rbac)
      rbac.kind_of?(Hash) ? rbac.symbolize_keys : { :feature => rbac }
    end

    def create_custom_menu_item(properties)
      %w[id name rbac].each do |property|
        if properties[property].blank?
          raise Menu::Manager::InvalidMenuDefinition,
                "incomplete definition -- missing #{property}"
        end
      end

      rbac = parse_rbac_property(properties['rbac'])
      item_type = properties.fetch('item_type', :default).to_sym

      item = Item.new(
        properties['id'],
        properties['name'],
        properties['feature'],
        rbac,
        properties['href'],
        item_type,
        properties['parent']&.to_sym,
        nil,
        properties['icon']
      )
      item
    end

    def create_custom_menu_section(properties)
      icon         = properties.key?('icon') ? properties['icon'] : nil
      placement    = properties.key?('placement') ? properties['placement'].to_sym : :default
      before       = properties.key?('before') ? properties['before'].to_sym : nil
      section_type = properties.key?('section_type') ? properties['section_type'].to_sym : :default
      href         = properties.key?('href') ? properties['href'].to_sym : nil
      # no parent_id here?
      Section.new(properties['id'].to_sym, properties['name'], icon, [], placement, before, section_type, href)
    end
  end
end
