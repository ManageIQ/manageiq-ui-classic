TextualListview = Struct.new(:title, :headers, :col_order, :value) do
  def locals
    {
      :title     => title,
      :headers   => headers,
      :colOrder  => col_order,
      :values    => value,
      :rowLabel  => _('View the table'),
      :component => 'TableListView',
    }
  end

  def self.new_from_hash(h)
    h ||= {:title => "Variables", :headers => ["Name", "Value"], :col_order => ["name", "value"], :value => []}
    new(*h.values_at(*members))
  end

  def self.data(h)
    new_from_hash(h).locals
  end
end
