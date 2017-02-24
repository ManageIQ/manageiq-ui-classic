# extending all model instances and classes to have a `decorate` method
class ApplicationRecord < ActiveRecord::Base
  class << self
    def decorate
      @_decorator ||= MiqDecorator.for(self)
    end
  end

  def decorate
    @_decorator ||= MiqDecorator.for(self.class).try(:new, self)
  end
end
