TextualTable = Struct.new(:title, :values, :labels) do
  def template
    'shared/summary/textual_table'
  end

  def locals
    {:title => title, :values => values, :labels => labels}
  end
end
