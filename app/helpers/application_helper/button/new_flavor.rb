class ApplicationHelper::Button::NewFlavor < ApplicationHelper::Button::Basic
  def disabled?
    super || ManageIQ::Providers::CloudManager.all.none? { |ems| ems.class::Flavor.supports?(:create) }
  end
end
