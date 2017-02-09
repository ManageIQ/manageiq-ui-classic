TextualTable = Struct.new(:title, :rows, :labels) do
  def template
    'shared/summary/textual_table'
  end

  def locals
    {:title => title, :rows => rows, :labels => labels}
  end
end
