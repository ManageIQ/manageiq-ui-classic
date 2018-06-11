class StorageDecorator < MiqDecorator
  def self.fonticon
    'fa fa-database'
  end

  def quadicon
    {
      :top_left     => {
        :fileicon => store_type_icon,
        :tooltip  => store_type.to_s
      },
      :top_right    => {:text => v_total_vms},
      :bottom_left  => {:text => v_total_hosts},
      :bottom_right => {
        :piechart => percent
      }
    }
  end

  def single_quad
    {
      :piechart => percent
    }
  end

  private

  def percent
    20 - (v_free_space_percent_of_total == 100 ? 20 : ((v_free_space_percent_of_total + 2) / 5.25).round)
  end

  def store_type_icon
    "100/storagetype-#{store_type.nil? ? "unknown" : ERB::Util.h(store_type.to_s.downcase)}.png"
  end
end
