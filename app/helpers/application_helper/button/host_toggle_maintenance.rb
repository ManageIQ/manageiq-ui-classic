class ApplicationHelper::Button::HostToggleMaintenance < ApplicationHelper::Button::Basic
  def disabled?
    unless @record.supports?(:set_node_maintenance) && @record.supports?(:unset_node_maintenance)
      @error_message = _('Maintenance mode is not supported for this host')
    end
    @error_message.present?
  end
end
