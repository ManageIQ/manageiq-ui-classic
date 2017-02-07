module MiqAeClassHelper
  def editable_domain?(record)
    record.editable?
  end

  def git_enabled?(record)
    record.class == MiqAeDomain && record.git_enabled?
  end

  def add_read_only_suffix(node_string, editable, enabled)
    if enabled && !editable
      suffix = "Locked"
    elsif editable && !enabled
      suffix = "Disabled"
    else # !rec.enabled && !rec.editable?
      suffix = "Locked & Disabled"
    end
    "#{node_string} (#{suffix})".html_safe
  end

  def domain_display_name(domain)
    @record.fqname.split('/').first == domain.name ? "#{domain.name} (Same Domain)" : domain.name
  end

  def domain_display_name_using_name(record, current_domain_name)
    domain_name = record.domain.name
    if domain_name == current_domain_name
      return "#{domain_name} (Same Domain)", nil
    else
      return domain_name, record.id
    end
  end

  def record_name(rec)
    column   = rec.display_name.blank? ? :name : :display_name
    rec_name = if rec.kind_of?(MiqAeNamespace) && rec.domain?
                 editable_domain?(rec) && rec.enabled ? rec.send(column) : add_read_only_suffix(rec.send(column),
                                                                                                editable_domain?(rec),
                                                                                                rec.enabled)
               else
                 rec.send(column)
               end
    rec_name = rec_name.gsub(/\n/, "\\n")
    rec_name = rec_name.gsub(/\t/, "\\t")
    rec_name = rec_name.tr('"', "'")
    rec_name = ERB::Util.html_escape(rec_name)
    rec_name.gsub(/\\/, "&#92;")
  end

  def class_prefix(cls)
    case cls.to_s.split("::").last
    when "MiqAeClass"
      "aec"
    when "MiqAeDomain", "MiqAeNamespace"
      "aen"
    when "MiqAeInstance"
      "aei"
    when "MiqAeField"
      "Field"
    when "MiqAeMethod"
      "aem"
    end
  end

  def icon_class(cls)
    cls.to_s.split("::").last.underscore.sub('miq_', 'product product-')
  end

  def nonblank(*items)
    items.detect { |item| !item.blank? }
  end

  def ae_field_fonticon(field)
    case field
    when 'string'
      'product product-string'
    when 'symbol'
      'product product-symbol'
    when 'integer'
      'product product-integer'
    when 'float'
      'product product-float'
    when 'boolean'
      'product product-boolean'
    when 'time'
      'fa fa-clock-o'
    when 'array'
      'product product-array'
    when 'password'
      'product product-password'
    when 'null coalescing'
      'fa fa-question'
    when 'host'
      'pficon pficon-screen'
    when 'vm'
      'pficon pficon-virtual-machine'
    when 'storage'
      'fa fa-database'
    when 'ems'
      'pficon pficon-server'
    when 'policy'
      'fa fa-shield'
    when 'server'
      'pficon pficon-server'
    when 'request'
      'fa fa-question'
    when 'provision'
      'pficon pficon-settings'
    when 'user'
      'pficon pficon-user'
    when 'assertion'
      'product product-assertion'
    when 'attribute'
      'product product-attribute'
    when 'method'
      'product product-method'
    when 'relationship'
      'product product-relationship'
    when 'state'
      'product product-state'
    else
      raise NotImplementedError, "Missing fonticon for MiqAeField type #{field}"
    end
  end
end
