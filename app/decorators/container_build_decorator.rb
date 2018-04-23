class ContainerBuildDecorator < MiqDecorator
  def self.fonticon
    'pficon pficon-build'
  end

  def single_quad
    {
      :fonticon => fonticon
    }
  end
end
