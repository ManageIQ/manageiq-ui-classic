class ExtManagementSystemDecorator < MiqDecorator
  def self.fonticon
    'pficon pficon-server'
  end

  def fonticon
    nil
  end

  def fileicon
    "svg/vendor-#{image_name}.svg"
  end

  def single_quad
    {
      :fileicon => fileicon
    }
  end
end
