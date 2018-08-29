class PhysicalChassisDecorator < MiqDecorator
  def self.fonticon
    'pficon pficon-template'
  end

  def quadicon
    {
      :top_left     => {
        :text    => t = physical_servers.count,
        :tooltip => n_("%{number} Physical Server", "%{number} Physical Servers", t) % {:number => t}
      },
      :top_right    => {},
      :bottom_left  => {
        :fonticon => fonticon,
        :tooltip  => ui_lookup(:model => type),
      },
      :bottom_right => QuadiconHelper.health_state(health_state)
    }
  end
end
