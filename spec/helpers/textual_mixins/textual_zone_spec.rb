describe TextualMixins::TextualZone do
  describe '#textual_zone' do
    before do
      assign(:record, ems)
    end

    let(:ems) { FactoryBot.create(:ems_vmware, :zone => Zone.default_zone) }
    subject { helper.textual_zone }

    context 'provider is enabled' do
      it 'returns with the default zone' do
        expect(subject).to match(a_hash_including(:value => ems.zone.name))
      end
    end

    context 'provider is disabled' do
      before { ems.pause! }

      it 'returns with the maintenance zone and with the backup zone in parentheses' do
        expect(subject).to match(a_hash_including(:value => "#{ems.zone.name} (originally in #{ems.zone_before_pause.name})"))
      end
    end
  end
end
