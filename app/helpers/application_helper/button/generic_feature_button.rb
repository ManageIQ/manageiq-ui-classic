class ApplicationHelper::Button::GenericFeatureButton < ApplicationHelper::Button::Basic
  needs :@record

  def initialize(view_context, view_binding, instance_data, props)
    super
    @feature = props[:options][:feature]
  end

  def visible?
    method = "supports_#{@feature}?"

    if @record.respond_to?(method)
      @record.send(method)
    else # TODO: remove with deleting AvailabilityMixin module
      @record.is_available?(@feature)
    end
  end
end
