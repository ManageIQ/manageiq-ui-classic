require 'routing/shared_examples'

describe 'routes for MiqPolicySetController' do
  let(:controller_name) { 'miq_policy_set' }

  describe '#button' do
    it 'routes with POST' do
      expect(post("/#{controller_name}/button")).to route_to("#{controller_name}#button")
    end
  end

  describe '#miq_policy_set_edit' do
    it 'routes with POST' do
      expect(post("/#{controller_name}/miq_policy_set_edit")).to route_to("#{controller_name}#miq_policy_set_edit")
    end
  end

  describe '#profile_field_changed' do
    it 'routes with POST' do
      expect(post("/#{controller_name}/miq_policy_set_edit")).to route_to("#{controller_name}#miq_policy_set_edit")
    end
  end

  describe '#reload' do
    it 'routes with POST' do
      expect(post("/#{controller_name}/reload")).to route_to("#{controller_name}#reload")
    end
  end

  describe '#x_button' do
    it 'routes with POST' do
      expect(post("/#{controller_name}/x_button")).to route_to("#{controller_name}#x_button")
    end
  end

  describe '#x_history' do
    it 'routes with POST' do
      expect(post("/#{controller_name}/x_history")).to route_to("#{controller_name}#x_history")
    end
  end

  describe '#x_show' do
    it 'routes with POST' do
      expect(post("/#{controller_name}/x_show")).to route_to("#{controller_name}#x_show")
    end
  end
end
