class ApplicationHelper::Button::AuthKeyPairCloudDelete < ApplicationHelper::Button::Basic
  needs :@record

  def disabled?
    return true if @record.auth_key.present?
    @error_message = _('Deletion is unavailable for this keypair.')
    @error_message.present?
  end
end
