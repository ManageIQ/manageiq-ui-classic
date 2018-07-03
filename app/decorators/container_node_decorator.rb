class ContainerNodeDecorator < MiqDecorator
  def self.fonticon
    'pficon pficon-container-node'
  end

  def fileicon
    "svg/container_node.svg"
  end

  def single_quad
    {
      :fonticon => fonticon
    }
  end
end
