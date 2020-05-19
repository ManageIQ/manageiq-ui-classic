describe ChargebackRateController do
  before { stub_user(:features => :all) }

  describe "#show_list" do
    render_views

    it "renders index" do
      get :index
      expect(response.status).to eq(302)
      expect(response).to redirect_to(:action => 'show_list')
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
      post :form_field_changed, :params => {:id => resource_action, field => value}
    end

    it "renders edit form" do
      post :button, :params => {:pressed => "chargeback_rates_edit", :id => chargeback_rate.id}
      expect(response.status).to eq(200)
      expect(response.body).to_not be_empty
      expect(response.body).to include("window.location.href")
      expect(response.body).to include("/chargeback_rate/edit")
    end

    it "removes requested tier line from edit from" do
      controller.params = {:id => chargeback_rate.id.to_s}
      controller.send(:edit)
      post :tier_remove, :params => {:button => "remove", :index => "0-1"}

      response_body = response.body.delete('\\').gsub('u003e', ">").gsub('u003c', "<")

      expect(response).to render_template(:partial => 'chargeback_rate/_cb_rate_edit_table')

      expect_rendered_tiers(response_body, [{:start => "0.0", :finish => "20.0"},
                                            {:start => "40.0", :finish => Float::INFINITY}])

      expect_rendered_tiers(response_body, [{:start => "0.0", :finish => Float::INFINITY}], 1)
    end

    it "removes requested tier line and add 2 new tiers line from edit from" do
      count_of_tiers = chargeback_rate.chargeback_rate_details[index_to_rate_type.to_i].chargeback_tiers.count
      controller.params = {:id => chargeback_rate.id.to_s}
      controller.send(:edit)
      post :tier_remove, :params => {:button => "remove", :index => "#{index_to_rate_type}-1"}
      post :tier_add, :params => {:button => "add", :detail_index => index_to_rate_type}
      post :tier_add, :params => {:button => "add", :detail_index => index_to_rate_type}

      response_body = response.body.delete('\\').gsub('u003e', ">").gsub('u003c', "<")

      count_of_last_tier = count_of_tiers - 1 + 2 # one tier removed, two tiers added
      selector = "#{index_to_rate_type}_#{count_of_last_tier - 1}"
      expect_input(response_body, "start_#{selector}", "")
      expect_input(response_body, "finish_#{selector}", "")
    end

    it "saves edited chargeback rate" do
      controller.params = {:id => chargeback_rate.id.to_s}
      controller.send(:edit)

      # remove second tier for rate detail; (values  {:start => "20.0", :finish => "40.0"})
      post :tier_remove, :params => {:button => "remove", :index => "#{index_to_rate_type}-1"}

      # add new tier, new position is index_to_rate_type-1
      post :tier_add, :params => {:button => "add", :detail_index => index_to_rate_type}

      # add new tier at, new position is index_to_rate_type-2
      post :tier_add, :params => {:button => "add", :detail_index => index_to_rate_type}

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

      post :edit, :params => {:button => "save", :id => chargeback_rate.id}

      rate_detail = ChargebackRate.find(chargeback_rate.id).chargeback_rate_details[index_to_rate_type.to_i]
      expect(rate_detail.chargeback_tiers[0]).to have_attributes(:start => 0.0, :finish => 20.0)
      expect(rate_detail.chargeback_tiers[1]).to have_attributes(:start => 20.0, :finish => 50.0)
      expect(rate_detail.chargeback_tiers[2]).to have_attributes(:start => 50.0, :finish => 70.0)
      expect(rate_detail.chargeback_tiers[3]).to have_attributes(:start => 70.0, :finish => Float::INFINITY)
    end

    it "saves edited chargeback rate when 'per unit' is changed" do
      controller.params = {:id => chargeback_rate.id.to_s}
      controller.send(:edit)

      change_form_value(:per_time_0, "monthly")

      post :edit, :params => {:button => "save", :id => chargeback_rate.id}

      rate_detail = ChargebackRate.find(chargeback_rate.id).chargeback_rate_details[index_to_rate_type.to_i]
      expect(rate_detail.per_time).to eq("monthly")
    end

    it "saves edited chargeback rate when 'per time' is changed" do
      controller.params = {:id => chargeback_rate.id.to_s}
      controller.send(:edit)

      change_form_value(:per_unit_1, "teraherts")

      post :edit, :params => {:button => "save", :id => chargeback_rate.id}

      rate_detail = ChargebackRate.find(chargeback_rate.id).chargeback_rate_details[1]
      expect(rate_detail.per_unit).to eq("teraherts")
    end

    it "saves edited chargeback rate when value in finish column is changed to infinity (infinity is blank string)" do
      controller.params = {:id => chargeback_rate.id.to_s}
      controller.send(:edit)
      # chargeback_rate[index_to_rate_type.to_i].chargeback_tiers contains
      # 0-0 :start => 0.0, :finish => 20.0
      # 0-1 :start => 20.0, :finish => 40.0  <- this value will be changed to Infinity
      # 0-2 :start => 40.0, :finish => Infinity  <- this will be removed

      post :tier_remove, :params => {:button => "remove", :index => "#{index_to_rate_type}-2"}

      change_form_value(:finish_0_1, "") # infinity

      rate_detail = ChargebackRate.find(chargeback_rate.id).chargeback_rate_details[index_to_rate_type.to_i]

      post :edit, :params => {:button => "save", :id => chargeback_rate.id}

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
        [Currency, ChargebackRate].each(&:seed)
      end

      it "adds new chargeback rate using default values" do
        allow(controller).to receive(:load_edit).and_return(true)

        count_of_chargeback_rates = ChargebackRate.count

        controller.send(:edit)
        post :form_field_changed, :params => {:id => "new", :description => "chargeback rate 1"}
        post :edit, :params => {:button => "add"}

        expect(ChargebackRate.count).to eq(count_of_chargeback_rates + 1)

        new_chargeback_rate = ChargebackRate.last

        expect(File.exist?(chargeback_rate_from_yaml)).to be_truthy
        expect(new_chargeback_rate.description).to eq("chargeback rate 1")
        expect_chargeback_rate_to_eq_hash(new_chargeback_rate, compute_chargeback_rate_hash_from_yaml)
      end

      it "adds new chargeback rate and user adds and removes some tiers" do
        allow(controller).to receive(:load_edit).and_return(true)

        controller.send(:edit)
        post :form_field_changed, :params => {:id => "new", :description => "chargeback rate 1"}

        post :tier_add, :params => {:button => "add", :detail_index => index_to_rate_type}
        post :tier_remove, :params => {:button => "remove", :index => "#{index_to_rate_type}-1"}
        post :tier_add, :params => {:button => "add", :detail_index => index_to_rate_type}
        post :tier_add, :params => {:button => "add", :detail_index => index_to_rate_type}

        # add values to newly added tiers to be valid
        change_form_value(:finish_0_0, "20.0", "new")
        change_form_value(:start_0_1, "20.0", "new")
        change_form_value(:finish_0_1, "50.0", "new")
        change_form_value(:start_0_2, "50.0", "new")

        post :edit, :params => {:button => "add"}

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

        controller.send(:edit)
        post :form_field_changed, :params => {:id => "new", :description => "chargeback rate 1"}

        post :tier_add, :params => {:button => "add", :detail_index => index_to_rate_type}
        post :tier_remove, :params => {:button => "remove", :index => "#{index_to_rate_type}-1"}
        post :tier_add, :params => {:button => "add", :detail_index => index_to_rate_type}
        post :tier_add, :params => {:button => "add", :detail_index => index_to_rate_type}

        # add values to newly added tiers to be valid
        change_form_value(:finish_0_0, "500.0", "new")
        change_form_value(:start_0_1, "500.0", "new")
        change_form_value(:finish_0_1, "50.0", "new")
        change_form_value(:start_0_2, "50.0", "new")

        post :edit, :params => {:button => "add"}

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
      controller.params = {:id => chargeback_rate.id.to_s, :pressed => "chargeback_rates_copy"}
      controller.send(:edit)

      post :edit, :params => {:button => "add"}

      new_charge_back_rate = ChargebackRate.last

      expect(new_charge_back_rate.description).to eq("copy of #{chargeback_rate.description}")
      expect_chargeback_rate_to_eq_hash(new_charge_back_rate, origin_chargeback_rate_hash)
    end

    it "copy existing chargeback rate and user adds and removes some tiers" do
      controller.params = {:id => chargeback_rate.id.to_s, :pressed => "chargeback_rates_copy"}
      controller.send(:edit)

      # remove and add some tier
      post :tier_add, :params => {:button => "add", :detail_index => index_to_rate_type}
      post :tier_remove, :params => {:button => "remove", :index => "#{index_to_rate_type}-1"}
      post :tier_remove, :params => {:button => "remove", :index => "#{index_to_rate_type}-1"}
      post :tier_add, :params => {:button => "add", :detail_index => index_to_rate_type}

      # back set values back to origin values
      change_form_value(:start_0_1, "20.0", "new")
      change_form_value(:finish_0_1, "40.0", "new")
      change_form_value(:fixed_rate_0_1, "0.3", "new")
      change_form_value(:variable_rate_0_1, "0.4", "new")

      change_form_value(:start_0_2, "40.0", "new")
      change_form_value(:finish_0_2, "", "new")
      change_form_value(:fixed_rate_0_2, "0.5", "new")
      change_form_value(:variable_rate_0_2, "0.6", "new")

      post :edit, :params => {:button => "add"}

      new_charge_back_rate = ChargebackRate.last

      expect(new_charge_back_rate.description).to eq("copy of #{chargeback_rate.description}")
      expect_chargeback_rate_to_eq_hash(new_charge_back_rate, origin_chargeback_rate_hash)
    end

    it "doesn't store rate and displays validation message with invalid input of tiers(uncontiguous tiers)" do
      controller.params = {:id => chargeback_rate.id.to_s}
      controller.send(:edit)

      change_form_value(:start_0_1, "20.0")
      change_form_value(:finish_0_1, "40.0")
      change_form_value(:start_0_2, "60.0")
      change_form_value(:finish_0_2, "80.0")

      post :edit, :params => {:button => "save", :id => chargeback_rate.id}

      flash_messages = assigns(:flash_array)

      expect(flash_messages.count).to eq(1)
      expected_message = "'Allocated Memory' chargeback tiers must start at zero and "
      expected_message += "not contain any gaps between start and prior end value."
      expect(flash_messages[0][:message]).to eq(expected_message)
    end

    it "doesn't store rate and displays validation message with invalid input of tiers(non-numeric tiers)" do
      controller.params = {:id => chargeback_rate.id.to_s}
      controller.send(:edit)

      change_form_value(:start_0_1, "20.0typo")

      post :edit, :params => {:button => "save", :id => chargeback_rate.id}

      flash_messages = assigns(:flash_array)

      expect(flash_messages.count).to eq(1)
      expect(flash_messages[0][:message]).to eq("'Allocated Memory' start is not a number")
    end

    it "doesn't store rate and displays validation message with invalid input of tiers(ambiguous tiers)" do
      controller.params = {:id => chargeback_rate.id.to_s}
      controller.send(:edit)

      change_form_value(:finish_0_1, "20.0")
      change_form_value(:start_0_1, "20.0")
      change_form_value(:finish_0_1, "20.0")
      change_form_value(:start_0_2, "20.0")

      post :edit, :params => {:button => "save", :id => chargeback_rate.id}

      flash_messages = assigns(:flash_array)

      expect(flash_messages.count).to eq(1)
      expected_message = "'Allocated Memory' finish value must be greater than start value."
      expect(flash_messages[0][:message]).to eq(expected_message)
    end
  end

  describe '#cb_rates_delete' do
    let(:params) { {:id => rate.id} }
    let(:rate) { FactoryBot.create(:chargeback_rate, :rate_type => "Compute") }
    let(:sandbox) { {:active_tree => :cb_rates_tree, :trees => {:cb_rates_tree => {:active_node => "xx-#{rate.rate_type}_cr-#{rate.id}"}}} }

    before do
      allow(controller).to receive(:render).and_return(true)
      controller.params = params
    end

    it 'sets right cell text properly' do
      post :button, :params => {:pressed => "chargeback_rates_delete", :id => rate.id}
      flash_array = assigns(:flash_array)
      expect(flash_array.first[:message]).to include("Delete successful")
    end

    context 'deleting a list of rates' do
      let(:params) { {:miq_grid_checks => rate.id.to_s} }

      it 'calls show_list method when there are no errors' do
        expect(controller).to receive(:javascript_redirect).with({:action => 'show_list'})
        post :button, :params => {:pressed => "chargeback_rates_delete", :id => rate.id}
        flash_messages = assigns(:flash_array)
        expect(flash_messages.first[:message]).to include("Chargeback Rate \"#{rate.description}\": Delete successful")
      end

      context 'no checked item found' do
        let(:params) { nil }

        it 'calls show_list method when there is an error' do
          expect(controller).to receive(:javascript_redirect).with({:action => 'show_list'})
          post :button, :params => {:pressed => "chargeback_rates_delete", :id => rate.id}
          flash_messages = assigns(:flash_array)
          expect(flash_messages.first[:message]).to include("Chargeback Rate \"#{rate.description}\": Delete successful")
        end
      end
    end

    context 'deleting a rate from its details page' do
      it 'calls show_list method when there are no errors' do
        expect(controller).to receive(:javascript_redirect).with({:action => 'show_list'})
        post :button, :params => {:pressed => "chargeback_rates_delete", :id => rate.id}
        flash_messages = assigns(:flash_array)
        expect(flash_messages.first[:message]).to include("Chargeback Rate \"#{rate.description}\": Delete successful")
      end

      context 'rate not found by id' do
        let(:params) { {:id => 123} }

        it 'calls show_list method when there is an error' do
          expect(controller).to receive(:javascript_redirect).with({:action => 'show_list'})
          post :button, :params => {:pressed => "chargeback_rates_delete", :id => rate.id}
          flash_messages = assigns(:flash_array)
          expect(flash_messages.first[:message]).to include("Chargeback Rate \"#{rate.description}\": Delete successful")
        end
      end
    end
  end
end
