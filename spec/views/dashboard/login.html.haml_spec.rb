describe "dashboard/login.html.haml" do
  helper(JsHelper)

  context "login_div contains browser and TZ hidden fields" do
    before do
      EvmSpecHelper.create_guid_miq_server_zone
      stub_settings(:server => {}, :session => {}, :authentication => {})
    end

    it "when authentication is 'database'" do
      render
      expect(response).to have_selector("div#login_div:has(input#browser_name)")
      expect(response).to have_selector("div#login_div:has(input#browser_version)")
      expect(response).to have_selector("div#login_div:has(input#browser_os)")
      expect(response).to have_selector("div#login_div:has(input#user_TZO)")
    end

    it "when authentication is not 'database'" do
      render
      expect(response).to have_selector("div#login_div:has(input#browser_name)")
      expect(response).to have_selector("div#login_div:has(input#browser_version)")
      expect(response).to have_selector("div#login_div:has(input#browser_os)")
      expect(response).to have_selector("div#login_div:has(input#user_TZO)")
    end
  end

  context "on screen region/zone/appliance info" do
    let(:labels) { %w(Region: Zone: Appliance:) }
    before do
      EvmSpecHelper.create_guid_miq_server_zone
      MiqRegion.seed
    end

    it "show" do
      stub_settings(:server => {}, :session => {:show_login_info => true}, :authentication => {})
      render
      labels.each do |label|
        expect(response).to have_selector('p', :text => label)
      end
    end

    it "hide" do
      stub_settings(:server => {}, :session => {:show_login_info => false}, :authentication => {})
      render
      labels.each do |label|
        expect(response).not_to have_selector('p', :text => label)
      end
    end
  end
end
