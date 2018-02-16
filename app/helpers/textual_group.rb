TextualGroup = Struct.new(:title, :items) do
  def locals
    {:title => title, :items => items, :component => 'GenericGroup'}
  end
end
