class ApplicationHelper::Button::PhysicalStorageTimeline < ApplicationHelper::Button::EmsTimeline
  def calculate_properties
    super
    self[:hidden] = true unless visible?
  end

  def visible?
    @record.supports?(:timeline)
  end

  def disabled?
    @error_message.present?
  end
end
