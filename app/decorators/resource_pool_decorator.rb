class ResourcePoolDecorator < MiqDecorator
  def self.fonticon
    'pficon pficon-resource-pool'
  end

  def fileicon
    vapp ? 'svg/vendor-vmware.svg' : nil
  end

  def single_quad
    {
      :fileicon => fileicon,
      :fonticon => fileicon ? nil : fonticon
    }.compact
  end
end
