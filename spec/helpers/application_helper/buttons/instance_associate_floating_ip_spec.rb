describe ApplicationHelper::Button::InstanceAssociateFloatingIp do
  include Spec::Support::SupportsHelper

  let(:floating_ips) { FactoryBot.build_list(:floating_ip, 1) }
  let(:cloud_tenant) { FactoryBot.build(:cloud_tenant, :floating_ips => floating_ips) }
  let(:record)       { FactoryBot.build(:vm_cloud, :cloud_tenant => cloud_tenant) }
  let(:view_context) { setup_view_context_with_sandbox({}) }
  let(:button)       { described_class.new(view_context, {}, {"record" => record}, {}) }

  describe '#disabled?' do
    context "when the associate floating ip action is available" do
      before { stub_supports(record.class, :associate_floating_ip) }
      it "is not disabled" do
        expect(button.disabled?).to be false
      end
    end

    context "when the associate floating ip action is unavailable" do
      let(:cloud_tenant) { nil }
      before { stub_supports(record.class, :associate_floating_ip) }
      it " is disabled" do
        expect(button.disabled?).to be true
      end
    end

    context "when the there are no floating ips available" do
      let(:floating_ips) { [] }
      before { stub_supports(record.class, :associate_floating_ip) }
      it "is disabled" do
        expect(button.disabled?).to be true
      end
    end
  end

  describe '#calculate_properties' do
    context "when the associate floating ip action is unavailable" do
      before { stub_supports_not(record.class, :associate_floating_ip) }
      it "has the error in the title" do
        button.calculate_properties
        expect(button[:title]).to eq("Feature not available/supported")
      end
    end
    context "when there are no floating ips available" do
      let(:floating_ips) { [] }
      before { stub_supports(record.class, :associate_floating_ip) }
      it "has the error in the title" do
        button.calculate_properties
        expect(button[:title]).to eq("There are no Floating IPs available to this Instance.")
      end
    end

    context "when the action is available" do
      before { stub_supports(record.class, :associate_floating_ip) }
      it "has no error in the title" do
        button.calculate_properties
        expect(button[:title]).to be nil
      end
    end
  end
end
