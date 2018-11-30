class ApplicationHelper::Button::NewFlavor < ApplicationHelper::Button::ButtonNewDiscover
  def disabled?
    super || ManageIQ::Providers::CloudManager.all.none? do |ems|
      ems.class.constants.include?(:Flavor) && ems.class::Flavor.supports?(:create)
    end
  end
end
