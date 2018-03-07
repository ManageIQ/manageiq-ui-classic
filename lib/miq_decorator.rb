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

    # Initialize these two attributes with default to nil
    attr_reader :fonticon, :fileicon
  end

  # Call the class methods with identical names if these are not set
  delegate :fonticon, :to => :class
  delegate :fileicon, :to => :class
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
