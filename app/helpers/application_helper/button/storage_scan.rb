class ApplicationHelper::Button::StorageScan < ApplicationHelper::Button::GenericFeatureButtonWithDisable
  needs :@record

  def visible?
    true
  end

  def disabled?
    disabled = super
    unless disabled
      if no_active_hosts?
        @error_message = _('SmartState Analysis cannot be performed when there is no active Host')
      elsif without_valid_credentials_for_datastores?
        @error_message = _('There are no running Hosts with valid credentials for this Datastore')
      end
    end
    @error_message.present?
  end

  private

  def no_active_hosts?
    @record.active_hosts.empty?
  end

  def without_valid_credentials_for_datastores?
    @record.active_hosts_with_authentication_status_ok.empty?
  end
end
