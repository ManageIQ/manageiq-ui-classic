class ContainerServiceDecorator < MiqDecorator
  def self.fonticon
    'pficon pficon-service'
  end

  def single_quad
    {
      :fonticon => fonticon
    }
  end
end
