class ApplicationRecord < ActiveRecord::Base
  class << self
    def decorate
      @_decorator ||= decorator_for(self)
    end

    private

    def decorator_for(klass)
      decorator = nil

      while decorator.nil? && klass != ApplicationRecord
        decorator = "#{klass.name}Decorator".safe_constantize
        klass = klass.superclass
      end

      decorator
    end
  end
end
