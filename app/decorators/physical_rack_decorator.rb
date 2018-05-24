class PhysicalRackDecorator < MiqDecorator
  def self.fonticon
    'pficon pficon-enterprise'
  end

  def single_quad
    {
      :fonticon => fonticon,
    }
  end
end
