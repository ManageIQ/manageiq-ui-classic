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
      :top_left     => {:text => try(:hosts).try(:size) || 0},
      :top_right    => {:text => ""},
      :bottom_left  => {
        :fileicon => fileicon,
        :tooltip  => try(:type)
      },
      :bottom_right => {
        :fileicon => status_img(self),
        :tooltip  => try(:authentication_status)
      }
    }
  end
end
