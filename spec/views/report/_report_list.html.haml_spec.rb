describe "report/_report_list.html.haml" do
  before do
    rep_details = {
      "rep 5" => {"id" => 5},
      "rep 6" => {"id" => 6},
      "rep 7" => {"id" => 7},
      "rep 8" => {"id" => 8}
    }
    # setup Array of Array with 2 level Folders and reports
    rpt_menu = [
      ["Folder 1", [["Folder1-1", ["rep 1", "rep 2"]]]],
      ["Folder 2", [["Folder2-1", ["rep 5", "rep 6"]],
                    ["Folder2-2", ["rep 7", "rep 8"]]]]
    ]
    assign(:sb,                   :active_accord => :reports,
                                  :active_tree   => :reports_tree,
                                  :rep_details   => rep_details,
                                  :rpt_menu      => rpt_menu,
                                  :trees         => {:reports_tree => {:active_node => "xx-1_xx-1-0"}})
  end

  context 'Check if report list is present' do
    let(:user) { FactoryBot.create(:user_with_group) }

    before do
      login_as user
    end

    it 'Check if report list is present' do
      render :template => "report/_report_list"
      expect(response).to have_selector("//div[@id=\"report_list_div\"]")
    end
  end
end
