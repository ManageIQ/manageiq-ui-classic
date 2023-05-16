describe 'report/_form_filter.html.haml' do
  let(:report) { FactoryBot.create(:miq_report) }
  let(:exp_table) { [["Example AFTER \"value1\"", 1]] }
  let(:expression) { {"after" => {"field" => "field_example", "value" => "value1"}, :token => 1} }
  let(:edit) { {:rpt_id => report.id, :record_filter => {:exp_table => exp_table, :expression => expression}} }

  before do
    assign(:expkey, :record_filter)
    assign(:edit, edit)
  end

  it 'renders form expression buttons for other report and Edit Display Filter button' do
    render :partial => 'report/form_expression_buttons',
           :locals  => {:create_label  => 'Create Display Filter',
                        :display_label => 'Edit Display Filter',
                        :exp_key       => "record_filter"}
    expect(rendered).to match(/Edit Display Filter/)
  end

  context 'Create Display Filter button' do
    let(:exp_table) { [["???", 1]] }
    let(:expression) { {"???" => "???", :token => 1} }

    it 'renders form expression buttons for other report and Create Display Filter button' do
      render :partial => 'report/form_expression_buttons',
             :locals  => {:create_label  => 'Create Display Filter',
                          :display_label => 'Edit Display Filter',
                          :exp_key       => "display_filter"}
      expect(rendered).to match(/Create Display Filter/)
    end
  end
end
