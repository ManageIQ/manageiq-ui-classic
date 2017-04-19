module MiddlewareServerHelper::TextualSummary
  #
  # Groups
  #

  def textual_group_properties
    TextualGroup.new(_("Properties"), %i(name hostname feed bind_addr server_state product version))
  end

  def textual_group_relationships
    # Order of items should be from parent to child
    TextualGroup.new(
      _("Relationships"),
      %i(ems middleware_server_group middleware_deployments middleware_datasources lives_on middleware_messagings)
    )
  end

  #
  # Items
  #
  def textual_hostname
    if not_yet_started?(@record) && @record.hostname.nil?
      _('not yet available')
    else
      @record.hostname
    end
  end

  def textual_feed
    @record.feed
  end

  def textual_bind_addr
    address = if not_yet_started?(@record) && @record.properties['Bound Address'].nil?
                _('not yet available')
              else
                @record.properties['Bound Address']
              end
    {
      :label => _('Bind Address'),
      :value => address
    }
  end

  def textual_server_state
    {
      :label => _('Server State'),
      :value => (@record.properties['Calculated Server State'] || @record.properties['Server State']).to_s.capitalize
    }
  end

  def textual_product
    if not_yet_started?(@record) && @record.product.nil?
      _('not yet available')
    else
      @record.product
    end
  end

  def textual_version
    @record.properties['Version']
  end

  def textual_lives_on
    lives_on = @record.try(:lives_on)
    lives_on_ems = lives_on.try(:ext_management_system)
    return nil if lives_on_ems.nil?

    if lives_on.kind_of?(Container)
      lives_on_entity_name = _("Underlying Container")
      lives_on_controller_name = 'container'
    else
      lives_on_entity_name = _("Underlying Virtual Machine")
      lives_on_controller_name = 'vm_or_template'
    end

    {
      :label => lives_on_entity_name,
      :image => "svg/vendor-#{lives_on_ems.image_name}.svg",
      :value => @record.lives_on.name.to_s,
      :link  => url_for_only_path(
        :action     => 'show',
        :controller => lives_on_controller_name,
        :id         => @record.lives_on.id
      )
    }
  end

  def not_yet_started?(server)
    # domain server case when it hasn't been started yet (it has auto-start flag set to false)
    !server.middleware_server_group.nil? && server.properties['Server State'] == 'STOPPED'
  end
end
