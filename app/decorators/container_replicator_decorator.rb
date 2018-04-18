class ContainerReplicatorDecorator < MiqDecorator
  def self.fonticon
    'pficon pficon-replicator'
  end

  def self.fileicon
    '100/container_replicator.png'
  end

  def single_quad
    {
      :fonticon => fonticon
    }
  end
end
