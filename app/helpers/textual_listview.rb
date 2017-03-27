TextualListview = Struct.new(:title, :headers, :col_order, :value) do
  def template
    'shared/summary/textual_listview'
  end

  def locals
    {:title => title, :headers => headers, :col_order => col_order, :value => value}
  end

  def self.new_from_hash(h)
    new(*h.values_at(*members))
  end
end
