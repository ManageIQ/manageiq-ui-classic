class ApplicationRecord < ActiveRecord::Base
  class << self
    def decorate
      @_decorator ||= MiqDecorator.for(self)
    end
  end

  def decorate
    @_decorator ||= MiqDecorator.for(self.class).new(self)
  end
end
