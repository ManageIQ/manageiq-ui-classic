class ApplicationHelper::Button::EmsNetwork < ApplicationHelper::Button::Basic
  def visible?
    if @record
      @record.supports_ems_network_new?
    else
      ::EmsNetwork.all.any? { |ems| ems.supports_ems_network_new? }
    end
  end
end
