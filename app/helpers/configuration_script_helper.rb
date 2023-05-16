module ConfigurationScriptHelper
  include TextualMixins::TextualGroupTags

  def textual_group_properties
    TextualGroup.new(
      _("Properties"),
      %i[hostname ipmi_present ipaddress mac_address provider_name zone]
    )
  end

  def textual_hostname
    {:label => _("Hostname"),
     :icon  => "ff ff-configured-system",
     :value => @record.hostname}
  end

  def textual_ipmi_present
    {:label => _("IPMI Present"), :value => @record.ipmi_present}
  end

  def textual_ipaddress
    {:label => _("IP Address"), :value => @record.ipaddress}
  end

  def textual_mac_address
    {:label => _("Mac address"), :value => @record.mac_address}
  end

  def textual_provider_name
    {:label    => _("Provider"),
     :image    => @record.configuration_manager.decorate.fileicon,
     :value    => @record.configuration_manager.try(:name),
     :explorer => true}
  end

  def textual_zone
    {:label => _("Zone"), :value => @record.configuration_manager.my_zone}
  end

  def textual_inventory_group_properties
    %i[inventory_group_name
       inventory_group_region]
  end

  def textual_inventory_group_name
    {:label => _("Name"), :value => @record.name}
  end

  def textual_inventory_group_region
    {:label => _("Region"), :value => @record.region_description}
  end

  def textual_inventory_group_architecture
    {:label => _("Architecture"), :value => @record.configuration_architecture_name}
  end

  def textual__inventory_group_os
    {:label => _("OS"), :value => @record.operating_system_flavor_name}
  end

  def textual_inventory_group_medium
    {:label => _("Medium"), :value => @record.customization_script_medium_name}
  end

  def textual_inventory_group_partition_table
    {:label => _("Partition Table"), :value => @record.customization_script_ptable_name}
  end

  def textual_configuration_script_group_properties
    %i[configuration_script_name
       configuration_script_region]
  end

  def textual_configuration_script_name
    {:label => _("Name"), :value => @record.name}
  end

  def textual_configuration_script_region
    {:label => _("Region"), :value => @record.region_description}
  end

  def textual_configuration_script_variables
    textual_variables(@record.variables)
  end

  def textual_configuration_script_survey
    textual_survey_group(@record.survey_spec['spec'])
  end

  def textual_configuration_script_group_os
    %i[configuration_script_medium
       configuration_script_partition_table]
  end

  def textual_survey_group(items)
    return unless items

    h = {:title     => _("Surveys"),
         :headers   => [_('Question Name'), _('Question Description'), _('Variable'),
                        _('Type'),  _('Min'), _('Max'), _('Default'), _('Required'), _('Choices')],
         :col_order => %w[question_name question_description variable type min max default required choices]}
    h[:value] = items.collect do |item|
      {
        :title                => item['index'],
        :question_name        => item['question_name'],
        :question_description => item['question_description'],
        :variable             => item['variable'],
        :type                 => item['type'],
        :min                  => item['min'],
        :max                  => item['max'],
        :default              => item['default'],
        :required             => item['required'],
        :choices              => item['choices']
      }
    end
    h
  end

  def textual_variables(vars)
    h = {:title     => _("Variables"),
         :headers   => [_('Name'), _('Value')],
         :col_order => %w[name value]}
    h[:value] = Array(vars).collect do |item|
      {
        :name  => item[0].to_s,
        :value => item[1].to_s
      }
    end
    h
  end

  def textual_group_smart_management
    TextualTags.new(_("Smart Management"), %i[tags])
  end
end
