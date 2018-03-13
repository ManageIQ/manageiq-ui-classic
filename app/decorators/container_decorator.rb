class ContainerDecorator < MiqDecorator
  def self.fonticon
    'fa fa-cube'
  end

  def self.fileicon
    '100/container.png'
  end

  def single_quad
    {
      :fileicon => fileicon
    }
  end
end
