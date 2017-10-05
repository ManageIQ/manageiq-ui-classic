class ApplicationHelper::Button::StorageDelete < ApplicationHelper::Button::Basic
  needs :@record

  def disabled?
    unless @record.vms_and_templates.empty? && @record.hosts.empty?
      @error_message = _('Only Datastore without VMs and Hosts can be removed')
    end
    @error_message.present?
  end
end
