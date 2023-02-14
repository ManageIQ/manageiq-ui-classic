module ZonesHelper
  private

  def settings_zone_list(zones, my_zone_name)
    {
      :headers  => [{:header => _("Zones"), :key => 'zone_type'}],
      :rows     => settings_zone_rows(zones),
      :selected => selected_zone(zones, my_zone_name)
    }
  end

  def selected_zone(zones, my_zone_name)
    zones.detect { |z| z.name == my_zone_name }&.id&.to_s
  end

  def zone_name(my_zone_name, zone)
    name = "#{ui_lookup(:model => zone.class.to_s)} : #{zone.description}"
    name << " (#{_("current")})" if my_zone_name == zone.name
    name
  end

  def settings_zone_rows(zones)
    zones&.sort_by(&:description)&.map do |zone|
      {
        :id        => zone.id.to_s,
        :clickable => true,
        :cells     => [{:text => zone_name(my_zone_name, zone), :icon => 'pficon pficon-zone'}],
      }
    end
  end
end
