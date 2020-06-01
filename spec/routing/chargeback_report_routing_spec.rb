describe 'routes for ChargebackReportController' do
  let(:controller_name) { 'chargeback_report' }

  describe '#show_list' do
    it 'routes with GET' do
      expect(get("/#{controller_name}/show_list")).to route_to("#{controller_name}#show_list")
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

  describe '#show' do
    it 'routes with POST' do
      expect(post("/#{controller_name}/show")).to route_to("#{controller_name}#show")
    end

    it 'routes with GET' do
      expect(get("/#{controller_name}/show")).to route_to("#{controller_name}#show")
    end
  end

  describe '#saved_report_paging' do
    it 'routes with POST' do
      expect(post("/#{controller_name}/saved_report_paging")).to route_to("#{controller_name}#saved_report_paging")
    end
  end
end
