class BaseContext
  def initialize(record)
    @record = record
  end

  def result

  end
end


class TextualSummaryContext < BaseContext
  include TextualSummaryHelper
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

  # big group
  def textual_big_group(&block)
    big_group_context = TextualBigGroupContext.new(@record)
    if block_given?
      big_group_context.instance_eval &block
    end
    @big_groups.push big_group_context.result
  end
end


class TextualBigGroupContext < BaseContext
  def initialize(record)
    super
    @groups = []
  end

  def result
    @groups
  end

  def textual_group(name, condition: true, &block)
    if condition
      textual_group_context = TextualGroupContext.new @record, name
      if block_given?
        textual_group_context.instance_eval &block
      end
      @groups.push textual_group_context.result
    end
  end

  def function_textual_group(group_symbol)
    @groups.push(group_symbol)
  end
end


class TextualGroupContext < BaseContext
  def initialize(record, name)
    super record
    @name = name
    @fields = []
  end

  def result
    TextualGroup.new(_(@name), @fields)
  end

  def hash_textual_field(condition= true, &block)
    if condition
      @fields.push instance_eval &block
    end
  end

  def function_textual_field(field_symbol)
    @fields.push(field_symbol)
  end

  def textual_field(value:, label:, icon: nil, title: nil, link: nil, &block)
    textual_field_context = TextualFieldContext.new(@record, :value => value, :label => label,
                                                    :icon => icon, :title => title, :link => link)

    if block_given? and not value.nil?
      textual_field_context.instance_eval &block
      @fields.push(textual_field_context.result)
    end
  end
end

class TextualFieldContext < BaseContext
  def initialize(record, value:, label:, icon: nil, title: nil, link: nil, &block)
    super record
    @field_hash = {:value => value, :label => label}.merge(
        {:icon => icon, :title => title, :link => link}.compact)
  end

  def result
    @field_hash
  end

  ##
  # @param show_condition whether to display the link
  def textual_field_link(link:, title:, show_condition: true)
    if show_condition
      @field_hash[:link] = link
      @field_hash[:title] = title
    end
  end
end

module TextualMixins::NewTextualSummary
  def textual_summary(&block)
    receiver = binding.receiver
    delegated_methods = []
    (receiver.methods - BaseContext.instance_methods).each do |method_symbol|
      delegated_methods.push method_symbol
      l_ = ->(*args, &block) { receiver.__send__(method_symbol, *args, &block) }
      BaseContext.define_method method_symbol, l_
    end

    context = TextualSummaryContext.new @record
    context.instance_eval(&block)

    delegated_methods.each { |method_symbol| BaseContext.undef_method(method_symbol) }

    context.result
  end
end
