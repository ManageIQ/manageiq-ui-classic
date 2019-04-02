module Menu
  module CustomLoader
    @sections = []
    @items = []

    class << self
      def load
        [@sections, @items]
      end

      def register(item)
        case item
        when Menu::Section
          @sections << item
        when Menu::Item
          @items << item
        end
      end
    end
  end
end
