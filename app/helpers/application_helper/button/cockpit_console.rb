class ApplicationHelper::Button::CockpitConsole < ApplicationHelper::Button::Basic
  needs :@record

  def disabled?
    if !MiqRegion.my_region.role_active?('cockpit_ws')
      @error_message = _("The web-based console is not available because the 'Cockpit' role is not enabled.")
    end

    if !on?
      @error_message = if @record.respond_to?(:current_state)
                         _('The web-based console is not available because the VM is not powered on')
                       else
                         _('The web-based console is not available because the Container Node is not powered on')
                       end
    end

    if !platform_supported?
      @error_message = _('The web-based console is not available because the Windows platform is not supported')
    end

    @error_message.present?
  end

  private

  def on?
    return @record.current_state == 'on' if @record.respond_to?(:current_state) # VM status
    @record.ready_condition_status == 'True' if @record.respond_to?(:ready_condition_status) # Container status
  end

  def platform_supported?
    if @record.respond_to?(:current_state)
      @record.platform.downcase != 'windows'
    else
      true
    end
  end
end
