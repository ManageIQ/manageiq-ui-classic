module Menu
  module CustomLoader
    class << self
      def load
        @cache ||= sections_items
      end

      def engines
        Vmdb::Plugins.all
      end

      def sections_items
        sections = []
        items = []

        engines.map do |engine|
          engine.try(:menu)
        end.compact.flatten.each do |item|
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
end
