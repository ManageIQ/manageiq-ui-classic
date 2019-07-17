class ApplicationHelper::Button::VmHtml5Console < ApplicationHelper::Button::Basic
  needs :@record

  def visible?
    %w[vnc webmks spice].any? { |type| @record.send(:console_supported?, type) }
  end

  def disabled?
    @error_message = _('The web-based VNC console is not available because the VM is not powered on') if @record.current_state != 'on'
    @error_message.present?
  end
end
