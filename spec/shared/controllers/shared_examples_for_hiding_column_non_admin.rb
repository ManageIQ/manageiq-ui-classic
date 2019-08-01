shared_examples 'hiding tenant column for non admin user' do |expected_result|
  before do
    allow(controller).to receive(:render)
    login_as FactoryBot.create(user_type)
  end

  subject do
    expect(controller).to receive(:get_db_view).and_return(report)
    controller.send(:report_data)
    controller.send(:view_to_hash, assigns(:view))
  end

  let(:first_row) { subject[:rows][0][:cells].map { |x| x[:text] }.compact }
  let(:headers) { subject[:head].map { |x| x[:text] }.compact }
  let(:result_array) { expected_result.keys.map { |column| record.send(column) } }

  context "when not admin" do
    let(:user_type) { :user }

    it "renders show_list and does not include hidden column(hidden by display method)" do
      expect(headers).to match_array(expected_result.values)
      expect(first_row).to match_array(result_array)
    end
  end

  context "when admin" do
    let(:user_type) { :user_admin }

    it "renders show_list and includes all columns" do
      expect(headers).to match_array(expected_result.values + ['Tenant'])
      expect(first_row).to match_array(result_array + [record.tenant.name])
    end
  end
end
