class ContainerGroupDecorator < MiqDecorator
  def self.fonticon
    'fa fa-cubes'
  end

  def single_quad
    {
      :fonticon => fonticon
    }
  end
end
