describe 'routes for ChargebackReportController' do
  let(:controller_name) { 'chargeback_report' }

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

  describe '#render_csv' do
    it 'routes with GET' do
      expect(get("/#{controller_name}/render_csv")).to route_to("#{controller_name}#render_csv")
    end
  end

  describe '#render_pdf' do
    it 'routes with GET' do
      expect(get("/#{controller_name}/render_pdf")).to route_to("#{controller_name}#render_pdf")
    end
  end

  describe '#render_txt' do
    it 'routes with GET' do
      expect(get("/#{controller_name}/render_txt")).to route_to("#{controller_name}#render_txt")
    end
  end

  describe '#report_only' do
    it 'routes with GET' do
      expect(get("/#{controller_name}/report_only")).to route_to("#{controller_name}#report_only")
    end
  end

  describe '#x_show' do
    it 'routes with POST' do
      expect(post("/#{controller_name}/x_show")).to route_to("#{controller_name}#x_show")
    end
  end
end
