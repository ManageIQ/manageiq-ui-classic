class TenantDecorator < MiqDecorator
  def fonticon
    tenant? ? 'pficon pficon-tenant' : 'pficon pficon-project'
  end
end
