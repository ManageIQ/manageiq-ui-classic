class ApplicationHelper::Button::MiddlewareServerAction < ApplicationHelper::Button::Basic

  def visible?
    @record.present? && !hawkular? && !immutable?
  end

  private

  def immutable?
    properties = @record.try(:properties)
    properties.nil? ? false : properties['Immutable'] == 'true'
  end

  def hawkular?
    @record.try(:product) == 'Hawkular' ||
      @record.try(:middleware_server).try(:product) == 'Hawkular'
  end
end
