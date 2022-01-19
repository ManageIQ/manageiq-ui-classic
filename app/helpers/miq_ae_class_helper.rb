module MiqAeClassHelper
  DATASTORE_TYPES = {
    :list => 'ns_list', :details => 'ns_details', :instances => 'class_instances', :methods => 'class_methods',
    :domain => 'domain_overrides', :schema => 'class_fields', :fields => 'instant_fields'
  }.freeze

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
                 editable_domain?(rec) && rec.enabled ? rec.send(column) : add_read_only_suffix(rec.send(column), editable_domain?(rec), rec.enabled)
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
    items.detect(&:present?)
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
      'pficon pficon-container-node'
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

  def location_fancy_name(location)
    case location
    when 'builtin'
      _('Built-in')
    when 'playbook'
      _('Playbook')
    when 'inline'
      _('Inline')
    when 'expression'
      _('Expression')
    when 'ansible_job_template'
      _('Ansible Tower Job Template')
    when 'ansible_workflow_template'
      _('Ansible Tower Workflow Template')
    else
      location
    end
  end

  def playbook_label(location)
    case location
    when 'playbook'
      _('Playbook')
    when 'ansible_job_template'
      _('Job Template')
    when 'ansible_workflow_template'
      _('Workflow Template')
    else
      location
    end
  end

  def available_locations_with_labels
    MiqAeMethod.available_locations.sort.map { |l| [location_fancy_name(l), l] }
  end

  def default_datastore_data(record, cells)
    {:id => record.id.to_s, :clickId => "#{class_prefix(record.class)}-#{record.id}", :clickable => true, :cells => cells}
  end

  def ns_list_data(grid_data)
    has_options = User.current_user.super_admin_user?
    datastore_options(has_options)
    grid_data.each do |record|
      next if record.name == '$'

      cells = []
      cells.push({:is_checkbox => true})
      if record.git_enabled?
        cells.push({:image => 'svg/ae_git_domain.svg'})
      elsif record.name == MiqAeDatastore::MANAGEIQ_DOMAIN
        cells.push({:icon => 'ff ff-manageiq'})
      elsif record.top_level_namespace
        cells.push({:image => "svg/vendor-#{record.top_level_namespace.downcase}.svg"})
      else
        cells.push({:icon => 'fa fa-globe', :type => 'i'})
      end
      cells.push({:text => record_name(record)})
      cells.push({:text => record.description})
      cells.push({:text => record.enabled})
      cells.push({:text => record.tenant.name}) if has_options
      data = default_datastore_data(record, cells)
      push_data(data)
    end
  end

  def common_list_data(details_data)
    details_data.each do |record|
      next if record.name == '$'

      cells = []
      cells.push({:is_checkbox => true})
      if record.decorate.try(:fileicon)
        cells.push({:image => ActionController::Base.helpers.image_path(record.decorate.fileicon)})
      else
        cells.push({:icon => record.decorate.fonticon, :type => 'i'})
      end
      cells.push({:text => record_name(record)})
      data = default_datastore_data(record, cells)
      push_data(data)
    end
  end

  def domain_overrides_data(domain_data)
    domain_data.each do |name, id|
      cells = []
      cells.push({:text => name})
      if id
        push_data({:id => id.to_s, :clickId => "#{domain_data[:prefix]}-#{id}", :clickable => true, :cells => cells})
      else
        push_data({:id => '', :clickable => false, :cells => cells})
      end
    end
  end

  def schema_data(schema_data)
    schema_items = ["name", "description", "default_value", "collect", "message", "on_entry", "on_exit", "on_error", "max_retries", "max_time"]
    schema_data.each_with_index do |ae_field, index|
      cells = []
      icon = ae_field.substitute ? "pficon pficon-ok" : "pficon pficon-close"
      schema_items.each do |fname|
        case fname
        when 'name'
          multiple_icons = [ae_field_fonticon(ae_field.aetype)]
          if ae_field.datatype.present? && ae_field.datatype != "string"
            multiple_icons.push(ae_field_fonticon(ae_field.datatype))
          end
          multiple_icons.push(icon)
          cells.push({:icon => multiple_icons, :text => "#{ae_field.display_name} (#{ae_field.name})"})
        when 'default_value'
          cells.push({:text => ae_field.datatype == "password" ? "********" : ae_field.send(fname)})
        else
          cells.push({:text => ae_field.send(fname)})
        end
      end
      push_data({:id => index.to_s, :clickable => false, :cells => cells})
    end
  end

  def class_field_data(field_data)
    has_options = state_class?(field_data[:record].class_id)
    datastore_options(has_options)
    field_data[:fields].each_with_index do |field, index|
      cells = []
      ae_value = field.ae_values.find_or_initialize_by(:instance_id => field_data[:record].id, :field_id => field.id)
      multiple_icons = [ae_field_fonticon(field.aetype)]
      unless field.datatype.blank? || field.datatype == 'string'
        multiple_icons.push(ae_field_fonticon(field.datatype))
      end
      multiple_icons.push("pficon-ok#{field.substitute ? '' : '-closed'}")
      cells.push({:icon => multiple_icons, :text => record_name(field)})
      cells.push({:text => field.datatype == 'password' ? '********' : nonblank(ae_value.value, field.default_value)})
      if has_options
        cells.push({:text => nonblank(ae_value.on_entry, field.on_entry)})
        cells.push({:text => nonblank(ae_value.on_exit, field.on_exit)})
        cells.push({:text => nonblank(ae_value.on_error, field.on_error)})
        cells.push({:text => nonblank(ae_value.max_retries, field.max_retries)})
        cells.push({:text => nonblank(ae_value.max_time, field.max_time)})
      end
      cells.push({:text => nonblank(ae_value.collect, field.collect)})
      cells.push({:text => field.message})
      push_data({:id => index.to_s, :clickable => false, :cells => cells})
    end
  end

  def class_properties_data(name, record)
    data = {:title => _("Properties"), :mode => "class_props"}
    rows = [
      {:label => _('Fully Qualified Name'), :value => h(name)},
      {:label => _('Name'), :value => record.name},
      {:label => _('Display Name'), :value => record.display_name},
      {:label => _('Description'), :value => record.try(:description)},
      {:label => _('Instances'), :value => h(record.ae_instances.length)},
    ]
    data[:rows] = rows
    miq_structured_list(data)
  end

  def push_data(data)
    @initial_data.push(data)
  end

  def datastore_options(option)
    @has_options = option
  end

  def datastore_data(type, data)
    @initial_data = []
    case type
    when DATASTORE_TYPES[:list]
      ns_list_data(data)
    when DATASTORE_TYPES[:details], DATASTORE_TYPES[:instances], DATASTORE_TYPES[:methods]
      common_list_data(data)
    when DATASTORE_TYPES[:domain]
      domain_overrides_data(data)
    when DATASTORE_TYPES[:schema]
      schema_data(data)
    when DATASTORE_TYPES[:fields]
      class_field_data(data)
    end
  end
end
