describe ConditionController do
  before { stub_user(:features => :all) }

  describe "#show_list" do
    render_views

    it "renders index" do
      get :index
      expect(response.status).to eq(302)
      expect(response).to redirect_to(:action => 'show_list')
    end
  end

  describe "#show" do
    before do
      @condition = FactoryBot.create(:condition, :name => "Test_Condition")
    end

    it "render show" do
      get(:show, :params => {:id => @condition.id})

      expect(response.status).to eq(200)
      expect(controller.instance_variable_get(:@expression_table)).to eq([["VM and Instance : Number of CPUs >= 2", 1]])
    end
  end
end
