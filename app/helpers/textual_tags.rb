TextualTags = Struct.new(:title, :items) do
  def locals
    {:title => title, :items => items, :component => 'TagGroup'}
  end
end
