class StorageDecorator < MiqDecorator
  def self.fonticon
    'fa fa-database'
  end

  def fileicon
    percent = (used_space_percent_of_total.to_i + 9) / 10
    "100/piecharts/datastore-#{percent}.png"
  end

  def quadicon(_n = nil)
    {
      :top_left     => {
        :fileicon => store_type_icon,
        :tooltip  => store_type.to_s
      },
      :top_right    => {:text => v_total_vms},
      :bottom_left  => {:text => v_total_hosts},
      :bottom_right => {
        :fileicon => free_space_fileicon
      }
    }
  end

  def single_quad
    {
      :fileicon => fileicon
    }
  end

  private

  def store_type_icon
    "100/storagetype-#{store_type.nil? ? "unknown" : ERB::Util.h(store_type.to_s.downcase)}.png"
  end

  def free_space_fileicon
    percent = v_free_space_percent_of_total == 100 ? 20 : ((v_free_space_percent_of_total + 2) / 5.25).round # val is the percentage value of free space
    "100/piecharts/datastore/#{percent}.png"
  end
end
