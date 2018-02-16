TextualCustom = Struct.new(:title, :component_name, :items) do
  def locals
    {:title => title, :items => items, :component => component_name}
  end
end
