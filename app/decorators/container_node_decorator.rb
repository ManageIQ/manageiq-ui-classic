class ContainerNodeDecorator < MiqDecorator
  def self.fonticon
    'pficon pficon-container-node'
  end

  def self.fileicon
    '100/container_node.png'
  end

  def single_quad
    {
      :fileicon => fileicon
    }
  end
end
