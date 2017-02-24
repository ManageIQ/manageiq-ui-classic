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

module MiqDecorator::Instance
  def decorate
    @_decorator ||= MiqDecorator.for(self.class).try(:new, self)
  end
end

module MiqDecorator::Klass
  def decorate
    @_decorator ||= MiqDecorator.for(self)
  end
end
