class ApplicationHelper::Button::NewFlavor < ApplicationHelper::Button::ButtonNewDiscover
  def disabled?
    super || ManageIQ::Providers::CloudManager.all.none? { |ems| ems.class::Flavor.supports?(:create) }
  end
end
