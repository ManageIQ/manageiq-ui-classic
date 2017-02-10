TextualGroup = Struct.new(:title, :items) do
  def template
    'shared/summary/textual'
  end

  def locals
    {:title => title, :items => items}
  end
end
