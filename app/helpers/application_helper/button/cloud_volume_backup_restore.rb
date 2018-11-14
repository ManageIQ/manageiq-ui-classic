class ApplicationHelper::Button::CloudVolumeBackupRestore < ApplicationHelper::Button::ButtonNewDiscover
  def disabled?
    !ManageIQ::Providers::CloudManager.any? do |ems|
      Module.const_defined?("#{ems.class}::CloudVolume") &&
        ems.class::CloudVolume.supports?(:backup_restore)
    end
  end
end
