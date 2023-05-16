describe PersistentVolumeHelper::TextualSummary do
  describe ".textual_group_properties" do
    before do
      login_as FactoryBot.create(:user)
    end

    let(:ems) { FactoryBot.create(:ems_openshift) }
    subject { textual_group_properties }
    it 'produces capacity data in the correct format' do
      @record = PersistentVolume.create(:parent => ems, :name => 'Test Volume', :capacity => {:storage => 123_456_789, :foo => 'something'})
      expect(subject).to be_kind_of(Struct)
    end
  end

  describe ".textual_group_capacity" do
    before do
      login_as FactoryBot.create(:user)
    end

    let(:ems) { FactoryBot.create(:ems_openshift) }
    subject { textual_group_capacity }
    it 'produces capacity data in the correct format' do
      @record = PersistentVolume.create(:parent => ems, :name => 'Test Volume', :capacity => {:storage => 123_456_789, :foo => 'something'})
      expect(subject).to be_kind_of(TextualMultilabel)
      expect(subject.title).to eq('Capacity')
      expect(subject.options[:values]).to include(%w[storage 123456789], %w[foo something])
    end
  end

  context "#textual_groups" do
    before do
      instance_variable_set(:@record, FactoryBot.create(:persistent_volume))
      allow(@record).to receive(:persistent_volume_claim).and_return(true)
    end

    include_examples "textual_group", "Relationships", %i[parent pods_using_persistent_volume custom_button_events]

    include_examples "textual_group_smart_management"

    include_examples "textual_group", "Volume Claim", %i[claim_name claim_creation_timestamp desired_access_modes], "claim_properties"
  end
end
