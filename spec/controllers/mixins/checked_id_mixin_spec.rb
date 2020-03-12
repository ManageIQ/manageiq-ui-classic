describe Mixins::CheckedIdMixin do
  describe '#find_records_with_rbac' do
    # include tested mixin, create user inline
    let(:mixin) { Object.new.tap { |instance| instance.extend(described_class) } }

    # create records
    let!(:vm1) { FactoryBot.create(:vm_or_template) }
    let!(:vm2) { FactoryBot.create(:vm_or_template) }
    let!(:vm3) { FactoryBot.create(:vm_or_template) }

    subject { mixin.find_records_with_rbac(model, id) }

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
