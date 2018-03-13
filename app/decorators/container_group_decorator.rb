class ContainerGroupDecorator < MiqDecorator
  def self.fonticon
    'fa fa-cubes'
  end

  def self.fileicon
    '100/container_group.png'
  end

  def single_quad
    {
      :fileicon => fileicon
    }
  end
end
