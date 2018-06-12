class StorageDecorator < MiqDecorator
  def self.fonticon
    'fa fa-database'
  end

  def quadicon
    {
      :top_left     => {
        :tooltip  => store_type.to_s
      }.merge(store_type_icon),
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
    case store_type.try(:downcase)
    when 'cinder'
      {:fileicon => 'svg/vendor-cinder.svg'}
    when 'glance'
      {:fileicon => 'svg/vendor-openstack.svg'}
    when 'gluster'
      {:fileicon => 'svg/vendor-gluster.svg'}
    when 'vmfs'
      {:fileicon => 'svg/vendor-vmware.svg'}
    when 'nfs', 'nfs41'
      {:fonticon => 'ff ff-network-interface fa-rotate-180', :color => '#0099cc'}
    when 'fcp'
      {:fonticon => 'ff ff-network-interface fa-rotate-180', :color => '#0099cc'}
    when 'iscsi'
      {:fonticon => 'ff ff-network-interface fa-rotate-180', :color => '#0099cc'}
    when 'glusterfs'
      {:fileicon => 'svg/vendor-gluster.svg'}
    else
      {:fonticon => 'pficon pficon-unknown'}
    end
  end
end
