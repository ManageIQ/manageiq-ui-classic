shared_examples 'vm_console_record_types' do |supported_records|
  supported_records.each do |type, support|
    context "and record is type of #{type}" do
      let(:api_version) { 6.4 }
      let(:ems) { FactoryBot.create(:ems_vmware, :api_version => api_version) }
      let(:record) { FactoryBot.create(type, :ems_id => ems.id) }
      it { is_expected.to eq(support) }
    end
  end
end

shared_examples 'vm_console_with_power_state_on_off' do |err_msg|
  context 'when record.current_state == on' do
    let(:power_state) { 'on' }
    it_behaves_like 'an enabled button'
  end
  context 'when record.current_state == off' do
    let(:power_state) { 'off' }
    it_behaves_like 'a disabled button',
                    err_msg || 'The web-based console is not available because the VM is not powered on'
  end
end

shared_examples_for 'vm_console_visible?' do |console_type, records|
  subject { button.visible? }

  context "when console supports #{console_type}" do
    it_behaves_like 'vm_console_record_types',
                    records || {:vm_openstack => false, :vm_redhat => false, :vm_vmware => true}
  end
end

shared_examples_for 'vm_console_not_visible?' do |console_type|
  subject { button.visible? }

  context "ems_id is not present" do
    it { expect(subject).to be_falsey }
  end
end
