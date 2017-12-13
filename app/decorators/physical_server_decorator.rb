class PhysicalServerDecorator < MiqDecorator
  def fileicon
    "svg/vendor-#{label_for_vendor.downcase}.svg"
  end

  def self.fonticon
    'pficon pficon-server'
  end

  def quadicon(_n = nil)
    {
      :top_left     => {:text => (host ? 1 : 0)},
      :top_right    => {
        :fileicon => "svg/currentstate-#{ERB::Util.h(power_state.try(:downcase))}.svg",
        :tooltip  => power_state.try(:downcase)
      },
      :bottom_left  => {
        :fileicon => fileicon,
        :tooltip  => type
      },
      :bottom_right => {
        :fileicon => health_state_img(self),
        :tooltip  => health_state
      }
    }
  end
end
