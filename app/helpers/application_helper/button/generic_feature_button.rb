class ApplicationHelper::Button::GenericFeatureButton < ApplicationHelper::Button::Basic
  include ApplicationHelper

  needs :@record

  def initialize(view_context, view_binding, instance_data, props)
    super
    @feature = props[:options][:feature]
  end

  def visible?
    records_support_action?(@record, @feature)
  end
end
