class FlavorDecorator < MiqDecorator
  def self.fonticon
    'pficon pficon-flavor'
  end

  def single_quad
    {
      :fonticon => fonticon
    }
  end
end
