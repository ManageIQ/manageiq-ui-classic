module DatawarehouseNodeHelper::TextualSummary
  include TextualMixins::TextualName
  #
  # Groups
  #

  def textual_group_properties
    %i(name id hostname master disk_usage load)
  end

  def textual_group_relationships
    %i(ems)
  end

  #
  # Items
  #

  def missing_texutals?(mthd_name)
    match = /textual_(.*)/.match(mthd_name)
    if match && match.size > 1
      match[1]
    end
  end

  def respond_to_missing?(method_name, _include_private = false)
    !missing_texutals?(method_name).blank?
  end

  def method_missing(mthd_sym, *args, &bolck)
    prop = missing_texutals?(mthd_sym)
    if prop
      value = @record[prop] if @record.attribute_present?(prop)
      value = value.join(' ') if value.kind_of?(Array)
      {:label => _(prop.titlecase), :value => value}
    else
      super
    end
  end

  def textual_id
    @record.ems_ref
  end

  def textual_hostname
    "#{@record.host}%"
  end

  def textual_disk_usage
    {:label => _("Disk Usage"), :value => @record.disk}
  end
end
