class ApplicationHelper::Button::NewHostAggregate < ApplicationHelper::Button::ButtonNewDiscover
  def disabled?
    super || ManageIQ::Providers::CloudManager.all.none? { |ems| ems.supports?(:create_host_aggregate) }
  end
end
