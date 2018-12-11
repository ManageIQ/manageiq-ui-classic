describe ManageIQ::Providers::StorageManagerDecorator do
  describe '#quadicon' do
    subject { model.decorate.quadicon }

    context 'block storage' do
      let(:model) { FactoryBot.create(:ems_cinder) }

      it 'includes cloud volumes and snapshots' do
        expect(subject[:top_left][:tooltip]).to include("Cloud Volume")
        expect(subject[:top_right][:tooltip]).to include("Cloud Volume Snapshot")
      end
    end

    context 'object storage' do
      let(:model) { FactoryBot.create(:ems_swift) }

      it 'includes cloud object store containers' do
        expect(subject[:top_left][:tooltip]).to include("Cloud Object Store Container")
      end
    end
  end
end
