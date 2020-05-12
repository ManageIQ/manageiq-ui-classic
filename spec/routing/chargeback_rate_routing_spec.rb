describe 'routes for ChargebackRateController' do
  let(:controller_name) { 'chargeback_rate' }

  describe '#cb_rate_edit' do
    it 'routes with POST' do
      expect(post("/#{controller_name}/cb_rate_edit")).to route_to("#{controller_name}#cb_rate_edit")
    end
  end

  describe '#cb_rate_form_field_changed' do
    it 'routes with POST' do
      expect(
        post("/#{controller_name}/cb_rate_form_field_changed")
      ).to route_to("#{controller_name}#cb_rate_form_field_changed")
    end
  end

  describe '#cb_rate_show' do
    it 'routes with POST' do
      expect(post("/#{controller_name}/cb_rate_show")).to route_to("#{controller_name}#cb_rate_show")
    end
  end

  describe '#cb_rates_delete' do
    it 'routes with POST' do
      expect(post("/#{controller_name}/cb_rates_delete")).to route_to("#{controller_name}#cb_rates_delete")
    end
  end

  describe '#cb_rates_list' do
    it 'routes with POST' do
      expect(post("/#{controller_name}/cb_rates_list")).to route_to("#{controller_name}#cb_rates_list")
    end
  end

  describe '#explorer' do
    it 'routes with GET' do
      expect(get("/#{controller_name}/explorer")).to route_to("#{controller_name}#explorer")
    end

    it 'routes with POST' do
      expect(post("/#{controller_name}/explorer")).to route_to("#{controller_name}#explorer")
    end
  end

  describe '#index' do
    it 'routes with GET' do
      expect(get("/#{controller_name}")).to route_to("#{controller_name}#index")
    end
  end

  describe '#x_show' do
    it 'routes with POST' do
      expect(post("/#{controller_name}/x_show")).to route_to("#{controller_name}#x_show")
    end
  end
end
