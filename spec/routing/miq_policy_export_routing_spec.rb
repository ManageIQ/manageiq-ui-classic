require 'routing/shared_examples'

describe 'routes for MiqPolicyExportController' do
  let(:controller_name) { 'miq_policy_export' }

  describe '#export' do
    it 'routes with GET' do
      expect(get("/#{controller_name}/export")).to route_to("#{controller_name}#export")
    end
  end

  describe '#export_field_changed' do
    it 'routes with POST' do
      expect(post("/#{controller_name}/export_field_changed")).to route_to("#{controller_name}#export_field_changed")
    end
  end

  describe '#fetch_yaml' do
    it 'routes with GET' do
      expect(get("/#{controller_name}/fetch_yaml")).to route_to("#{controller_name}#fetch_yaml")
    end
  end

  describe '#get_json' do
    it 'routes with GET' do
      expect(get("/#{controller_name}/get_json")).to route_to("#{controller_name}#get_json")
    end
  end

  describe '#import' do
    it 'routes with GET' do
      expect(get("/#{controller_name}/import")).to route_to("#{controller_name}#import")
    end

    it 'routes with POST' do
      expect(post("/#{controller_name}/import")).to route_to("#{controller_name}#import")
    end
  end

  describe '#index' do
    it 'routes with GET' do
      expect(get("/#{controller_name}")).to route_to("#{controller_name}#index")
    end
  end

  describe '#upload' do
    it 'routes with POST' do
      expect(post("/#{controller_name}/upload")).to route_to("#{controller_name}#upload")
    end
  end
end
