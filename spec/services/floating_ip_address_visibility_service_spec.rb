describe FloatingIpAddressVisibilityService do
  let(:subject) { described_class.new }

  describe "#determine_visibility" do
    context "when the number of vms is greater than 1" do
      let(:floating_ip_address) { nil }
      let(:number_of_vms) { 2 }

      it "adds values to field names to hide" do
        expect(subject.determine_visibility(floating_ip_address, number_of_vms)).to eq(
          :hide => [:floating_ip_address], :edit => []
        )
      end
    end

    context "when the number of vms is not greater than 1" do
      let(:floating_ip_address) { nil }
      let(:number_of_vms) { 1 }

      it "adds values to field names to edit" do
        expect(subject.determine_visibility(floating_ip_address, number_of_vms)).to eq(
          :hide => [], :edit => [:floating_ip_address]
        )
      end
    end
  end
end
