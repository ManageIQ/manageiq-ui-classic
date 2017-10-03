class ApplicationHelper::Button::CockpitConsole < ApplicationHelper::Button::Basic
  needs :@record

  def disabled?
    canned_msg = _('The web-based console is not available because the')
    @error_message = _("%{canned_msg} 'Cockpit' role is not enabled." % {:canned_msg => canned_msg}) unless MiqRegion.my_region.role_active?('cockpit_ws')
    record_type = @record.respond_to?(:current_state) ? _('VM') : _('Container Node')
    @error_message = _("%{canned_msg} %{record_type} is not powered on" % {:canned_msg => canned_msg, :record_type => record_type}) unless on?
    @error_message = _("%{canned_msg} Windows platform is not supported" % {:canned_msg => canned_msg}) unless platform_supported?(record_type)
    @error_message.present?
  end

  private

  def on?
    return @record.current_state == 'on' if @record.respond_to?(:current_state) # VM status
    @record.ready_condition_status == 'True' if @record.respond_to?(:ready_condition_status) # Container status
  end

  def platform_supported?(record_type)
    if record_type == 'VM'
      @record.platform.downcase != 'windows'
    else
      true
    end
  end
end
