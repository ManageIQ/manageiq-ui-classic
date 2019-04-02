class ApplicationHelper::Button::EmsCaptureMetrics < ApplicationHelper::Button::Basic
  def disabled?
    super
    if @record
      check_credentials
      check_refresh
      check_endpoint
    end
    check_role

    @error_message.present?
  end

  def check_credentials
    @error_message ||= _("Credentials must be valid to capture metrics") unless @record.authentication_status.downcase == "valid"
  end

  def check_refresh
    @error_message ||= _("Please refresh provider before metrics capture") unless @record.last_refresh_error.nil?
  end

  def check_endpoint
    @error_message ||= _("Metrics endpoint is not set") unless @record.supports_metrics?
  end

  def check_role
    metrics_collection = ManageIQ::Providers::Kubernetes::ContainerManager.method_defined?(:queue_metrics_capture) &&
                         MiqServer.my_server.zone.role_active?("ems_metrics_coordinator")

    @error_message ||= _("Capacity & Utilization Coordinator role is off") unless metrics_collection
  end
end
