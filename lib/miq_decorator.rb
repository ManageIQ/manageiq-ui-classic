class MiqDecorator < SimpleDelegator
  class << self
    def for(klass)
      decorator = nil

      while decorator.nil? && klass != ApplicationRecord && !klass.nil?
        decorator = "#{klass.name}Decorator".safe_constantize
        klass = klass.superclass
      end

      decorator
    end
  end
end
