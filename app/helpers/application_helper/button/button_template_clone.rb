class ApplicationHelper::Button::ButtonTemplateClone < ApplicationHelper::Button::Basic
  needs :@record

  def disabled?
    if @record.type.eql?("ManageIQ::Providers::IbmPowerHmc::InfraManager") then
      true
    else
      false
    end
  end
end

