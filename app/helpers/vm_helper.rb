module VmHelper
  include RequestInfoHelper
  include TextualSummary
  include ComplianceSummaryHelper
  include VmConfigHelper

  # TODO: These methods can be removed once the Summary and ListNav data layer is consolidated.
  def last_date(request_type)
    @last_date ||= {}
    return @last_date[request_type] if @last_date.key?(request_type)
    @last_date[request_type] = send("last_date_#{request_type}")
  end

  def last_date_processes
    @record.operating_system&.processes&.maximum(:updated_on)
  end

  def set_controller_action
    url = request.parameters[:controller]
    action = "x_show"
    return url, action
  end

  def textual_cloud_network
    return nil unless @record.kind_of?(ManageIQ::Providers::CloudManager::Vm)
    {:label => _("Virtual Private Cloud"), :value => @record.cloud_network ? @record.cloud_network.name : _('None')}
  end

  def textual_cloud_subnet
    return nil unless @record.kind_of?(ManageIQ::Providers::CloudManager::Vm)
    {:label => _("Cloud Subnet"), :value => @record.cloud_subnet ? @record.cloud_subnet.name : _('None')}
  end
end
