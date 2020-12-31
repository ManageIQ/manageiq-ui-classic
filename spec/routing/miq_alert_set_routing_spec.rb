require 'routing/shared_examples'

describe 'routes for MiqAlertSetController' do
  let(:controller_name) { 'miq_alert_set' }

  describe '#edit_assignment' do
    it 'routes with POST' do
      expect(post("/#{controller_name}/edit_assignment")).to route_to("#{controller_name}#edit_assignment")
    end
  end

  describe '#alert_profile_assign_changed' do
    it 'routes with POST' do
      expect(
        post("/#{controller_name}/alert_profile_assign_changed")
      ).to route_to("#{controller_name}#alert_profile_assign_changed")
    end
  end

  describe '#edit' do
    it 'routes with GET' do
      expect(get("/#{controller_name}/edit")).to route_to("#{controller_name}#edit")
    end

    it 'routes with POST' do
      expect(post("/#{controller_name}/edit")).to route_to("#{controller_name}#edit")
    end
  end

  describe '#new' do
    it 'routes with GET' do
      expect(get("/#{controller_name}/new")).to route_to("#{controller_name}#new")
    end

    it 'routes with POST' do
      expect(post("/#{controller_name}/new")).to route_to("#{controller_name}#new")
    end
  end

  describe '#alert_profile_field_changed' do
    it 'routes with POST' do
      expect(
        post("/#{controller_name}/alert_profile_field_changed")
      ).to route_to("#{controller_name}#alert_profile_field_changed")
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

  describe '#show' do
    it 'routes with GET' do
      expect(get("/#{controller_name}/show")).to route_to("#{controller_name}#show")
    end

    it 'routes with POST' do
      expect(post("/#{controller_name}/show")).to route_to("#{controller_name}#show")
    end
  end
end
