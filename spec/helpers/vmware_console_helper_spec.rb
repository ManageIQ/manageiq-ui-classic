describe VmwareConsoleHelper do
  describe '#vmware_remote_console_items' do
    subject { helper.vmware_remote_console_items(webmks) }
    before { allow(helper).to receive(:webmks_assets_provided?).and_return(false) }

    context 'webmks is not selected' do
      let(:webmks) { false }

      it 'webmks is not included in the array' do
        is_expected.not_to include(["VMware WebMKS", "WebMKS"])
      end
    end

    context 'webmks is selected' do
      let(:webmks) { true }

      it 'webmks is included in the array' do
        is_expected.to include(["VMware WebMKS", "WebMKS"])
      end
    end
  end
end
