class ApplicationHelper::Button::StorageDelete < ApplicationHelper::Button::Basic
  needs :@record

  def disabled?
    unless @record.vms_and_templates.empty? && @record.hosts.empty?
      @error_message = _('Only %{storage} without VMs and Hosts can be removed') %
                       {:storage => ui_lookup(:table => 'storage')}
    end
    @error_message.present?
  end
end
