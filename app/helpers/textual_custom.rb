TextualCustom = Struct.new(:title, :template_name, :items) do
  def template
    self.template_name
  end

  def locals
    {:title => self.title, :items => self.items}
  end
end
