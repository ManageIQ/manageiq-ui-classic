describe ApplicationHelper::Toolbar::EmsNetworkCenter do
  let(:ems_network_vmdb)        { described_class.definition['ems_network_vmdb'] }
  let(:ems_network_vmdb_choice) { ems_network_vmdb.buttons.detect { |b| b[:id] == 'ems_network_vmdb_choice' } }

  describe 'Edit this Network Provider' do
    let(:button_hash)   { ems_network_vmdb_choice[:items].detect { |b| b[:id] == 'ems_network_edit' } }
    let(:button_klass)  { button_hash[:klass] }
    let(:button)        { button_klass.new(nil, nil, {}, {}) }
    let(:ems_nuage)     { FactoryGirl.create(:ems_nuage_network) }
    let(:ems_openstack) { FactoryGirl.create(:ems_openstack) }

    it 'appropriate button class' do
      expect(button_klass).to eq(ApplicationHelper::Button::EmsNetwork)
    end

    it 'visible for nuage provider' do
      button.instance_variable_set(:@record, ems_nuage)
      expect(button.visible?).to eq(true)
    end

    it 'not visible for openstack provider' do
      button.instance_variable_set(:@record, ems_openstack)
      expect(button.visible?).to eq(false)
    end
  end
end
