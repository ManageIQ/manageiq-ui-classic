class ApplicationHelper::Button::CloudVolumeBackupCreate < ApplicationHelper::Button::ButtonNewDiscover
  def disabled?
    ManageIQ::Providers::CloudManager.all.none? { |ems| ems.class::CloudVolume.supports?(:backup_create) }
  end
end
