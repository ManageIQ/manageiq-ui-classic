describe Quadicons, :type => :helper do
  let(:kontext) { Quadicons::Context.new(helper) }

  context "when record has a simple class" do
    let(:record) { Host.new }

    it 'determines the correct name for a class' do
      expect(Quadicons.klass_for(record)).to eq Quadicons::HostQuadicon
    end

    it 'returns a new instance of an appropriate Quadicon presenter' do
      expect(Quadicons.for(record, kontext)).to be_an_instance_of Quadicons::HostQuadicon
    end
  end

  context "when record is a namespaced class" do
    let(:record) { ManageIQ::Providers::Openstack::InfraManager::Host.new }

    it 'determines the correct name for a class' do
      expect(Quadicons.klass_for(record)).to eq Quadicons::HostQuadicon
    end

    it 'returns a new instance of an appropriate Quadicon presenter' do
      expect(Quadicons.for(record, kontext)).to be_an_instance_of Quadicons::HostQuadicon
    end
  end
end
