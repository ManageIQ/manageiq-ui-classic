class ApplicationHelper::Button::CloudVolumeBackupRestore < ApplicationHelper::Button::ButtonNewDiscover
  def disabled?
    ManageIQ::Providers::CloudManager.none? do |ems|
      "#{ems.class}::CloudVolume".safe_constantize&.supports?(:backup_restore)
    end
  end
end
