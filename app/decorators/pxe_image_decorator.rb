class PxeImageDecorator < MiqDecorator
  def fonticon
    default_for_windows ? 'fa fa-cog' : 'product product-network_card'
  end
end
