require 'routing/shared_examples'

describe 'routes for ConditionController' do
  let(:controller_name) { 'condition' }

  describe '#edit' do
    it 'routes with GET' do
      expect(get("/#{controller_name}/edit")).to route_to("#{controller_name}#edit")
    end

    it 'routes with POST' do
      expect(post("/#{controller_name}/edit")).to route_to("#{controller_name}#edit")
    end
  end

  describe '#copy' do
    it 'routes with GET' do
      expect(get("/#{controller_name}/copy")).to route_to("#{controller_name}#copy")
    end
  end

  describe '#new' do
    it 'routes with GET' do
      expect(get("/#{controller_name}/new")).to route_to("#{controller_name}#new")
    end
  end

  describe '#condition_field_changed' do
    it 'routes with POST' do
      expect(
        post("/#{controller_name}/condition_field_changed")
      ).to route_to("#{controller_name}#condition_field_changed")
    end
  end

  describe '#show' do
    it 'routes with GET' do
      expect(get("/#{controller_name}/show")).to route_to("#{controller_name}#show")
    end

    it 'routes with POST' do
      expect(post("/#{controller_name}/show")).to route_to("#{controller_name}#show")
    end
  end

  describe '#show_list' do
    it 'routes with GET' do
      expect(get("/#{controller_name}/show_list")).to route_to("#{controller_name}#show_list")
    end

    it 'routes with POST' do
      expect(post("/#{controller_name}/show_list")).to route_to("#{controller_name}#show_list")
    end
  end
end
