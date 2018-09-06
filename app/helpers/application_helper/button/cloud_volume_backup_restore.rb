class ApplicationHelper::Button::CloudVolumeBackupRestore < ApplicationHelper::Button::ButtonNewDiscover
  def disabled?
    ManageIQ::Providers::CloudManager.all.none? { |ems| ems.class::CloudVolume.supports?(:backup_restore) }
  end
end
