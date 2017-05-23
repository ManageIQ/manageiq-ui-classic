module ApplicationHelper::Button::Mixins::ButtonPromptMixin
  def calculate_properties
    super
    self[:prompt] = @record.try(:log_file_depot).try(:requires_support_case?)
  end
end
