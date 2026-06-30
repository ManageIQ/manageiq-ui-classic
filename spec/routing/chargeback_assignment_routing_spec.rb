describe 'routes for ChargebackAssignmentController' do
  let(:controller_name) { 'chargeback_assignment' }

  describe '#index' do
    it 'routes with GET' do
      expect(get("/#{controller_name}")).to route_to("#{controller_name}#index")
    end
  end
end
