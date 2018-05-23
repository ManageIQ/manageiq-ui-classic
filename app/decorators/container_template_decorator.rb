class ContainerTemplateDecorator < MiqDecorator
  def self.fonticon
    'pficon pficon-template'
  end

  def single_quad
    {
      :fonticon => fonticon
    }
  end
end
