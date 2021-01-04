module OpsHelper::TextualSummary
  #
  # Groups
  #

  TOP_TABLES_BY_COUNT = 5

  def textual_group_properties
    TextualTags.new(_('Properties'), %i[description parent groups subtenant project])
  end

  def textual_group_relationships
    TextualGroup.new(_('Relationships'), %i[catalog_items automate_domains providers])
  end

  def textual_group_smart_management
    TextualTags.new(_("Smart Management"), %i[tags])
  end

  def textual_group_vmdb_tables_most_rows
    return if @record.nil?

    TextualListview.new_from_hash(textual_vmdb_tables_most_rows)
  end

  def textual_group_vmdb_tables_largest_size
    return if @record.nil?

    TextualListview.new_from_hash(textual_vmdb_tables_largest_size)
  end

  def textual_group_vmdb_tables_most_wasted_space
    return if @record.nil?

    TextualListview.new_from_hash(textual_vmdb_tables_most_wasted_space)
  end

  #
  # Items
  #
  def textual_description
    {:label => _('Description'), :value => @record.description}
  end

  def textual_parent
    parent = @record.parent
    return nil unless parent&.allowed?

    {
      :label    => _('Parent'),
      :explorer => true,
      :value    => parent.name,
      :title    => _('View Parent Tenant'),
      :link     => url_for_only_path(:controller => 'ops', :action => 'tree_select', :id => "tn-#{parent.id}")
    }
  end

  def textual_groups
    return nil if @record.miq_groups.non_tenant_groups.blank?

    {:label => _('Groups'), :value => groups_from_record}
  end

  def textual_subtenant
    return nil if @record.all_subtenants.blank?

    {:label => _('Child Tenants'), :value => subtenants_from_record}
  end

  def textual_project
    return nil if @record.all_subprojects.blank?

    {:label => _('Projects'), :value => subprojects_from_record}
  end

  def textual_catalog_items
    cat_items_num = ServiceTemplate.with_tenant(@record.id).count # Number of relevant Catalog Items and Bundles
    cat_items = {:label => _('Catalog Items and Bundles'),
                 :value => cat_items_num,
                 :icon  => 'ff ff-group'}

    if cat_items_num.positive?
      cat_items[:link] = url_for_only_path(:action => 'show', :id => @record.id, :display => 'service_templates')
      cat_items[:title] = _('View the list of relevant Catalog Items and Bundles')
      cat_items[:explorer] = true
    end

    cat_items
  end

  def textual_automate_domains
    aedomains_num = MiqAeDomain.with_tenant(@record.id).count # Number of relevant Automate Domains
    aedomains = {:label => _('Automate Domains'),
                 :value => aedomains_num,
                 :icon  => 'ff ff-group'}

    if aedomains_num.positive?
      aedomains[:link] = url_for_only_path(:action => 'show', :id => @record.id, :display => 'ae_namespaces')
      aedomains[:title] = _('View the list of relevant Automate Domains')
      aedomains[:explorer] = true
    end

    aedomains
  end

  def textual_providers
    providers_num = ExtManagementSystem.with_tenant(@record.id).count # Number of relevant Providers
    providers = {:label => _('Providers'),
                 :value => providers_num,
                 :icon  => 'ff ff-group'}

    if providers_num.positive?
      providers[:link] = url_for_only_path(:action => 'show', :id => @record.id, :display => 'providers')
      providers[:title] = _('View the list of relevant Providers')
      providers[:explorer] = true
    end

    providers
  end

  def groups_from_record
    record_groups = []
    @record.miq_groups.non_tenant_groups.sort_by { |group| group.name.downcase }.each do |g|
      if role_allows?(:feature => "rbac_group_show")
        record_groups.push(
          :value    => g.name,
          :title    => _("Click to view %{name} Group") % {:name => g.name},
          :explorer => true,
          :link     => url_for_only_path(:controller => 'ops', :action => 'tree_select', :id => "g-#{g.id}")
        )
      else
        record_groups.push(:value => g.name)
      end
    end
    record_groups
  end

  def subtenants_from_record
    subtenants = []
    @record.all_subtenants.sort_by { |t| t.name.downcase }.each do |tenant|
      subtenants.push(
        :value    => tenant.name,
        :title    => _("Click to view %{name} Tenant") % {:name => tenant.name},
        :explorer => true,
        :link     => url_for_only_path(:controller => 'ops', :action => 'tree_select', :id => "tn-#{tenant.id}")
      )
    end
    subtenants
  end

  def subprojects_from_record
    subprojects = []
    @record.all_subprojects.sort_by { |proj| proj.name.downcase }.each do |project|
      subprojects.push(
        :value    => project.name,
        :title    => _("Click to view %{name} TenantProject") % {:name => project.name},
        :explorer => true,
        :link     => url_for_only_path(:controller => 'ops', :action => 'tree_select', :id => "tn-#{project.id}")
      )
    end
    subprojects
  end

  def textual_tenant_quota_allocations
    h = {:title     => _("Tenant Quota"),
         :headers   => [_("Name"), _("Total Quota"), _("In Use"), _("Allocated"), _("Available")],
         :col_order => %w[name total in_use allocated available]}
    h[:value] = get_tenant_quota_allocations
    h
  end

  def self.convert_to_format(format, text_modifier, value)
    fmt_value = case format.to_s
                when "general_number_precision_0"
                  value.to_i
                when "gigabytes_human"
                  (value.to_f / 1.0.gigabyte).round(1)
                else
                  value.to_f
                end
    "#{fmt_value} #{text_modifier}"
  end

  def convert_to_format_with_default_text(format, text_modifier, value, metric)
    is_zero_value = value.nil? || value.zero?
    can_display_default_text = !TenantQuota.default_text_for(metric).nil?

    if is_zero_value && can_display_default_text
      return TenantQuota.default_text_for(metric)
    end

    OpsHelper::TextualSummary.convert_to_format(format, text_modifier, value)
  end

  def get_tenant_quota_allocations
    rows = @record.combined_quotas.values.to_a
    rows.collect do |row|
      {
        :title     => row[:description],
        :name      => row[:description],
        :in_use    => convert_to_format_with_default_text(row[:format], row[:text_modifier], row[:used], :in_use),
        :allocated => convert_to_format_with_default_text(row[:format], row[:text_modifier], row[:allocated],
                                                          :allocated),
        :available => convert_to_format_with_default_text(row[:format], row[:text_modifier], row[:available],
                                                          :available),
        :total     => convert_to_format_with_default_text(row[:format], row[:text_modifier], row[:value], :total),
        :explorer  => true
      }
    end
  end
end
