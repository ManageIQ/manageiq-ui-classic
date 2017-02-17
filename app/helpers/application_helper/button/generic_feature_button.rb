class ApplicationHelper::Button::GenericFeatureButton < ApplicationHelper::Button::Basic
  needs :@record

  def initialize(view_context, view_binding, instance_data, props)
    super
    # TODO: use #dig when ruby2.2 is no longer supported
    @feature = props.fetch(:options, {}).fetch(:feature, nil)
  end

  def visible?
    begin
      return @record.send("supports_#{@feature}?")
    rescue NoMethodError # TODO: remove with deleting AvailabilityMixin module
      return @record.is_available?(@feature)
    end
  end
end
