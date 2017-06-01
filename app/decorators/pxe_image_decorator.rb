class PxeImageDecorator < MiqDecorator
  def fonticon
    default_for_windows ? 'fa fa-cog' : 'ff ff-network-card'
  end
end
