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
      expect(post("/#{controller_name}/edit")).to route_to("#{controller_name}#edit")
    end
  end

  describe '#form_field_changed' do
    it 'routes with POST' do
      expect(post("/#{controller_name}/form_field_changed")).to route_to("#{controller_name}#form_field_changed")
    end
  end

  describe '#reload' do
    it 'routes with POST' do
      expect(post("/#{controller_name}/reload")).to route_to("#{controller_name}#reload")
    end
  end

  describe '#show' do
    it 'routes with POST' do
      expect(post("/#{controller_name}/show")).to route_to("#{controller_name}#show")
    end
  end
end
