describe ChargebackController do
  before { stub_user(:features => :all) }

  context "returns current rate assignments or set them to blank if category/tag is deleted" do
    let(:category) { FactoryBot.create(:classification) }
    let(:tag)      { FactoryBot.create(:classification, :parent_id => category.id) }
    let(:entry)    { FactoryBot.create(:classification, :parent_id => tag.id) }

    describe "#get_tags_all" do
      before { entry }

      it "returns the classification entry record" do
        controller.instance_variable_set(:@edit, :cb_assign => {:tags => {}})
        controller.send(:get_tags_all)

        result = {category.id => {tag.id.to_s => tag.description}, tag.id => { entry.id.to_s => entry.description}, entry.id => {}}

        expect(assigns(:edit)[:cb_assign][:tags]).to eq(result)
      end
    end

    describe "#cb_assign_set_form_vars" do
      before do
        cbr = FactoryBot.create(:chargeback_rate, :rate_type => "Storage")
        ChargebackRate.set_assignments(:Storage, [{:cb_rate => cbr, :tag => [tag, "vm"]}])
        sandbox = {:active_tree => :cb_assignments_tree, :trees => {:cb_assignments_tree => {:active_node => 'xx-Storage'}}}
        controller.instance_variable_set(:@sb, sandbox)
      end

      it "returns tag for current assignments" do
        controller.send(:cb_assign_set_form_vars)
        expect(assigns(:edit)[:current_assignment][0][:tag][0]['parent_id']).to eq(category.id)
      end

      it "returns empty array for current_assignment when tag/category is not found" do
        tag.destroy
        controller.send(:cb_assign_set_form_vars)
        expect(assigns(:edit)[:current_assignment]).to eq([])
      end
    end

    describe '#cb_assign_get_form_vars' do
      before do
        controller.params = {:cblabel_key => 'null'}
        controller.instance_variable_set(:@edit, :new => {:cbshow_typ => '-labels'}, :cb_assign => {})
      end

      it "returns tag for current assignments" do
        expect { controller.send(:cb_assign_get_form_vars) }.not_to raise_error
      end

      it "initializes hash when data are no available(params[:cblabel_key] == null)" do
        controller.send(:cb_assign_get_form_vars)
        docker_label_values = controller.instance_variable_get(:@edit)[:cb_assign][:docker_label_values]
        expect(docker_label_values).to eq({})
      end

      it "initializes hash when data are no available (params[:cblabel_key] == nil)" do
        controller.params = {:cblabel_key => nil}
        controller.send(:cb_assign_get_form_vars)
        docker_label_values = controller.instance_variable_get(:@edit)[:cb_assign][:docker_label_values]
        expect(docker_label_values).to eq({})
      end
    end
  end

  context "Saved chargeback rendering" do
    it "Saved chargeback reports renders paginagion buttons correctly" do
      report = FactoryBot.create(:miq_report_with_results, :miq_group => User.current_user.current_group)
      report.extras = {:total_html_rows => 100}
      rp_id = report.id
      rr_id = report.miq_report_results[0].id
      node = "xx-#{rp_id}-2_rr-#{rr_id}"
      html = '<table><thead><tr><th>column 1</th><th>column 2</th></thead><tbody>'
      100.times do
        html += '<tr><td>col1 value</td><td>col2 value</td></tr>'
      end
      html += '</tbody></table>'

      allow(controller).to  receive(:cb_rpts_show_saved_report)
      expect(controller).to receive(:render)
      controller.instance_variable_set(:@sb,
                                       :active_tree => :cb_reports_tree,
                                       :trees       => {:cb_reports_tree => {:active_node => node}})
      controller.instance_variable_set(:@report, report)
      controller.instance_variable_set(:@html, html)
      controller.instance_variable_set(:@layout, "chargeback")
      controller.params = {:id => node}
      controller.send(:tree_select)
      expect(response).to                        render_template('layouts/_saved_report_paging_bar')
      expect(controller.send(:flash_errors?)).to be_falsey
      expect(response.status).to                 eq(200)
    end

    describe "#cb_rpt_build_folder_nodes" do
      let!(:admin_user)        { FactoryBot.create(:user_admin) }
      let!(:chargeback_report) { FactoryBot.create(:miq_report_chargeback_with_results) }

      before { login_as admin_user }

      it "returns list of saved chargeback report results" do
        controller.send(:cb_rpt_build_folder_nodes)

        parent_reports = controller.instance_variable_get(:@parent_reports)

        tree_id = "#{chargeback_report.id}-0"
        expected_result = {chargeback_report.miq_report_results.first.miq_report.name => tree_id}
        expect(parent_reports).to eq(expected_result)
      end
    end
  end

  describe "#explorer" do
    render_views

    it "can be rendered" do
      EvmSpecHelper.create_guid_miq_server_zone
      get :explorer
      expect(response.status).to eq(200)
      expect(response.body).to_not be_empty
    end
  end

  describe "#process_cb_rates" do
    it "delete unassigned" do
      cbr = FactoryBot.create(:chargeback_rate)

      rates = [cbr.id]
      controller.send(:process_cb_rates, rates, "destroy")

      expect(controller.send(:flash_errors?)).to be_falsey

      flash_array = assigns(:flash_array)
      expect(flash_array.first[:message]).to include("Delete successful")
    end

    it "delete assigned" do
      cbr = FactoryBot.create(:chargeback_rate)
      host = FactoryBot.create(:host)
      cbr.assign_to_objects(host)

      rates = [cbr.id]
      controller.send(:process_cb_rates, rates, "destroy")

      expect(controller.send(:flash_errors?)).to be_truthy

      flash_array = assigns(:flash_array)
      expect(flash_array.first[:message]).to include("rate is assigned and cannot be deleted")
    end
  end

  describe "#get_cis_all" do
    let!(:storage) { FactoryBot.create(:storage) }
    let!(:miq_enterprise) { FactoryBot.create(:miq_enterprise) }

    it "returns names of instances of enterprise" do
      names_miqent = {}
      MiqEnterprise.all.each do |instance|
        names_miqent[instance.id] = instance.name
      end
      controller.instance_variable_set(:@edit, :new => {:cbshow_typ => "enterprise"}, :cb_assign => {})
      controller.send(:get_cis_all)
      expect(assigns(:edit)[:cb_assign][:cis]).to eq(names_miqent)
    end

    it "returns names of instances of storage" do
      names_storage = {}
      element = "storage"
      element.classify.constantize.all.each do |instance|
        names_storage[instance.id] = instance.name
      end
      controller.instance_variable_set(:@edit, :new => {:cbshow_typ => element}, :cb_assign => {})
      controller.send(:get_cis_all)
      expect(assigns(:edit)[:cb_assign][:cis]).to eq(names_storage)
    end

    it "returns a ArgumentError when element not in whitelist" do
      controller.instance_variable_set(:@edit, :new => {:cbshow_typ => "None"}, :cb_assign => {})
      expect { controller.send(:get_cis_all) }.to raise_error(ArgumentError)
    end

    it "doesn't names of instances when nothing is selected" do
      controller.instance_variable_set(:@edit,
                                       :new => {:cbshow_typ => described_class::NOTHING_FORM_VALUE}, :cb_assign => {})
      controller.send(:get_cis_all)
      expect(assigns(:edit)[:cb_assign][:cis]).to eq({})
    end
  end

  context "chargeback rate form actions" do
    # indexing inputs regard to database
    # html inputs have names(and ids) in form "start_0_0", "finish_0_2"
    # it means "start_[num_of_rate_detail]_[num_of_tier]"

    # for example we have in database:
    # chargeback_rate => [
    #                     chargeback_rate_details_0 => [
    #                                                 chargeback_tiers_0  => index of tier : 0_0
    #                                                 chargeback_tiers_1  => index of tier : 0_1
    #                                                 chargeback_tiers_2  => index of tier : 0_2
    #                                                ]
    #                     chargeback_rate_details_1 => [
    #                                                 chargeback_tiers_0  => index of tier : 1_0
    #                                                 chargeback_tiers_1  => index of tier : 1_1
    #                                                 chargeback_tiers_2  => index of tier : 1_2
    #                                                ]
    # ]
    #

    render_views

    let(:chargeback_rate) { FactoryBot.create(:chargeback_rate, :with_details, :description => "foo") }

    # this index represent first rate detail( "Allocated Memory in MB") chargeback_rate
    let(:index_to_rate_type) { "0" }

    before do
      EvmSpecHelper.local_miq_server
      allow_any_instance_of(described_class).to receive(:center_toolbar_filename).and_return("chargeback_center_tb")
      seed_session_trees('chargeback', :cb_rates_tree, "xx-Compute")
      [ChargebackRateDetailMeasure, ChargeableField].each(&:seed)
    end

    def expect_input(body, selector, value)
      expect(body).to have_selector("input[value='#{value}']##{selector}")
    end

    def expect_rendered_tiers(body, tiers, order_of_rate_detail = 0)
      tiers.each_with_index do |tier, index|
        expect_input(body, "start_#{order_of_rate_detail}_#{index}", tier[:start])
        finish_tier_value = tier[:finish] == Float::INFINITY ? "" : tier[:finish]
        expect_input(body, "finish_#{order_of_rate_detail}_#{index}", finish_tier_value)
      end
    end

    def change_form_value(field, value, resource_action = nil)
      resource_action ||= chargeback_rate.id
      post :cb_rate_form_field_changed, :params => {:id => resource_action, field => value}
    end

    it "renders edit form with correct values" do
      post :x_button, :params => {:pressed => "chargeback_rates_edit", :id => chargeback_rate.id}
      expect(response).to render_template(:partial => 'chargeback/_cb_rate_edit')
      expect(response).to render_template(:partial => 'chargeback/_cb_rate_edit_table')

      main_content = JSON.parse(response.body)['updatePartials']['main_div']
      expect_input(main_content, "description", "foo")

      expect_rendered_tiers(main_content, [{:start => "0.0", :finish => "20.0"},
                                           {:start => "20.0", :finish => "40.0"},
                                           {:start => "40.0", :finish => Float::INFINITY}])

      expect_rendered_tiers(main_content, [{:start => "0.0", :finish => Float::INFINITY}], 1)
    end

    it "removes requested tier line from edit from" do
      post :x_button, :params => {:pressed => "chargeback_rates_edit", :id => chargeback_rate.id}
      post :cb_tier_remove, :params => {:button => "remove", :index => "0-1"}

      response_body = response.body.delete('\\').gsub('u003e', ">").gsub('u003c', "<")

      expect(response).to render_template(:partial => 'chargeback/_cb_rate_edit_table')

      expect_rendered_tiers(response_body, [{:start => "0.0", :finish => "20.0"},
                                            {:start => "40.0", :finish => Float::INFINITY}])

      expect_rendered_tiers(response_body, [{:start => "0.0", :finish => Float::INFINITY}], 1)
    end

    it "removes requested tier line and add 2 new tiers line from edit from" do
      count_of_tiers = chargeback_rate.chargeback_rate_details[index_to_rate_type.to_i].chargeback_tiers.count
      post :x_button, :params => {:pressed => "chargeback_rates_edit", :id => chargeback_rate.id}
      post :cb_tier_remove, :params => {:button => "remove", :index => "#{index_to_rate_type}-1"}
      post :cb_tier_add, :params => {:button => "add", :detail_index => index_to_rate_type}
      post :cb_tier_add, :params => {:button => "add", :detail_index => index_to_rate_type}

      response_body = response.body.delete('\\').gsub('u003e', ">").gsub('u003c', "<")

      count_of_last_tier = count_of_tiers - 1 + 2 # one tier removed, two tiers added
      selector = "#{index_to_rate_type}_#{count_of_last_tier - 1}"
      expect_input(response_body, "start_#{selector}", "")
      expect_input(response_body, "finish_#{selector}", "")
    end

    it "saves edited chargeback rate" do
      post :x_button, :params => {:pressed => "chargeback_rates_edit", :id => chargeback_rate.id}

      # remove second tier for rate detail; (values  {:start => "20.0", :finish => "40.0"})
      post :cb_tier_remove, :params => {:button => "remove", :index => "#{index_to_rate_type}-1"}

      # add new tier, new position is index_to_rate_type-1
      post :cb_tier_add, :params => {:button => "add", :detail_index => index_to_rate_type}

      # add new tier at, new position is index_to_rate_type-2
      post :cb_tier_add, :params => {:button => "add", :detail_index => index_to_rate_type}

      # after these actions we have for rate detail values:
      # 0-0 :start => 0.0, :finish => 20.0
      # 0-1 :start => 40.0, :finish => Infinity
      # 0-2 :start => Infinity, :finish => Infinity
      # 0-3 :start => Infinity, :finish => Infinity

      # add values to newly added tiers to be valid
      change_form_value(:start_0_1, "20.0")
      change_form_value(:finish_0_1, "50.0")
      change_form_value(:start_0_2, "50.0")
      change_form_value(:finish_0_2, "70.0")
      change_form_value(:start_0_3, "70.0")

      # so after updating form values we have tiers with valid values
      # 0-0 :start => 0.0, :finish => 30.0
      # 0-1 :start => 30.0, :finish => 50.0
      # 0-2 :start => 50.0, :finish => 70.0
      # 0-3 :start => 70.0, :finish => Infinity

      post :cb_rate_edit, :params => {:button => "save", :id => chargeback_rate.id}

      rate_detail = ChargebackRate.find(chargeback_rate.id).chargeback_rate_details[index_to_rate_type.to_i]
      expect(rate_detail.chargeback_tiers[0]).to have_attributes(:start => 0.0, :finish => 20.0)
      expect(rate_detail.chargeback_tiers[1]).to have_attributes(:start => 20.0, :finish => 50.0)
      expect(rate_detail.chargeback_tiers[2]).to have_attributes(:start => 50.0, :finish => 70.0)
      expect(rate_detail.chargeback_tiers[3]).to have_attributes(:start => 70.0, :finish => Float::INFINITY)
    end

    it "saves edited chargeback rate when 'per unit' is changed" do
      post :x_button, :params => {:pressed => "chargeback_rates_edit", :id => chargeback_rate.id}

      change_form_value(:per_time_0, "monthly")

      post :cb_rate_edit, :params => {:button => "save", :id => chargeback_rate.id}

      rate_detail = ChargebackRate.find(chargeback_rate.id).chargeback_rate_details[index_to_rate_type.to_i]
      expect(rate_detail.per_time).to eq("monthly")
    end

    it "saves edited chargeback rate when 'per time' is changed" do
      post :x_button, :params => {:pressed => "chargeback_rates_edit", :id => chargeback_rate.id}

      change_form_value(:per_unit_1, "teraherts")

      post :cb_rate_edit, :params => {:button => "save", :id => chargeback_rate.id}

      rate_detail = ChargebackRate.find(chargeback_rate.id).chargeback_rate_details[1]
      expect(rate_detail.per_unit).to eq("teraherts")
    end

    it "saves edited chargeback rate when value in finish column is changed to infinity (infinity is blank string)" do
      post :x_button, :params => {:pressed => "chargeback_rates_edit", :id => chargeback_rate.id}
      # chargeback_rate[index_to_rate_type.to_i].chargeback_tiers contains
      # 0-0 :start => 0.0, :finish => 20.0
      # 0-1 :start => 20.0, :finish => 40.0  <- this value will be changed to Infinity
      # 0-2 :start => 40.0, :finish => Infinity  <- this will be removed

      post :cb_tier_remove, :params => {:button => "remove", :index => "#{index_to_rate_type}-2"}

      change_form_value(:finish_0_1, "") # infinity

      rate_detail = ChargebackRate.find(chargeback_rate.id).chargeback_rate_details[index_to_rate_type.to_i]

      post :cb_rate_edit, :params => {:button => "save", :id => chargeback_rate.id}

      expect(rate_detail.chargeback_tiers[1].finish).to eq(Float::INFINITY)
    end

    def expect_chargeback_rate_to_eq_hash(expected_rate, rate_hash)
      rate_hash[:rates].sort_by! do |rd|
        if rd[:group].nil? || rd[:description].nil?
          field = if rd[:chargeable_field_id]
                    ChargeableField.find(rd[:chargeable_field_id])
                  else
                    ChargeableField.find_by(:metric => rd[:metric])
                  end
          [field.group, field.description]
        else
          [rd[:group], rd[:description]] # this can be after ManageIQ/manageiq#13960
        end
      end

      expect(expected_rate.chargeback_rate_details.count).to eq(rate_hash[:rates].count)

      expected_rate.chargeback_rate_details.each_with_index do |rate_detail, index|
        rate_detail_hash = rate_hash[:rates][index]

        expect(rate_detail).to have_attributes(rate_detail_hash.slice(*ChargebackRateDetail::FORM_ATTRIBUTES))
        expect(rate_detail.detail_currency.code).to eq(rate_detail_hash[:type_currency])

        rate_detail.chargeback_tiers.each_with_index do |tier, tier_index|
          tier_hash = rate_detail_hash[:tiers][tier_index]
          tier_hash[:finish] = ChargebackTier.to_float(tier_hash[:finish])
          expect(tier).to have_attributes(tier_hash)
        end
      end
    end

    context 'with default chargebacks rates' do
      let(:chargeback_rate_from_yaml) { File.join(ChargebackRate::FIXTURE_DIR, "chargeback_rates.yml") }
      let(:compute_chargeback_rate_hash_from_yaml) do
        rates_hash = YAML.load_file(chargeback_rate_from_yaml)
        rates_hash.find { |rate| rate[:rate_type] == "Compute" }
      end

      before do
        [ChargebackRateDetailCurrency, ChargebackRate].each(&:seed)
      end

      it "adds new chargeback rate using default values" do
        allow(controller).to receive(:load_edit).and_return(true)

        count_of_chargeback_rates = ChargebackRate.count

        post :x_button, :params => {:pressed => "chargeback_rates_new"}
        post :cb_rate_form_field_changed, :params => {:id => "new", :description => "chargeback rate 1"}
        post :cb_rate_edit, :params => {:button => "add"}

        expect(ChargebackRate.count).to eq(count_of_chargeback_rates + 1)

        new_chargeback_rate = ChargebackRate.last

        expect(File.exist?(chargeback_rate_from_yaml)).to be_truthy
        expect(new_chargeback_rate.description).to eq("chargeback rate 1")
        expect_chargeback_rate_to_eq_hash(new_chargeback_rate, compute_chargeback_rate_hash_from_yaml)
      end

      it "adds new chargeback rate and user adds and removes some tiers" do
        allow(controller).to receive(:load_edit).and_return(true)

        post :x_button, :params => {:pressed => "chargeback_rates_new"}
        post :cb_rate_form_field_changed, :params => {:id => "new", :description => "chargeback rate 1"}

        post :cb_tier_add, :params => {:button => "add", :detail_index => index_to_rate_type}
        post :cb_tier_remove, :params => {:button => "remove", :index => "#{index_to_rate_type}-1"}
        post :cb_tier_add, :params => {:button => "add", :detail_index => index_to_rate_type}
        post :cb_tier_add, :params => {:button => "add", :detail_index => index_to_rate_type}

        # add values to newly added tiers to be valid
        change_form_value(:finish_0_0, "20.0", "new")
        change_form_value(:start_0_1, "20.0", "new")
        change_form_value(:finish_0_1, "50.0", "new")
        change_form_value(:start_0_2, "50.0", "new")

        post :cb_rate_edit, :params => {:button => "add"}

        # change expected values from yaml
        compute_chargeback_rate_hash_from_yaml[:rates].sort_by! { |rd| [ChargeableField.find_by(:metric => rd[:metric]).group, rd[:description]] }
        compute_rates = compute_chargeback_rate_hash_from_yaml[:rates][index_to_rate_type.to_i]
        compute_rates[:tiers][0][:finish] = 20.0
        compute_rates[:tiers].push(:start => 20.0, :finish => 50.0)
        compute_rates[:tiers].push(:start => 50.0, :finish => Float::INFINITY)

        new_chargeback_rate = ChargebackRate.last
        expect_chargeback_rate_to_eq_hash(new_chargeback_rate, compute_chargeback_rate_hash_from_yaml.dup)
      end

      it "doesn't add new chargeback rate because some of tier has start value bigger than finish value" do
        allow(controller).to receive(:load_edit).and_return(true)

        post :x_button, :params => {:pressed => "chargeback_rates_new"}
        post :cb_rate_form_field_changed, :params => {:id => "new", :description => "chargeback rate 1"}

        post :cb_tier_add, :params => {:button => "add", :detail_index => index_to_rate_type}
        post :cb_tier_remove, :params => {:button => "remove", :index => "#{index_to_rate_type}-1"}
        post :cb_tier_add, :params => {:button => "add", :detail_index => index_to_rate_type}
        post :cb_tier_add, :params => {:button => "add", :detail_index => index_to_rate_type}

        # add values to newly added tiers to be valid
        change_form_value(:finish_0_0, "500.0", "new")
        change_form_value(:start_0_1, "500.0", "new")
        change_form_value(:finish_0_1, "50.0", "new")
        change_form_value(:start_0_2, "50.0", "new")

        post :cb_rate_edit, :params => {:button => "add"}

        flash_messages = assigns(:flash_array)

        expect(flash_messages.count).to eq(1)
        expected_message = "'Allocated CPU Count' finish value must be greater than start value."
        expect(flash_messages[0][:message]).to eq(expected_message)
      end
    end

    def convert_chargeback_rate_to_hash(rate)
      origin_chargeback_rate_hash = {}
      origin_chargeback_rate_hash[:rates] = []
      rate.chargeback_rate_details.each do |rate_detail|
        rate_detail_hash = rate_detail.slice(*ChargebackRateDetail::FORM_ATTRIBUTES)
        rate_detail_hash = Hash[rate_detail_hash.map { |(k, v)| [k.to_sym, v] }]
        rate_detail_hash[:group] = rate_detail.chargeable_field.group
        rate_detail_hash[:tiers] = []
        rate_detail.chargeback_tiers.each do |tier|
          tier_hash = tier.slice(*ChargebackTier::FORM_ATTRIBUTES)
          tier_hash = Hash[tier_hash.map { |(k, v)| [k.to_sym, v] }]
          rate_detail_hash[:tiers].push(tier_hash)
        end

        rate_detail_hash[:measure] = rate_detail.chargeable_field.detail_measure.name
        rate_detail_hash[:type_currency] = rate_detail.detail_currency.code
        origin_chargeback_rate_hash[:rates].push(rate_detail_hash)
      end
      origin_chargeback_rate_hash
    end

    let(:origin_chargeback_rate_hash) { convert_chargeback_rate_to_hash(chargeback_rate) }

    it "copy existing chargeback rate" do
      post :x_button, :params => {:pressed => "chargeback_rates_copy", :id => chargeback_rate.id}

      post :cb_rate_edit, :params => {:button => "add"}

      new_charge_back_rate = ChargebackRate.last

      expect(new_charge_back_rate.description).to eq("copy of #{chargeback_rate.description}")
      expect_chargeback_rate_to_eq_hash(new_charge_back_rate, origin_chargeback_rate_hash)
    end

    it "copy existing chargeback rate and user adds and removes some tiers" do
      post :x_button, :params => {:pressed => "chargeback_rates_copy", :id => chargeback_rate.id}

      # remove and add some tier
      post :cb_tier_add, :params => {:button => "add", :detail_index => index_to_rate_type}
      post :cb_tier_remove, :params => {:button => "remove", :index => "#{index_to_rate_type}-1"}
      post :cb_tier_remove, :params => {:button => "remove", :index => "#{index_to_rate_type}-1"}
      post :cb_tier_add, :params => {:button => "add", :detail_index => index_to_rate_type}

      # back set values back to origin values
      change_form_value(:start_0_1, "20.0", "new")
      change_form_value(:finish_0_1, "40.0", "new")
      change_form_value(:fixed_rate_0_1, "0.3", "new")
      change_form_value(:variable_rate_0_1, "0.4", "new")

      change_form_value(:start_0_2, "40.0", "new")
      change_form_value(:finish_0_2, "", "new")
      change_form_value(:fixed_rate_0_2, "0.5", "new")
      change_form_value(:variable_rate_0_2, "0.6", "new")

      post :cb_rate_edit, :params => {:button => "add"}

      new_charge_back_rate = ChargebackRate.last

      expect(new_charge_back_rate.description).to eq("copy of #{chargeback_rate.description}")
      expect_chargeback_rate_to_eq_hash(new_charge_back_rate, origin_chargeback_rate_hash)
    end

    it "doesn't store rate and displays validation message with invalid input of tiers(uncontiguous tiers)" do
      post :x_button, :params => {:pressed => "chargeback_rates_edit", :id => chargeback_rate.id}

      change_form_value(:start_0_1, "20.0")
      change_form_value(:finish_0_1, "40.0")
      change_form_value(:start_0_2, "60.0")
      change_form_value(:finish_0_2, "80.0")

      post :cb_rate_edit, :params => {:button => "save", :id => chargeback_rate.id}

      flash_messages = assigns(:flash_array)

      expect(flash_messages.count).to eq(1)
      expected_message = "'Allocated Memory' chargeback tiers must start at zero and "
      expected_message += "not contain any gaps between start and prior end value."
      expect(flash_messages[0][:message]).to eq(expected_message)
    end

    it "doesn't store rate and displays validation message with invalid input of tiers(non-numberic tiers)" do
      post :x_button, :params => {:pressed => "chargeback_rates_edit", :id => chargeback_rate.id}

      change_form_value(:start_0_1, "20.0typo")

      post :cb_rate_edit, :params => {:button => "save", :id => chargeback_rate.id}

      flash_messages = assigns(:flash_array)

      expect(flash_messages.count).to eq(1)
      expect(flash_messages[0][:message]).to eq("'Allocated Memory' start is not a number")
    end

    it "doesn't store rate and displays validation message with invalid input of tiers(ambiguous tiers)" do
      post :x_button, :params => {:pressed => "chargeback_rates_edit", :id => chargeback_rate.id}

      change_form_value(:finish_0_1, "20.0")
      change_form_value(:start_0_1, "20.0")
      change_form_value(:finish_0_1, "20.0")
      change_form_value(:start_0_2, "20.0")

      post :cb_rate_edit, :params => {:button => "save", :id => chargeback_rate.id}

      flash_messages = assigns(:flash_array)

      expect(flash_messages.count).to eq(1)
      expected_message = "'Allocated Memory' finish value must be greater than start value."
      expect(flash_messages[0][:message]).to eq(expected_message)
    end
  end

  describe "#cb_rpts_fetch_saved_report" do
    let(:current_user) { User.current_user }
    let(:miq_task)     { MiqTask.new(:name => "Generate Report result", :userid => current_user.userid) }
    let(:miq_report_result) do
      FactoryBot.create(:miq_chargeback_report_result, :miq_group => current_user.current_group, :miq_task => miq_task)
    end

    let(:chargeback_report) { FactoryBot.create(:miq_report_chargeback, :miq_report_results => [miq_report_result]) }

    before do
      miq_task.state_finished
      miq_report_result.report = chargeback_report.to_hash.merge(:extras=> {:total_html_rows => 100})
      miq_report_result.save
      controller.instance_variable_set(:@sb, {})
      controller.instance_variable_set(:@settings, :perpage => { :reports => 20 })
    end

    it "fetch existing report" do
      controller.send(:cb_rpts_fetch_saved_report, miq_report_result.id)

      fetched_report = controller.instance_variable_get(:@report)

      expect(fetched_report).not_to be_nil
      expect(fetched_report).to eq(chargeback_report)
    end
  end

  describe "#replace_right_cell" do
    it "Can build the :cb_rates tree" do
      seed_session_trees('chargeback', :cb_rates, 'root')
      session_to_sb

      expect(controller).to receive(:render)
      expect(controller).to receive(:reload_trees_by_presenter).with(
        instance_of(ExplorerPresenter),
        array_including(
          instance_of(TreeBuilderChargebackRates),
        )
      )
      controller.send(:replace_right_cell, :replace_trees => %i(cb_rates))
    end
  end

  describe '#cb_rates_delete' do
    let(:params) { {:id => rate.id} }
    let(:rate) { FactoryBot.create(:chargeback_rate, :rate_type => "Compute") }
    let(:sandbox) { {:active_tree => :cb_rates_tree, :trees => {:cb_rates_tree => {:active_node => "xx-#{rate.rate_type}_cr-#{rate.id}"}}} }

    before do
      allow(controller).to receive(:x_node).and_call_original
      allow(controller).to receive(:render).and_return(true)

      controller.params = params
      controller.instance_variable_set(:@sb, sandbox)
    end

    it 'sets right cell text properly' do
      controller.send(:cb_rates_delete)
      expect(controller.instance_variable_get(:@right_cell_text)).to eq("#{rate.rate_type} Chargeback Rates")
    end

    context 'deleting a list of rates' do
      let(:params) { {:miq_grid_checks => rate.id.to_s} }

      it 'calls cb_rates_list method when there are no errors' do
        expect(controller).to receive(:cb_rates_list)
        controller.send(:cb_rates_delete)
      end

      context 'no checked item found' do
        let(:params) { nil }

        it 'calls cb_rates_list method when there is an error' do
          expect(controller).to receive(:cb_rates_list)
          controller.send(:cb_rates_delete)
        end
      end
    end

    context 'deleting a rate from its details page' do
      it 'calls cb_rates_list method when there are no errors' do
        expect(controller).to receive(:cb_rates_list)
        controller.send(:cb_rates_delete)
      end

      context 'rate not found by id' do
        let(:params) { {:id => 123} }

        it 'calls cb_rates_list method when there is an error' do
          expect(controller).to receive(:cb_rates_list)
          controller.send(:cb_rates_delete)
        end
      end
    end
  end

  describe '#get_node_info' do
    let(:sandbox) { {:active_tree => :cb_rates_tree, :trees => {:cb_rates_tree => {:active_node => node}}} }

    before do
      controller.instance_variable_set(:@sb, sandbox)
    end

    context 'root node' do
      let(:node) { "root" }

      it 'sets right cell text properly' do
        controller.send(:get_node_info, node)
        expect(controller.instance_variable_get(:@right_cell_text)).to eq("All Chargeback Rates")
      end
    end
  end

  context "GenericSessionMixin" do
    let(:lastaction) { 'lastaction' }
    let(:display) { 'display' }
    let(:current_page) { 'current_page' }

    describe '#get_session_data' do
      it "Sets variables correctly" do
        allow(controller).to receive(:session).and_return(:chargeback_lastaction   => lastaction,
                                                          :chargeback_display      => display,
                                                          :chargeback_current_page => current_page)
        controller.send(:get_session_data)

        expect(controller.instance_variable_get(:@title)).to eq("Chargeback")
        expect(controller.instance_variable_get(:@layout)).to eq("chargeback")
        expect(controller.instance_variable_get(:@lastaction)).to eq(lastaction)
        expect(controller.instance_variable_get(:@display)).to eq(display)
        expect(controller.instance_variable_get(:@current_page)).to eq(current_page)
      end
    end

    describe '#set_session_data' do
      it "Sets session correctly" do
        controller.instance_variable_set(:@lastaction, lastaction)
        controller.instance_variable_set(:@display, display)
        controller.instance_variable_set(:@current_page, current_page)
        controller.send(:set_session_data)

        expect(controller.session[:chargeback_lastaction]).to eq(lastaction)
        expect(controller.session[:chargeback_display]).to eq(display)
        expect(controller.session[:chargeback_current_page]).to eq(current_page)
      end
    end
  end

  describe '#cb_assign_field_changed' do
    let(:edit) do
      {
        :cb_assign => {
          :cats => {
            '1' => 'Category1',
            '2' => 'Category2'
          },
          :tags => {
            1 => {
              '2' => 'Tag1',
              '3' => 'Tag2',
              '4' => 'Tag3'
            },
            2 => {}
          }
        },
        :current   => {
          :cbshow_typ       => 'storage-tags',
          :cbtag_cat        => '1',
          'storage-tags__2' => '3'
        },
        :new       => {
          :cbshow_typ       => 'storage-tags',
          :cbtag_cat        => '1',
          'storage-tags__2' => '3'
        }
      }
    end

    before do
      allow(controller).to receive(:load_edit).and_return(true)
      controller.instance_variable_set(:@edit, edit)
    end

    context 'changing Tag Category for assignments' do
      it 'hides buttons as no change has been made' do
        post :cb_assign_field_changed, :params => {:cbtag_cat => '2'}
        expect(response.body).to include("miqButtons('hide');")
      end
    end

    context 'changing Assigned To, for assignments' do
      it 'hides buttons as no change has been made' do
        post :cb_assign_field_changed, :params => {:cbshow_typ => 'storage'}
        expect(response.body).to include("miqButtons('hide');")
      end
    end

    context 'changing item under Selections, for assignments' do
      it 'shows buttons as a change in Selections has been made' do
        post :cb_assign_field_changed, :params => {'storage-tags__3' => '4'}
        expect(response.body).to include("miqButtons('show');")
      end
    end
  end
end
