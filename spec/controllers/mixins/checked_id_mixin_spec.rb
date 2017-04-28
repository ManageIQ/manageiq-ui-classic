describe Mixins::CheckedIdMixin do
  describe '#find_records_with_rbac' do
    # include tested mixin
    let(:mixin) { Object.new.tap { |s| s.singleton_class.send(:include, described_class) } }
    # create user, user role and group
    let(:user_role) { FactoryGirl.create(:miq_user_role) }
    let(:group) { FactoryGirl.create(:miq_group, :miq_user_role => user_role) }
    let(:current_user) { FactoryGirl.create(:user, :miq_groups => [group]) }
    before :each do
      allow(mixin).to receive(:current_user).and_return(current_user)
      allow(current_user).to receive(:get_timezone).and_return("Prague")
    end
    # create records
    before :each do
      @vm_1 = FactoryGirl.create(:vm_or_template, :id => 1000000000001)
      @vm_2 = FactoryGirl.create(:vm_or_template, :id => 1000000000002)
      @vm_3 = FactoryGirl.create(:vm_or_template, :id => 1000000000003)
    end

    subject { mixin.send(:find_records_with_rbac, model, id) }

    context 'when single record is checked in show list' do
      let(:model) { VmOrTemplate }
      let(:id) { [1000000000001] }
      it { is_expected.to eq([@vm_1]) }
    end

    context 'when multiple records are checked in show list' do
      let(:model) { VmOrTemplate }
      let(:id) { [1000000000001, 1000000000002] }
      it { is_expected.to eq([@vm_1, @vm_2]) }
    end

    context 'when user is not authorized to access the record' do
      before { allow(Rbac).to receive(:filtered).and_return([@vm_1, @vm_2]) }
      let(:model) { VmOrTemplate }
      let(:id) { [1000000000001, 1000000000002, 1000000000003] }
      it 'is expected to raise exeption' do
        expect { subject }.to raise_error("Can't access selected records")
      end
    end

    context 'when user tries to access non-existent record' do
      let(:model) { VmOrTemplate }
      let(:id) { [1000000000001, 1000000000002, 1000000000004] }
      it 'is expected to raise exeption' do
        expect { subject }.to raise_error("Can't access selected records")
      end
    end
  end
end
