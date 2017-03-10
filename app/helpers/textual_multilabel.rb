TextualMultilabel = Struct.new(:title, :options) do
  def template
    'shared/summary/textual_multilabel'
  end

  def locals
    options[:additional_table_class] ||= ''
    options.merge(:title => title)
  end
end
