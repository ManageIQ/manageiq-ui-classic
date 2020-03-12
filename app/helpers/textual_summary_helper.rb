module TextualSummaryHelper
  def role_allows?(_options = {})
    raise NotImplementedError, _("role_allows? must be implemented in including class")
  end

  def textual_link(target, **opts, &blk)
    case target
    when ActiveRecord::Relation, Array
      textual_collection_link(target, **opts, &blk)
    else
      textual_object_link(target, **opts, &blk)
    end
  end

  def expand_textual_summary(summary, context)
    case summary
    when Hash
      summary
    when Symbol
      result = send("textual_#{summary}")
      return result if result.kind_of?(Hash) && result[:label]

      automatic_label = context.class.human_attribute_name(summary, :default => summary.to_s.titleize, :ui => true)

      case result
      when Hash
        result.dup.tap do |h|
          h[:label] = automatic_label
        end
      when ActiveRecord::Relation, ActiveRecord::Base
        textual_link(result, :label => automatic_label)
      when String, Integer, true, false, nil
        {:label => automatic_label, :value => result.to_s} if result.to_s.present?
      end
    when nil
      nil
    else
      raise "Unexpected summary type: #{summary.class}"
    end
  end

  def post_process_textual_summary(item)
    item[:hoverClass] = hover_class(item)
    item[:image] = image_url(item[:image]) if item[:image].present?
    item[:explorer] &&= @explorer
    item
  end

  def expand_textual_group(summaries, context = @record)
    Array.wrap(summaries)
         .map { |summary| expand_textual_summary(summary, context) }
         .compact
         .map { |summary| post_process_textual_summary(summary) }
  end

  def expand_generic_group(group_result, record)
    items = expand_textual_group(group_result.items, record)
    return nil if items.length.zero?

    locals = group_result.locals
    {
      :title     => locals[:title],
      :component => locals[:component],
      :items     => items,
    }
  end

  def process_textual_info(groups, record)
    groups.collect do |big_group|
      big_group.collect do |group_symbol|
        group_result = send("textual_group_#{group_symbol}")
        next if group_result.nil?

        locals = group_result.locals
        case locals[:component]
        when 'GenericGroup', 'TagGroup', 'OperationRanges'
          expand_generic_group(group_result, record)
        when 'SimpleTable', 'EmptyGroup', 'TableListView', 'MultilinkTable'
          locals
        else
          raise "Unexpected summary component: #{locals[:component]}"
        end
      end.compact
    end
  end

  def textual_tags_render_data(record)
    expand_generic_group(textual_group_smart_management, record)
  end

  def textual_key_value_group(items)
    res = items.collect { |item| {:label => item.name.to_s, :value => item.value.to_s} }
    res.sort_by { |k| k[:label] }
  end

  def textual_tags
    label = _("%{name} Tags") % {:name => session[:customer_name]}
    h = {:label => label}
    tags = session[:assigned_filters]
    if tags.blank?
      h[:icon] = "fa fa-tag"
      h[:value] = _("No %{label} have been assigned") % {:label => label}
    else
      h[:value] = tags.sort_by { |category, _assigned| category.downcase }
                      .collect do |category, assigned|
                        {:icon  => "fa fa-tag",
                         :label => category,
                         :value => assigned}
                      end
    end
    h
  end

  private

  def textual_object_link(object, as: nil, controller: nil, feature: nil, label: nil)
    return if object.nil?

    klass = as || ui_base_model(object.class)

    controller ||= controller_for_model(klass)
    feature ||= "#{controller}_show"

    label ||= ui_lookup(:model => klass.name)
    value = if block_given?
              yield object
            else
              object.name
            end

    h = {:label => label, :value => value}.merge(textual_object_icon(object, klass))

    if role_allows?(:feature => feature)
      h[:link] = if restful_routed?(object)
                   polymorphic_path(object)
                 else
                   url_for_only_path(:controller => controller,
                                     :action     => 'show',
                                     :id         => object)
                 end
      h[:title] = _("Show %{label} '%{value}'") % {:label => label, :value => value}
    end

    h
  end

  def textual_collection_link(collection, as: nil, controller_collection: nil, explorer: false, feature: nil, label: nil, link: nil)
    if collection.kind_of?(Array)
      unless as && link
        raise ArgumentError, ":as and :link are both required when linking to an array",
              caller.reject { |x| x =~ /^#{__FILE__}:/ }
      end
    end

    klass = as || ui_base_model(collection.klass)

    controller_collection ||= klass.name.underscore
    feature ||= "#{controller_collection}_show_list"

    label ||= ui_lookup(:models => klass.name)
    count = collection.count

    h = {:label => label, :value => count.to_s}.merge(textual_collection_icon(collection, klass))

    if count.positive? && role_allows?(:feature => feature)
      if link
        h[:link] = link
      elsif collection.respond_to?(:proxy_association)
        owner = collection.proxy_association.owner
        display = collection.proxy_association.reflection.name

        h[:link] = if restful_routed?(owner)
                     polymorphic_path(owner, :display => display)
                   else
                     url_for_only_path(:controller => controller_for_model(owner.class),
                                       :action     => 'show',
                                       :id         => owner,
                                       :display    => display)
                   end
      else
        h[:link] = url_for_only_path(:controller => controller_collection,
                                     :action     => 'list')
      end
      h[:title] = _("Show all %{label}") % {:label => label}
      h[:explorer] = true if explorer
    end

    h
  end

  def textual_object_icon(object, klass)
    icon = object.decorate.try(:fonticon)
    image = object.decorate.try(:fileicon)

    if icon || image
      {:icon => icon, :image => image}
    else
      textual_class_icon(klass)
    end
  end

  def textual_collection_icon(_collection, klass)
    textual_class_icon(klass)
  end

  def textual_class_icon(klass)
    decorated = klass.decorate
    {:icon => decorated.try(:fonticon), :image => decorated.try(:fileicon)}
  end

  def textual_authentications(authentications)
    return [{:label => _("Default Authentication"), :title => t = _("None"), :value => t}] if authentications.blank?

    authentications.collect do |auth|
      label = case auth[:authtype]
              when "default"           then _("Default")
              when "metrics"           then _("C & U Database")
              when "amqp"              then _("AMQP")
              when "console"           then _("VMRC Console")
              when "ipmi"              then _("IPMI")
              when "remote"            then _("Remote Login")
              when "smartstate_docker" then _("SmartState Docker")
              when "ws"                then _("Web Services")
              when "ssh_keypair"       then _("SSH Key Pair")
              else;                    _("<Unknown>")
              end

      {:label => _("%{label} Credentials") % {:label => label},
       :value => auth[:status] || _("None"),
       :title => auth[:status_details]}
    end
  end
end
