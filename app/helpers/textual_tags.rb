TextualTags  = Struct.new(:title, :items) do
  def template
    'shared/summary/textual_tags'
  end

  def locals
    {:title => self.title, :items => self.items}
  end
end

