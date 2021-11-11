class ApplicationHelper::Button::AuthKeyPairCloudCreate < ApplicationHelper::Button::ButtonNewDiscover
  def disabled?
    # check that at least one EMS the user has access to supports
    # creation or import of key pairs.
    supported_types = ManageIQ::Providers::CloudManager::AuthKeyPair.descendants.select { |klass| klass.supports?(:create) }.map(&:module_parent).map(&:name)
    return false if Rbac.filtered(ManageIQ::Providers::CloudManager.where(:type => supported_types)).any?

    @error_message = _('No cloud providers support key pair import or creation.')
    @error_message.present?
  end
end
