require 'routing/shared_examples'

describe 'routes for MiqPolicyLogController' do
  let(:controller_name) { 'miq_policy_log' }

  describe '#button' do
    it 'routes with POST' do
      expect(post("/#{controller_name}/button")).to route_to("#{controller_name}#button")
    end
  end

  describe '#fetch_log' do
    it 'routes with GET' do
      expect(get("/#{controller_name}/fetch_log")).to route_to("#{controller_name}#fetch_log")
    end
  end

  describe '#index' do
    it 'routes with GET' do
      expect(get("/#{controller_name}")).to route_to("#{controller_name}#index")
    end
  end
end
