class TenantDecorator < MiqDecorator
  def self.fonticon
    'pficon pficon-tenant'
  end

  def fonticon
    tenant? ? 'pficon pficon-tenant' : 'pficon pficon-project'
  end
end
