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
                                                         :device_name     => "HD01",
                                                         :controller_type => "scsi")])
      end
      it { is_expected.not_to be_empty }
    end

    context "with hdd with no size_on_disk collected (AZURE)" do
      let(:hw) do
        FactoryGirl.create(:hardware,
                           :disks => [FactoryGirl.create(:disk,
                                                         :device_type     => "disk",
                                                         :device_name     => "HD01",
                                                         :size            => "1072693248",
                                                         :controller_type => "AZURE")])
      end
      it { expect(subject[0][:name]).to include("Hard Disk") }
      it { expect(subject[0][:description]).to include("Name: HD01, Location: N/A, Size: 1072693248, Percent Used Provisioned Space: N/A, Filename: N/A, Mode: N/A") }
    end

    context "with hdd with size_on_disk and percent provisioned collected (AZURE)" do
      let(:hw) do
        FactoryGirl.create(:hardware,
                           :disks => [FactoryGirl.create(:disk,
                                                         :device_type     => "disk",
                                                         :device_name     => "CLIA566D60F38FB9ECC",
                                                         :location        => "https://jdg.blob.core.windows.net/vhds/clia566d60f38fb9ecc.vhd",
                                                         :size            => "1072693248",
                                                         :size_on_disk    => "357564416",
                                                         :controller_type => "AZURE")])
      end
      it { expect(subject[0][:name]).to include("Hard Disk") }

      it "expect hard disk description with percent provisioned " do
        expected_description = "Name: CLIA566D60F38FB9ECC, " \
                               "Location: https://jdg.blob.core.windows.net/vhds/clia566d60f38fb9ecc.vhd, " \
                               "Size: 1072693248, " \
                               "Percent Used Provisioned Space: 33.3, " \
                               "Filename: N/A, " \
                               "Mode: N/A"

        expect(subject[0][:description]).to include(expected_description)
      end
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
