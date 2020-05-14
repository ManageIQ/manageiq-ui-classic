describe 'routes for ChargebackAssignmentController' do
  let(:controller_name) { 'chargeback_assignment' }

  describe '#cb_assign_field_changed' do
    it 'routes with POST' do
      expect(post("/#{controller_name}/cb_assign_field_changed")).to route_to(
        "#{controller_name}#cb_assign_field_changed"
      )
    end
  end

  describe '#cb_assign_update' do
    it 'routes with POST' do
      expect(post("/#{controller_name}/cb_assign_update")).to route_to("#{controller_name}#cb_assign_update")
    end
  end

  describe '#index' do
    it 'routes with GET' do
      expect(get("/#{controller_name}")).to route_to("#{controller_name}#index")
    end
  end
end
