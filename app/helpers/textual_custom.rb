TextualCustom = Struct.new(:title, :template_name, :items) do
  def template
    template_name
  end

  def locals
    {:title => title, :items => items}
  end
end
