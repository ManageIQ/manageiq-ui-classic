TextualEmpty = Struct.new(:title, :text) do
  def locals
    {:title => title, :text => text, :component => 'EmptyGroup'}
  end
end
