class ApplicationHelper::Button::VmHtml5Console < ApplicationHelper::Button::Basic
  needs :@record

  def visible?
    @record.supports?(:html5_console)
  end

  def disabled?
    @error_message = _('The web-based VNC console is not available because the VM is not powered on') if @record.current_state != 'on'
    @error_message.present?
  end
end
