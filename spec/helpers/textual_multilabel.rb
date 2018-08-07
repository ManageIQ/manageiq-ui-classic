describe TextualMultilabel do
  subject do
    TextualMultilabel.new(
      'Ports',
      :labels => ['Name', 'MAC Address'],
      :values => [['foobar', 'f0:0f:ec:be:6b:08']]
    )
  end

  context '#locals' do
    it 'contains a :rows key' do
      expect(subject.locals).to include(
        :title     => 'Ports',
        :rows      => [['foobar', 'f0:0f:ec:be:6b:08']],
        :labels    => ['Name', 'MAC Address'],
        :component => 'SimpleTable'
      )
    end
  end
end
