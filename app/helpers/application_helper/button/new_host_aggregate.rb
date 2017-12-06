class ApplicationHelper::Button::NewHostAggregate < ApplicationHelper::Button::ButtonNewDiscover
  def disabled?
    super || Rbac::Filterer.filtered(ManageIQ::Providers::CloudManager).none? { |ems| ems.supports?(:create_host_aggregate) }
  end
end
