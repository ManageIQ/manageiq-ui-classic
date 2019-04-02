TextualTable = Struct.new(:title, :rows, :labels) do
  def locals
    {:title => title, :rows => rows, :labels => labels, :component => 'SimpleTable'}
  end
end
