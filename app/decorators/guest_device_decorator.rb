class GuestDeviceDecorator < MiqDecorator
  def fonticon
    case device_type
    when 'ethernet'
      'ff ff-network-card'
    when 'cdrom'
      'ff ff-cdrom'
    when 'scsi'
      'ff ff-scsi'
    when 'serial'
      'ff ff-serial'
    when 'usb'
      'fa fa-usb'
    when 'parallel'
      'ff ff-parallel'
    when 'sound'
      'fa fa-volume-up'
    when 'management'
      'ff ff-network-interface'
    when 'physical port'
      'ff ff-port'
    else
      'pficon pficon-unknown'
    end
  end
end
