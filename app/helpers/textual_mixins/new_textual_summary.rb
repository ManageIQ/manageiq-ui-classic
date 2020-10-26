class BaseContext
  def initialize(context_bind, record)
    @bind_obj = context_bind
    @record = record
  end

  def method_missing(m, *args, &block)
    @bind_obj.receiver.__send__(m, *args, &block)
  end

  def result

  end
end

class TextualSummaryContext < BaseContext
  include TextualSummaryHelper
  include StiRoutingHelper
  include ApplicationHelper
  include ActionView::RoutingUrlFor

  def initialize(context_bind, record)
    super
    @big_groups = []
  end

  def result
    @big_groups
  end

  # big group
  def textual_big_group(&block)
    big_group_context = TextualBigGroupContext.new(@bind_obj, @record)
    if block_given?
      big_group_context.instance_eval &block
    end
    @big_groups.push big_group_context.result
  end


end

class TextualBigGroupContext < BaseContext
  def initialize(context_bind, record)
    super
    @groups = []
  end

  def result
    @groups
  end

  def textual_group(name, condition: true, &block)
    if condition
      textual_group_context = TextualGroupContext.new @bind_obj, @record, name
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
  def initialize(context_bind, record, name)
    super context_bind, record
    @name = name
    @fields = []
  end

  def result
    TextualGroup.new(_(@name), @fields)
  end

  def hash_textual_field(field_hash)
    @fields.push(field_hash)
  end

  def function_textual_field(field_symbol)
    @fields.push(field_symbol)
  end

  def textual_field(value:, label:, icon: nil, title: nil, link: nil, &block)
    textual_field_context = TextualFieldContext.new(@bind_obj, @record, :value => value, :label => label,
                                                    :icon => icon, :title => title, :link => link)

    if block_given? and not value.nil?
      textual_field_context.instance_eval &block
    end

    @fields.push(textual_field_context.result)
  end
end

class TextualFieldContext < BaseContext
  def initialize(context_bind, record, value:, label:, icon: nil, title: nil, link: nil, &block)
    super context_bind, record
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
    context = TextualSummaryContext.new binding, @record
    context.instance_eval(&block)

    context.result
  end

end
