describe ApplicationHelper::Button::InstanceDisassociateFloatingIp do
  include Spec::Support::SupportsHelper

  let(:floating_ips) { FactoryBot.build_list(:floating_ip, 1) }
  let(:record)       { FactoryBot.build(:vm_cloud, :floating_ips => floating_ips) }
  let(:view_context) { setup_view_context_with_sandbox({}) }
  let(:button)       { described_class.new(view_context, {}, {"record" => record}, {}) }

  describe '#disabled?' do
    context "when the disassociate ip action is available and the instance has floating ips" do
      before { temp_stub_supports(record, :disassociate_floating_ip, :supports => true) }
      it "is enabled" do
        expect(button.disabled?).to be false
      end
    end

    context "when the disassociate floating ip action is unavailable" do
      before { temp_stub_supports(record, :disassociate_floating_ip, :supports => false) }
      it "is disabled" do
        expect(button.disabled?).to be true
      end
    end

    context "when the instance is not associated to any floating ips" do
      let(:floating_ips) { [] }
      before { temp_stub_supports(record, :disassociate_floating_ip, :supports => true) }
      it "is disabled" do
        expect(button.disabled?).to be true
      end
    end
  end

  describe '#calculate_properties' do
    context "when the disassociate floating ip action is unavailable" do
      before { temp_stub_supports(record, :disassociate_floating_ip, :supports => false) }
      it "has the error in the title" do
        button.calculate_properties
        expect(button[:title]).to eq("Feature not available/supported")
      end
    end

    context "when there are no floating ips" do
      let(:floating_ips) { [] }
      before { temp_stub_supports(record, :disassociate_floating_ip, :supports => true) }
      it "has the error in the title" do
        button.calculate_properties
        expect(button[:title]).to eq("Instance \"#{record.name}\" does not have any associated Floating IPs")
      end
    end

    context "when there are instances to detach from and the action is available" do
      before { temp_stub_supports(record, :disassociate_floating_ip, :supports => true) }
      it "has no error in the title" do
        button.calculate_properties
        expect(button[:title]).to be nil
      end
    end
  end

  private

  def temp_stub_supports(record, feature, supports: true)
    allow(record).to receive("supports_#{feature}?").and_return(supports)
    allow(record).to receive(:unsupported_reason).and_return("Feature not available/supported") unless supports
  end
end
