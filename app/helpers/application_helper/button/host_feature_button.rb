class ApplicationHelper::Button::HostFeatureButton < ApplicationHelper::Button::GenericFeatureButton

  def visible?
    unless @feature.nil? || @record.nil?
      return @record.supports?(@feature)
    end
    true
  end

  def disabled?
    false
  end
end
