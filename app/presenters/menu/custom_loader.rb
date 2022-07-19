module Menu
  class CustomLoader
    def load
      sections_items
    end

    private

    def engines
      Vmdb::Plugins.all
    end

    def sections_items
      sections = []
      items = []

      engines.flat_map { |engine| engine.try(:menu) || [] }.each do |item|
        case item
        when Menu::Section
          sections << item
        when Menu::Item
          items << item
        end
      end

      [sections, items]
    end
  end
end
