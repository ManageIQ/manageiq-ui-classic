class ApplicationHelper::Button::ZoneDelete < ApplicationHelper::Button::Basic
  needs :@selected_zone

  def disabled?
    @error_message = if @selected_zone.name.downcase == 'default'
                       _("'Default' zone cannot be deleted")
                     elsif relationships?
                       _('Cannot delete a Zone that has Relationships')
                     end
    @error_message.present?
  end

  private

  def relationships?
    @selected_zone.ext_management_systems.count > 0 ||
      @selected_zone.storage_managers.count > 0 ||
      @selected_zone.miq_schedules.count > 0 ||
      @selected_zone.miq_servers.count > 0
  end
end
