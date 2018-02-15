describe ApplicationHelper::Toolbar::EmsNetworksCenter do
  let(:ems_network_vmdb)        { described_class.definition['ems_network_vmdb'] }
  let(:ems_network_vmdb_choice) { ems_network_vmdb.buttons.detect { |b| b[:id] == 'ems_network_vmdb_choice' } }

  describe 'Add a New Network Provider' do
    let(:button_hash)   { ems_network_vmdb_choice[:items].detect { |b| b[:id] == 'ems_network_new' } }
    let(:button_klass)  { button_hash[:klass] }
    let(:button)        { button_klass.new(nil, nil, {}, {}) }

    it 'appropriate button class' do
      expect(button_klass).to eq(ApplicationHelper::Button::EmsNetworkNew)
    end

    it 'visible when nuage provider enabled' do
      allow(::Settings.product).to receive(:nuage).and_return(true)
      expect(button.visible?).to eq(true)
    end

    it 'hidden when nuage provider disabled' do
      allow(::Settings.product).to receive(:nuage).and_return(false)
      expect(button.visible?).to eq(false)
    end
  end
end
