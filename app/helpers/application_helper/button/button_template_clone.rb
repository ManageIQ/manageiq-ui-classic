class ApplicationHelper::Button::ButtonTemplateClone < ApplicationHelper::Button::Basic
  needs :@record

  def disabled?
    @error_message = _('Template cannot be cloned') if @record.type.eql?("ManageIQ::Providers::IbmPowerHmc::InfraManager")
    @error_message.present?
  end
end
