class ApplicationHelper::Button::AuthKeyPairCloudCreate < ApplicationHelper::Button::ButtonNewDiscover
  def disabled?
    # check that at least one EMS the user has access to supports
    # creation or import of key pairs.
    return false if Rbac.filtered(ManageIQ::Providers::CloudManager).any?(&:supports_auth_key_pair_create)

    @error_message = _('No cloud providers support key pair import or creation.')
    @error_message.present?
  end
end
