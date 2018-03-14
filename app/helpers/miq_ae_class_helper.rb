module MiqAeClassHelper
  def editable_domain?(record)
    record.editable?
  end

  def git_enabled?(record)
    record.class == MiqAeDomain && record.git_enabled?
  end

  def add_read_only_suffix(node_string, editable, enabled)
    if enabled && !editable
      _("%{node_string} (Locked)") % {:node_string => node_string}
    elsif editable && !enabled
      _("%{node_string} (Disabled)") % {:node_string => node_string}
    else # !rec.enabled && !rec.editable?
      _("%{node_string} (Locked & Disabled)") % {:node_string => node_string}
    end
  end

  def domain_display_name(domain)
    @record.fqname.split('/').first == domain.name ? _("%{domain_name} (Same Domain)") % {:domain_name => domain.name} : domain.name
  end

  def domain_display_name_using_name(record, current_domain_name)
    domain_name = record.domain.name
    if domain_name == current_domain_name
      return _("%{domain_name} (Same Domain)") % {:domain_name => domain_name}, nil
    elsif !record.domain.enabled
      return _("%{domain_name} (Disabled)") % {:domain_name => domain_name}, record.id
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

  def nonblank(*items)
    items.detect { |item| !item.blank? }
  end

  def ae_field_fonticon(field)
    case field
    when 'string'
      'ff ff-string'
    when 'symbol'
      'ff ff-hexagon'
    when 'integer', 'fixnum'
      'ff ff-integer'
    when 'float'
      'ff ff-float'
    when 'boolean'
      'ff ff-boolean'
    when 'time'
      'fa fa-clock-o'
    when 'array'
      'ff ff-array'
    when 'password'
      'pficon pficon-key'
    when 'null coalescing', 'nil_class'
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
      'fa fa-comment-o'
    when 'attribute'
      'ff ff-attribute'
    when 'method'
      'ff ff-method'
    when 'relationship'
      'ff ff-relationship'
    when 'state'
      'ff ff-state'
    when 'element'
      'ff ff-element'
    when 'hash'
      'fa fa-hashtag'
    when 'key'
      'pficon pficon-key'
    else
      Rails.logger.warn("Missing fonticon for MiqAeField type \"#{field}\"")
      'fa fa-file-text-o'
    end
  end

  def state_class?(cls_id)
    MiqAeClass.find_by(:id => cls_id).state_machine?
  end
end
