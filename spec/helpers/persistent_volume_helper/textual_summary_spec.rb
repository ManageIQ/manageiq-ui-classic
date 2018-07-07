describe PersistentVolumeHelper::TextualSummary do
  describe ".textual_group_properties" do
    before do
      login_as FactoryGirl.create(:user)
    end

    let(:ems) { FactoryGirl.create(:ems_openshift) }
    subject { textual_group_properties }
    it 'produces capacity data in the correct format' do
      @record = PersistentVolume.create(:parent => ems, :name => 'Test Volume', :capacity => {:storage => 123_456_789, :foo => 'something'})
      expect(subject).to be_kind_of(Struct)
    end
  end

  describe ".textual_group_capacity" do
    before do
      login_as FactoryGirl.create(:user)
    end

    let(:ems) { FactoryGirl.create(:ems_openshift) }
    subject { textual_group_capacity }
    it 'produces capacity data in the correct format' do
      @record = PersistentVolume.create(:parent => ems, :name => 'Test Volume', :capacity => {:storage => 123_456_789, :foo => 'something'})
      expect(subject).to be_kind_of(TextualMultilabel)
      expect(subject.title).to eq('Capacity')
      expect(subject.options[:values]).to include(%w(storage 123456789), %w(foo something))
    end
  end
end
