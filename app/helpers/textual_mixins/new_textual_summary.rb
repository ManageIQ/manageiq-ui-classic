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
    @current_big_group = []
    if block_given?
      instance_eval &block
    end
    @big_groups.push @current_big_group
    remove_instance_variable :@current_big_group
  end

  # group
  def textual_group(name, condition: true, &block)
    if condition
      @current_group = []
      if block_given?
        instance_eval &block
      end
      @current_big_group.push TextualGroup.new(_(name), @current_group)
      remove_instance_variable :@current_group
    end
  end

  def function_textual_group(group_symbol)
    @current_big_group.push(group_symbol)
  end

  # field


  def textual_field(value:, label:, icon: nil, title: nil, link: nil, &block)
    @current_field = {:value => value, :label => label}.merge(
        {:icon => icon, :title => title, :link => link}.compact)

    if block_given? and not value.nil?
      instance_eval &block
    end

    @current_group.push({:value => display,
                         :label => label}.merge(
        {:icon => icon, :title => title, :link => link}.compact))
  end

  ##
  # @param show_condition whether to display the link
  def textual_field_link(link:, title:, show_condition: true)
    if show_condition
      @current_field[:link] = link
      @current_field[:title] = title
    end
  end

  def hash_textual_field(field_hash)
    @current_group.push(field_hash)
  end

  def function_textual_field(field_symbol)
    @current_group.push(field_symbol)
  end
end


module TextualMixins::NewTextualSummary
  def textual_summary(&block)
    context = TextualSummaryContext.new binding, @record
    context.instance_eval(&block)

    context.result
  end

end
