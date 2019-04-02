class ApplicationHelper::Button::SetOwnership < ApplicationHelper::Button::Basic
  needs :@record

  def disabled?
    @error_message = _('Ownership is controlled by tenant mapping') if
      @record.try(:ext_management_system).try(:tenant_mapping_enabled?)
    @error_message.present?
  end
end
