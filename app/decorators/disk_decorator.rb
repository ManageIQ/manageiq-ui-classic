class DiskDecorator < MiqDecorator
  def fonticon
    case device_type
    when 'floppy'
      'fa fa-floppy-o'
    when 'cdrom'
      'ff ff-cdrom'
    else
      'fa fa-hdd-o'
    end
  end
end
