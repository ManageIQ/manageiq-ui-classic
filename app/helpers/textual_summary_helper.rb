##
# Base class for the textual summary DSL contexts.
class BaseContext
  def initialize(record)
    @record = record
  end

  def result
  end
end

##
# Top level context for textual summary DSL that provides top level DSL commands
class TextualSummaryContext < BaseContext
  include StiRoutingHelper
  include ApplicationHelper
  include ActionView::RoutingUrlFor

  def initialize(record)
    super
    @big_groups = []
  end

  def result
    @big_groups
  end

  ##
  # Textual summary DSL command to create a new big group.
  # Big groups can contain regular textual_groups.
  # @param block can run commands from TextualBigGroupContext.
  def textual_big_group(&block)
    big_group_context = TextualBigGroupContext.new(@record)
    if block_given?
      big_group_context.instance_eval(&block)
    end
    @big_groups.push(big_group_context.result)
  end
end

##
# Textual summary DSL context for big-groups. Provides DSL commands that work in big-groups.
class TextualBigGroupContext < BaseContext
  def initialize(record)
    super
    @groups = []
  end

  def result
    @groups
  end

  ##
  # Textual summary DSL command to create a textual-group in a big-group.
  # @param block can run commands from TextualGroupContext
  def textual_group(name, condition: true, &block)
    if condition
      textual_group_context = TextualGroupContext.new(@record, name)
      if block_given?
        textual_group_context.instance_eval(&block)
      end
      @groups.push(textual_group_context.result)
    end
  end

  ##
  # Textual summary DSL command to use a group method that was defined somewhere else
  # Find a function, run it, and add its results to the big-group.
  # @param group_symbol will look for a function called "textual_group_#{group_symbol}"
  def function_textual_group(group_symbol)
    @groups.push(group_symbol)
  end
end

##
# Textual summary DSL context for textual-groups.
class TextualGroupContext < BaseContext
  def initialize(record, name)
    super(record)
    @name = name
    @fields = []
  end

  def result
    TextualGroup.new(_(@name), @fields)
  end

  ##
  # Add a new field to the group, represented by a hash
  # @param block Needs to return a hash that's aligned to how we represent fields
  # @param condition If this is false, the field won't be added.
  def hash_textual_field(condition = true, &block)
    if condition
      @fields.push(instance_eval(&block))
    end
  end

  ##
  # Find a function and add its result as a new field in the group.
  # @param field_symbol The suffix of the function to find "textual_#{field_symbol}"
  def function_textual_field(field_symbol)
    @fields.push(field_symbol)
  end

  ##
  # Add a new field to the textual group
  # @param value what to display. If nil, the entire field will be omitted
  # @param link a URI to turn the field into a clickable hyperlink.
  # @param title if the field is a link, this will be the link's title
  # @param block can run commands from TextualFieldContext
  def textual_field(value:, label:, icon: nil, title: nil, link: nil, &block)
    textual_field_context = TextualFieldContext.new(@record, :value => value, :label => label,
                                                    :icon => icon, :title => title, :link => link)

    if block_given? && value.present?
      textual_field_context.instance_eval(&block)
      @fields.push(textual_field_context.result)
    end
  end
end

##
# Textual summary DSL context for textual-fields
class TextualFieldContext < BaseContext
  def initialize(record, value:, label:, icon: nil, title: nil, link: nil)
    super(record)
    @field_hash = {:value => value, :label => label}.merge(
      {:icon => icon, :title => title, :link => link}.compact
    )
  end

  def result
    @field_hash
  end

  ##
  # Turn the field into a a clickable hyperlink. Only needed if you want to use the condition argument.
  # Otherwise you can add these directly from the textual_field() method.
  #
  # @param condition whether to display the link
  # @param link a URI to turn the field into a clickable hyperlink.
  # @param title if the field is a link, this will be the link's title
  def textual_field_link(link:, title:, condition: true)
    if condition
      @field_hash[:link] = link
      @field_hash[:title] = title
    end
  end
end

module TextualSummaryHelper
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
        case group_symbol
        when Symbol
          group_result = send("textual_group_#{group_symbol}")
          next if group_result.nil?
        when TextualGroup
          group_result = group_symbol
        else
          raise "groups_symbol needs to be either a symbol or a TextualGroup. Instead got #{group_symbol}"
        end

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

  def process_flash_messages(methods)
    methods.collect do |method|
      send("flash_#{method}")
    end.compact
  end

  ##
  # Generate a context for textual summary DSL.
  # @return a textual summary ready to use.
  def textual_summary(&block)
    receiver = binding.receiver
    delegated_methods = []
    (receiver.methods - BaseContext.instance_methods).each do |method_symbol|
      delegated_methods.push(method_symbol)
      l_ = ->(*args, &l_block) { receiver.__send__(method_symbol, *args, &l_block) }
      BaseContext.define_method(method_symbol, l_)
    end

    context = TextualSummaryContext.new(@record)
    context.instance_eval(&block)

    delegated_methods.each { |method_symbol| BaseContext.remove_method(method_symbol) }

    context.result
  end
end
