class ApplicationHelper::Button::AuthKeyPairCloudDownload < ApplicationHelper::Button::Basic
  needs :@record

  def disabled?
    if @record.auth_key.present?
      return false
    end

    @error_message = _('Private key download is unavailable for this keypair.')
    @error_message.present?
  end
end
