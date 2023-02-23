TextualMiqDataTable = Struct.new(:options) do
  def locals
    {:headers => options[:headers], :rows => options[:rows], :component => 'DataTable', :wide => options[:wide]}
  end
end
