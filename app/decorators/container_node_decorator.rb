class ContainerNodeDecorator < MiqDecorator
  def self.fonticon
    'pficon pficon-container-node'
  end

  def single_quad
    {
      :fonticon => fonticon
    }
  end
end
