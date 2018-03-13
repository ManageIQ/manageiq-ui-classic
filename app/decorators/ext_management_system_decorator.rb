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

  def quadicon(_n = nil)
    {
      :top_left     => {:text => try(:hosts).try(:size).to_i},
      :top_right    => {:text => ""},
      :bottom_left  => {
        :fileicon => fileicon,
        :tooltip  => type
      },
      :bottom_right => {
        :fileicon => QuadiconHelper::Decorator.status_img(authentication_status),
        :tooltip  => authentication_status
      }
    }
  end

  def single_quad
    {
      :fileicon => fileicon
    }
  end
end
