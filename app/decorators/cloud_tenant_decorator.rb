class CloudTenantDecorator < MiqDecorator
  def self.fonticon
    'pficon pficon-cloud-tenant'
  end

  def single_quad
    {
      :fonticon => fonticon
    }
  end
end
