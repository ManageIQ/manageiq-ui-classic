TextualMultilink = Struct.new(:title, :options) do
  def locals
    {:title => title, :items => options[:items], :component => 'MultilinkTable'}
  end
end
