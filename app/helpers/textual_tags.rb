TextualTags = Struct.new(:title, :items) do
  def template
    'shared/summary/textual_tags'
  end

  def locals
    {:title => title, :items => items}
  end
end
