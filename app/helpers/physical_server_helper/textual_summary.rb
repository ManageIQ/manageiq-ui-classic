module PhysicalServerHelper::TextualSummary
  def textual_group_properties
    %i(name model product_name manufacturer machine_type serial_number uuid)
  end

  def textual_group_relationships
    %i(host)
  end

  def textual_host
    {
      :label => _("Host"), :value => @record.host.try(:name), :icon => "pficon pficon-virtual-machine",
      :link => url_for(:controller => 'host', :action => 'show', :id => @record.host.try(:id))
    }
  end

  def textual_name
    {:label => _("Server name"), :value => @record.name }
  end

  def textual_product_name
    {:label => _("Product Name"), :value => @record.product_name }
  end

  def textual_manufacturer
    {:label => _("Manufacturer"), :value => @record.manufacturer }
  end

  def textual_machine_type
    {:label => _("Machine Type"), :value => @record.machine_type }
  end

  def textual_serial_number
    {:label => _("Serial Number"), :value => @record.serial_number }
  end

  def textual_uuid
    {:label => _("UUID"), :value => @record.uuid }
  end

  def textual_model
    {:label => _("Model"), :value => @record.model}
  end
end
