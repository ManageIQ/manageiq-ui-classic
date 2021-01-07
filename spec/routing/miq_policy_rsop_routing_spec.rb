require 'routing/shared_examples'

describe 'routes for MiqPolicyRsopController' do
  let(:controller_name) { 'miq_policy_rsop' }

  describe '#rsop' do
    it 'routes with POST' do
      expect(post("/#{controller_name}/rsop")).to route_to("#{controller_name}#rsop")
    end
  end

  describe '#rsop_option_changed' do
    it 'routes with POST' do
      expect(post("/#{controller_name}/rsop_option_changed")).to route_to("#{controller_name}#rsop_option_changed")
    end
  end

  describe '#rsop_toggle' do
    it 'routes with POST' do
      expect(post("/#{controller_name}/rsop_toggle")).to route_to("#{controller_name}#rsop_toggle")
    end
  end

  describe '#rsop_show_options' do
    it 'routes with POST' do
      expect(post("/#{controller_name}/rsop_show_options")).to route_to("#{controller_name}#rsop_show_options")
    end
  end

  describe '#wait_for_task' do
    it 'routes with POST' do
      expect(post("/#{controller_name}/wait_for_task")).to route_to("#{controller_name}#wait_for_task")
    end
  end
end
