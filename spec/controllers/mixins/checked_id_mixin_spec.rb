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
    let!(:vm1) { FactoryGirl.create(:vm_or_template) }
    let!(:vm2) { FactoryGirl.create(:vm_or_template) }
    let!(:vm3) { FactoryGirl.create(:vm_or_template) }

    subject { mixin.send(:find_records_with_rbac, model, id) }

    context 'when single record is checked in show list' do
      let(:model) { VmOrTemplate }
      let(:id) { [vm1.id] }
      it { is_expected.to eq([vm1]) }
    end

    context 'when multiple records are checked in show list' do
      let(:model) { VmOrTemplate }
      let(:id) { [vm1.id, vm2.id] }
      it { is_expected.to match_array([vm1, vm2]) }
    end

    context 'when user is not authorized to access the record' do
      before { allow(Rbac).to receive(:filtered).and_return([vm1, vm2]) }
      let(:model) { VmOrTemplate }
      let(:id) { [vm1.id, vm2.id, vm3.id] }
      it 'is expected to raise exception' do
        expect { subject }.to raise_error("Can't access selected records")
      end
    end

    context 'when user tries to access non-existent record' do
      let(:model) { VmOrTemplate }
      let(:missing_vm_id) { VmOrTemplate.maximum(:id) + 1000 }
      let(:id) { [vm1.id, vm2.id, missing_vm_id] }
      it 'is expected to raise exception' do
        expect { subject }.to raise_error("Can't access selected records")
      end
    end

    context 'when there is no record id' do
      let(:model) { VmOrTemplate }
      let(:id) { [] }
      it 'is expected to raise exception' do
        expect { subject }.to raise_error("Can't access records without an id")
      end
    end

    context 'when user tries to access record with nil id ' do
      let(:model) { VmOrTemplate }
      let(:id) { [vm1.id, nil] }
      it 'is expected to raise exception' do
        expect { subject }.to raise_error("Can't access records without an id")
      end
    end
  end
end
