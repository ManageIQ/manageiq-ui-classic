describe ApplicationController do
  describe "#get_tagdata" do
    let(:record) { double("Host") }
    let(:user) { FactoryBot.create(:user, :userid => "testuser") }

    before do
      login_as user
      allow(record).to receive(:tagged_with).with(:cat => user.userid).and_return("my tags")
      allow(Classification).to receive(:find_assigned_entries).with(record).and_return(classifications)
    end

    context "when classifications exist" do
      let(:parent) { double("Parent", :description => "Department") }
      let(:child1) { double("Child1", :parent => parent, :description => "Automotive") }
      let(:child2) { double("Child2", :parent => parent, :description => "Financial Services") }
      let(:classifications) { [child1, child2] }

      it "populates the assigned filters in the session" do
        controller.send(:get_tagdata, record)
        expect(session[:assigned_filters]['Department']).to eq(["Automotive", "Financial Services"])
        expect(session[:mytags]).to eq("my tags")
      end
    end

    context "when classifications do not exist" do
      let(:classifications) { [] }

      it "sets the assigned filters to an empty hash in the session" do
        controller.send(:get_tagdata, record)
        expect(session[:assigned_filters]).to eq({})
        expect(session[:mytags]).to eq("my tags")
      end
    end
  end

  context "tag_edit_build_screen" do
    def add_entry(cat, options)
      raise "entries can only be added to classifications" unless cat.category?
      # Inherit from parent classification
      options.merge!(:read_only    => cat.read_only,
                     :syntax       => cat.syntax,
                     :single_value => cat.single_value,
                     :ns           => cat.ns)
      options[:parent_id] = cat.id # Ugly way to set up a child
      FactoryBot.create(:classification, options)
    end

    # creating record in different region
    def update_record_region(record)
      record.update_column(:id, record.id + MiqRegion.rails_sequence_factor)
    end

    # convert record id into region id
    def convert_to_region_id(id)
      MiqRegion.id_to_region(id)
    end

    before do
      # setup classification/entries with same name in different regions
      clergy = FactoryBot.create(:classification, :description => "Clergy")
      add_entry(clergy, :name => "bishop", :description => "Bishop")

      # add another classification with different description,
      # then change description to be same as above after updating region id of record
      clergy2 = FactoryBot.create(:classification, :description => "Clergy2")
      update_record_region(clergy2)
      clergy2.update_column(:description, "Clergy")

      clergy_bishop2 = add_entry(clergy2, :name => "bishop", :description => "Bishop")
      update_record_region(clergy_bishop2)

      allow(Classification).to receive(:my_region_number).and_return(convert_to_region_id(clergy_bishop2.id))
      @st = FactoryBot.create(:service_template, :name => 'foo')
    end

    it "region id of classification/entries should match" do
      # only classification/entries from same region should be returned
      controller.instance_variable_set(:@edit, :new => {})
      controller.instance_variable_set(:@tagging, 'ServiceTemplate')
      controller.instance_variable_set(:@object_ids, [@st.id])
      session[:assigned_filters] = {:Test => %w("Entry1 Entry2)}

      controller.send(:tag_edit_build_screen)
      expect(convert_to_region_id(assigns(:categories)['Clergy']))
        .to eq(convert_to_region_id(assigns(:entries)['Bishop']))
    end
  end

  describe '#tagging_edit' do
    let(:params) { nil }
    let(:s) { nil }

    before do
      allow(controller).to receive(:assert_privileges)
      allow(controller).to receive(:session).and_return(s)

      controller.instance_variable_set(:@_params, params)
    end

    context 'resetting changes' do
      let(:params) { {:button => "reset"} }
      let(:s) { {:tag_db => VmOrTemplate} }

      before do
        allow(controller).to receive(:tagging_edit_tags_reset)
      end

      it 'sets @tagging properly' do
        controller.send(:tagging_edit)
        expect(controller.instance_variable_get(:@tagging)).not_to be_nil
      end
    end
  end

  describe EmsInfraController do
    before do
      login_as FactoryBot.create(:user, :features => %w(storage_tag))
      controller.instance_variable_set(:@_params, params)
      controller.instance_variable_set(:@display, "storages")
    end

    context 'check for correct feature id when tagging selected storage thru Provider relationship' do
      let(:params) { {:db => "Storage", :id => "1"} }
      it 'sets @tagging properly' do
        allow(controller).to receive(:tagging_edit_tags_reset)
        controller.send(:tagging_edit)
        expect(controller.instance_variable_get(:@tagging)).not_to be_nil
      end
    end
  end
end
