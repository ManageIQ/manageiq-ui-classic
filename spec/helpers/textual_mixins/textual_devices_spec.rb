describe TextualMixins::TextualDevices do
  let(:host) { FactoryGirl.create(:host, :hardware => hw) }
  before(:each) do
    assign(:record, host)
  end

  describe "#devices_details" do
    subject { helper.devices_details }

    context "without hardware" do
      let(:hw) { nil }
      it { is_expected.to be_empty }
    end

    context "with a hardware" do
      let(:hw) { FactoryGirl.create(:hardware, :cpu1x1, :ram1GB) }
      it { is_expected.not_to be_empty }
    end
  end

  describe "#disks_attributes" do
    subject { helper.disks_attributes }

    context "without hdd hardware" do
      let(:hw) { FactoryGirl.create(:hardware, :cpu1x1, :ram1GB) }
      it { is_expected.to be_empty }
    end

    context "with hdd hardware" do
      let(:hw) do
        FactoryGirl.create(:hardware,
                           :disks => [FactoryGirl.create(:disk,
                                                         :device_type     => "disk",
                                                         :controller_type => "scsi")])
      end
      it { is_expected.not_to be_empty }
    end

    context "with hdd with no size_on_disk collected (AZURE)" do
      let(:hw) do
        FactoryGirl.create(:hardware,
                           :disks => [FactoryGirl.create(:disk,
                                                         :device_type     => "disk",
                                                         :size            => "1072693248",
                                                         :controller_type => "AZURE")])
      end
      it { expect(subject[0][:name]).to include("Hard Disk (AZURE ), Size 1072693248") }
      it { expect(subject[0][:name]).not_to include("Percent Used Provisioned Space") }
    end
  end

  describe "#network_attributes" do
    subject { helper.network_attributes }

    context "without network hardware" do
      let(:hw) { FactoryGirl.create(:hardware, :cpu1x1, :ram1GB) }
      it { is_expected.to be_empty }
    end

    context "with network hardware" do
      let(:hw) do
        FactoryGirl.create(:hardware,
                           :guest_devices => [FactoryGirl.create(:guest_device_nic)])
      end
      it { is_expected.not_to be_empty }
    end
  end
end
