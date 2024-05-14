TextualTable = Struct.new(:title, :rows, :labels, :className) do
  def locals
    {:title => title, :rows => rows, :labels => labels, :component => 'SimpleTable', :className => className}
  end
end
