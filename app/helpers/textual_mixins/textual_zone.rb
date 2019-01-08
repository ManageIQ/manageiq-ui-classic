module TextualMixins::TextualZone
  def textual_zone
    zone = if @record.zone == Zone.maintenance_zone
             _("%{m_zone} (originally in %{o_zone})") % {:m_zone => @record.zone.name, :o_zone => @record.zone_before_pause.name}
           else
             @record.zone.name
           end
    {:label => _("Managed by Zone"), :icon => "pficon pficon-zone", :value => zone}
  end
end
