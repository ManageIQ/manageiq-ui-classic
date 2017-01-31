module PhysicalServerHelper::TextualSummary


  def textual_group_properties
  #   %i(name hostname productName manufacturer machineType serialNumber uuid)
  %i(name)
  end

  def textual_group_relationships
    %i(host)
  end

  def textual_group_compliance

  end

  # def textual_hostname
  #   {:label => _("Host name"), :value => @record.hostname }
  # end

  def textual_host
    #TODO (walteraa) use physical->virtual relationship
    {:label => _("Host"), :value => 0}
  end

  def textual_name
    {:label => _("Server name"), :value => @record.name }
  end

  # def textual_productName
  #   {:label => _("Product Name"), :value => @record.productName }
  # end
  #
  # def textual_manufacturer
  #   {:label => _("Manufacturer"), :value => @record.manufacturer }
  # end
  #
  #
  # def textual_machineType
  #   {:label =>_("Machine Type"), :value =>  @record.machineType }
  # end
  #
  #
  # def textual_serialNumber
  #   {:label => _("Serial Number"), :value => @record.serialNumber }
  # end
  #
  # def textual_uuid
  #   {:label => _("UUID"), :value => @record.uuid }
  #
  # end
    
end
