TextualTable = Struct.new(:title, :values, :labels) do
  def template
    'shared/summary/textual_table'
  end

  def locals
    {:title => self.title, :values => self.values, :labels => self.labels}
  end
end
