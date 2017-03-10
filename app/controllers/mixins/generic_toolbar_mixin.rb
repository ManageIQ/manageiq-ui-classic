module Mixins
  module GenericToolbarMixin
    extend ActiveSupport::Concern

    class_methods do
      def toolbar(singular, plural = nil)
        plural = singular.to_s.pluralize if plural.nil?

        @generic_toolbar_singular = singular.to_sym
        @generic_toolbar_plural = plural.to_sym
      end

      def toolbar_singular
        @generic_toolbar_singular
      end

      def toolbar_plural
        @generic_toolbar_plural
      end
    end
  end
end
