class ContainerBuildDecorator < MiqDecorator
  def self.fonticon
    'pficon pficon-build'
  end

  def self.fileicon
    '100/container_build.png'
  end

  def single_quad
    {
      :fonticon => fonticon
    }
  end
end
