class ApplicationHelper::Button::CloudVolumeBackupCreate < ApplicationHelper::Button::ButtonNewDiscover
  def disabled?
    ManageIQ::Providers::CloudManager.none? do |ems|
      "#{ems.class}::CloudVolume".safe_constantize&.supports?(:backup_create)
    end
  end
end
