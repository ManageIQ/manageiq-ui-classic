class ApplicationHelper::Button::InstanceAssociateFloatingIp < ApplicationHelper::Button::Basic
  def visible?
    @record.class.supports?(:associate_floating_ip)
  end

  def disabled?
    if !@record.supports?(:associate_floating_ip)
      @error_message = @record.unsupported_reason(:associate_floating_ip)
    elsif @record.cloud_tenant.nil? || @record.cloud_tenant.floating_ips.empty?
      @error_message = _('There are no Floating IPs available to this Instance.')
    end
    @error_message.present?
  end
end
