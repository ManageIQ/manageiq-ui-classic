class ServiceTemplateCatalogDecorator < MiqDecorator
  def self.fonticon
    'pficon pficon-folder-close'
  end

  def single_quad
    {
      :fonticon => fonticon
    }
  end
end
