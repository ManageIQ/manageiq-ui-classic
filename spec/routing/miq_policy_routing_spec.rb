require 'routing/shared_examples'

describe 'routes for MiqPolicyController' do
  let(:controller_name) { 'miq_policy' }

  it_behaves_like 'A controller that has advanced search routes'

  describe '#button' do
    it 'routes with POST' do
      expect(post("/#{controller_name}/button")).to route_to("#{controller_name}#button")
    end
  end

  describe '#index' do
    it 'routes with GET' do
      expect(get("/#{controller_name}")).to route_to("#{controller_name}#index")
    end
  end

  describe '#miq_policy_edit' do
    it 'routes with POST' do
      expect(post("/#{controller_name}/miq_policy_edit")).to route_to("#{controller_name}#miq_policy_edit")
    end
  end

  describe '#policy_field_changed' do
    it 'routes with POST' do
      expect(post("/#{controller_name}/policy_field_changed")).to route_to("#{controller_name}#policy_field_changed")
    end
  end

  describe '#miq_policy_edit' do
    it 'routes with POST' do
      expect(post("/#{controller_name}/miq_policy_edit")).to route_to("#{controller_name}#miq_policy_edit")
    end
  end

  describe '#reload' do
    it 'routes with POST' do
      expect(post("/#{controller_name}/reload")).to route_to("#{controller_name}#reload")
    end
  end

  describe '#miq_event_edit' do
    it 'routes with POST' do
      expect(post("/#{controller_name}/miq_event_edit")).to route_to("#{controller_name}#miq_event_edit")
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
