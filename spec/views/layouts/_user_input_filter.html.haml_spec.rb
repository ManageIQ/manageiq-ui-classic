describe "layouts/_user_input_filter.html.haml" do
  context 'for boolean user input field' do
    before do
      @edit = {:qs_tokens => { 1 => {:value => nil, :field => 'ManageIQ::Providers::InfraManager::Template-active', :value_type => :boolean}}}
      @qs_exp_table = ["Template:Active =", [:user_input, 1]]
    end

    it 'shows a dropdown field' do
      set_controller_for_view("host")
      render :template => "layouts/_user_input_filter"
      expect(rendered).to include("<option value=\"false\">False</option>\n<option value=\"true\">True</option></select>")
    end
  end
end
