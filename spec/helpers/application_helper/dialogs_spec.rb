describe ApplicationHelper::Dialogs do
  let(:dialog_field) do
    double(
      "DialogField",
      :id                   => "100",
      :read_only            => read_only,
      :trigger_auto_refresh => trigger_auto_refresh,
      :force_multi_value    => true,
      :show_past_dates      => true,
    )
  end
  let(:trigger_auto_refresh) { nil }

  describe "#dialog_dropdown_select_values" do
    let(:dialog_field) { instance_double("DialogFieldDropDownList", :values => values, :type => type) }

    context "when the field type includes drop down" do
      let(:type) { "BananaDropDown" }
      let(:values) { [%w(cat Cat), %w(dog Dog)] }

      it "returns the values collected and reversed" do
        reversed_values = values.collect(&:reverse)
        expect(helper.dialog_dropdown_select_values(dialog_field)).to eq(reversed_values)
      end
    end

    context "when the field type includes tag control" do
      let(:type) { "BananaTagControl" }
      let(:values) { [{:description => "Cat", :id => 123}, {:description => "Dog", :id => 321}] }

      it "returns the values mapped to a description and id" do
        expect(helper.dialog_dropdown_select_values(dialog_field)).to eq([["Cat", 123], ["Dog", 321]])
      end
    end
  end

  describe "#dialog_dropdown_selected_value" do
    let(:dialog_field) { instance_double("DialogFieldDropDownList", :values => values, :type => type, :value => value) }
    let(:type) { "OneDropDown" }
    let(:values) { [%w(key1 Val1), %w(key2 Val2)] }
    let(:value) { nil }

    context "when the the selected item exists in the values list" do
      let(:value) { 'key2' }
      it "returns the value for the selected item" do
        expect(helper.dialog_dropdown_selected_value(dialog_field)).to eq('Val2')
      end
    end

    context "when the the selected item does not exists in the values list" do
      let(:value) { 'oldkey' }
      it "returns the key value for the selected item" do
        expect(helper.dialog_dropdown_selected_value(dialog_field)).to eq('oldkey')
      end
    end

    context "shows a list of display values for multiselect" do
      let(:values) { [%w(key1 Val1), %w(key2 Val2), %w(key3 Val3), %w(key4 Val4)] }
      let(:value) { 'key2,key4' }
      it "returns the key value for the selected item" do
        expect(helper.dialog_dropdown_selected_value(dialog_field)).to eq('Val2,Val4')
      end
    end

    context "shows a list of display values and keys for multiselect when some keys not in values" do
      let(:values) { [%w(key1 Val1), %w(key2 Val2), %w(key3 Val3), %w(key4 Val4)] }
      let(:value) { 'oldkey,key4' }
      it "returns the key value for the selected item" do
        expect(helper.dialog_dropdown_selected_value(dialog_field)).to eq('oldkey,Val4')
      end
    end

    context "when the drop down option list is empty" do
      let(:values) {}
      let(:value) { 'key' }

      it "returns the field value if the options list is empty" do
        expect(helper.dialog_dropdown_selected_value(dialog_field)).to eq('key')
      end
    end

    context "can display an integer dropdown value" do
      let(:values) { [[1, 'one']] }
      let(:value) { 1 }

      it "returns the field value if the options list is empty" do
        expect(helper.dialog_dropdown_selected_value(dialog_field)).to eq('one')
      end
    end
  end

  describe "#category_tags" do
    before do
      allow(Classification).to receive(:find_by).with(:id => 123).and_return(classification)
    end

    context "when the category exists with the given id" do
      let(:classification) { instance_double("Classification", :entries => [entry1, entry2]) }
      let(:entry1) { instance_double("Classification", :name => "cat", :description => "Cat") }
      let(:entry2) { instance_double("Classification", :name => "dog", :description => "Dog") }

      it "returns a list of entries by name and description" do
        expect(helper.category_tags(123)).to eq([
                                                  {:name => "cat", :description => "Cat"},
                                                  {:name => "dog", :description => "Dog"}
                                                ])
      end
    end

    context "when the category does not exist by the given id" do
      let(:classification) { nil }

      it "returns an empty array" do
        expect(helper.category_tags(123)).to eq([])
      end
    end
  end

  describe "#textbox_tag_options" do
    let(:auto_refresh_options_hash) do
      {
        :tab_index                       => "100",
        :group_index                     => "200",
        :field_index                     => "300",
        :auto_refreshable_field_indicies => [1, 2, 3],
        :current_index                   => 123,
        :trigger                         => "true",
        :initial_trigger                 => true
      }
    end

    context "when the field is read_only" do
      let(:read_only) { true }

      it "returns the tag options with a disabled true" do
        expect(helper.textbox_tag_options(dialog_field, "url", auto_refresh_options_hash)).to eq(
          :maxlength => 50,
          :class     => "dynamic-text-box-100 form-control",
          :disabled  => true,
          :title     => "This element is disabled because it is read only"
        )
      end
    end

    context "when the dialog field is not read only" do
      let(:read_only) { false }

      context "when the dialog field does not trigger auto refresh" do
        let(:trigger_auto_refresh) { false }

        it "returns the tag options with a data-miq-observe" do
          expect(helper.textbox_tag_options(dialog_field, "url", auto_refresh_options_hash)).to eq(
            :maxlength         => 50,
            :class             => "dynamic-text-box-100 form-control",
            "data-miq_observe" => '{"url":"url"}'
          )
        end
      end

      context "when the dialog field triggers auto refresh" do
        let(:trigger_auto_refresh) { true }

        it "returns the tag options with a data-miq-observe" do
          expect(helper.textbox_tag_options(dialog_field, "url", auto_refresh_options_hash)).to eq(
            :maxlength         => 50,
            :class             => "dynamic-text-box-100 form-control",
            "data-miq_observe" => {
              :url                             => "url",
              :auto_refresh                    => true,
              :tab_index                       => "100",
              :group_index                     => "200",
              :field_index                     => "300",
              :auto_refreshable_field_indicies => [1, 2, 3],
              :current_index                   => 123,
              :trigger                         => "true",
              :initial_trigger                 => true
            }.to_json
          )
        end
      end
    end
  end

  describe "#textarea_tag_options" do
    let(:auto_refresh_options_hash) do
      {
        :tab_index                       => "100",
        :group_index                     => "200",
        :field_index                     => "300",
        :auto_refreshable_field_indicies => [1, 2, 3],
        :current_index                   => 123,
        :trigger                         => "true"
      }
    end

    context "when the field is read_only" do
      let(:read_only) { true }

      it "returns the tag options with a disabled true" do
        expect(helper.textarea_tag_options(dialog_field, "url", auto_refresh_options_hash)).to eq(
          :class    => "dynamic-text-area-100 form-control",
          :size     => "50x6",
          :disabled => true,
          :title    => "This element is disabled because it is read only"
        )
      end
    end

    context "when the dialog field is not read only" do
      let(:read_only) { false }

      context "when the dialog field triggers auto refresh" do
        let(:trigger_auto_refresh) { true }

        it "returns the tag options with a data-miq-observe" do
          expect(helper.textarea_tag_options(dialog_field, "url", auto_refresh_options_hash)).to eq(
            :class             => "dynamic-text-area-100 form-control",
            :size              => "50x6",
            "data-miq_observe" => {
              :url                             => "url",
              :auto_refresh                    => true,
              :tab_index                       => "100",
              :group_index                     => "200",
              :field_index                     => "300",
              :auto_refreshable_field_indicies => [1, 2, 3],
              :current_index                   => 123,
              :trigger                         => "true",
              :initial_trigger                 => nil
            }.to_json
          )
        end
      end

      context "when the dialog field does not trigger auto refresh" do
        let(:trigger_auto_refresh) { false }

        it "returns the tag options with a data-miq-observe" do
          expect(helper.textarea_tag_options(dialog_field, "url", auto_refresh_options_hash)).to eq(
            :class             => "dynamic-text-area-100 form-control",
            :size              => "50x6",
            "data-miq_observe" => '{"url":"url"}'
          )
        end
      end
    end
  end

  describe "#checkbox_tag_options" do
    let(:auto_refresh_options_hash) do
      {
        :tab_index                       => "100",
        :group_index                     => "200",
        :field_index                     => "300",
        :auto_refreshable_field_indicies => [1, 2, 3],
        :current_index                   => 123,
        :trigger                         => "true",
        :initial_trigger                 => false
      }
    end

    context "when the field is read_only" do
      let(:read_only) { true }

      it "returns the tag options with a disabled true" do
        expect(helper.checkbox_tag_options(dialog_field, "url", auto_refresh_options_hash)).to eq(
          :class    => "dynamic-checkbox-100",
          :disabled => true,
          :title    => "This element is disabled because it is read only"
        )
      end
    end

    context "when the dialog field is not read only" do
      let(:read_only) { false }

      context "when the dialog field triggers auto refresh" do
        let(:trigger_auto_refresh) { true }

        it "returns the tag options with a few data-miq attributes" do
          expect(helper.checkbox_tag_options(dialog_field, "url", auto_refresh_options_hash)).to eq(
            :class                      => "dynamic-checkbox-100",
            "data-miq_sparkle_on"       => true,
            "data-miq_sparkle_off"      => true,
            "data-miq_observe_checkbox" => {
              :url                             => "url",
              :auto_refresh                    => true,
              :tab_index                       => "100",
              :group_index                     => "200",
              :field_index                     => "300",
              :auto_refreshable_field_indicies => [1, 2, 3],
              :current_index                   => 123,
              :trigger                         => "true",
              :initial_trigger                 => false
            }.to_json
          )
        end
      end

      context "when the dialog field does not trigger auto refresh" do
        let(:trigger_auto_refresh) { false }

        it "returns the tag options with a few data-miq attributes" do
          expect(helper.checkbox_tag_options(dialog_field, "url", auto_refresh_options_hash)).to eq(
            :class                      => "dynamic-checkbox-100",
            "data-miq_sparkle_on"       => true,
            "data-miq_sparkle_off"      => true,
            "data-miq_observe_checkbox" => '{"url":"url"}'
          )
        end
      end
    end
  end

  describe "#date_tag_options" do
    let(:auto_refresh_options_hash) do
      {
        :tab_index                       => "100",
        :group_index                     => "200",
        :field_index                     => "300",
        :auto_refreshable_field_indicies => [1, 2, 3],
        :current_index                   => 123,
        :trigger                         => "true"
      }
    end

    context "when the field is read_only" do
      let(:read_only) { true }

      it "returns the tag options with a disabled true" do
        expect(helper.date_tag_options(dialog_field, "url", auto_refresh_options_hash)).to eq(
          :class    => "css1 dynamic-date-100",
          :readonly => "true",
          :disabled => true,
          :title    => "This element is disabled because it is read only"
        )
      end
    end

    context "when the dialog field is not read only" do
      let(:read_only) { false }

      context "when the dialog field triggers auto refresh" do
        let(:trigger_auto_refresh) { true }

        it "returns the tag options with a few data-miq attributes" do
          expect(helper.date_tag_options(dialog_field, "url", auto_refresh_options_hash)).to eq(
            :class                  => "css1 dynamic-date-100",
            :readonly               => "true",
            "data_date_start"       => nil,
            "data-miq_observe_date" => {
              :url                             => "url",
              :auto_refresh                    => true,
              :tab_index                       => "100",
              :group_index                     => "200",
              :field_index                     => "300",
              :auto_refreshable_field_indicies => [1, 2, 3],
              :current_index                   => 123,
              :trigger                         => "true",
              :initial_trigger                 => nil
            }.to_json
          )
        end
      end

      context "when the dialog field does not trigger auto refresh" do
        let(:trigger_auto_refresh) { false }

        it "returns the tag options with a few data-miq attributes" do
          expect(helper.date_tag_options(dialog_field, "url", auto_refresh_options_hash)).to eq(
            :class                  => "css1 dynamic-date-100",
            :readonly               => "true",
            "data_date_start"       => nil,
            "data-miq_observe_date" => '{"url":"url"}'
          )
        end
      end
    end
  end

  describe "#time_tag_options" do
    let(:auto_refresh_options_hash) do
      {
        :tab_index                       => "100",
        :group_index                     => "200",
        :field_index                     => "300",
        :auto_refreshable_field_indicies => [1, 2, 3],
        :current_index                   => 123,
        :trigger                         => "true"
      }
    end

    context "when the field is read_only" do
      let(:read_only) { true }

      it "returns the tag options with a disabled true" do
        expect(helper.time_tag_options(dialog_field, "url", "hour_or_min", auto_refresh_options_hash)).to eq(
          :class    => "dynamic-date-hour_or_min-100",
          :disabled => true,
          :title    => "This element is disabled because it is read only"
        )
      end
    end

    context "when the dialog field is not read only" do
      let(:read_only) { false }

      context "when the dialog field triggers auto refresh" do
        let(:trigger_auto_refresh) { true }

        it "returns the tag options with a few data-miq attributes" do
          expect(helper.time_tag_options(dialog_field, "url", "hour_or_min", auto_refresh_options_hash)).to eq(
            :class             => "dynamic-date-hour_or_min-100",
            "data_date_start"  => nil,
            "data-miq_observe" => {
              :url                             => "url",
              :auto_refresh                    => true,
              :tab_index                       => "100",
              :group_index                     => "200",
              :field_index                     => "300",
              :auto_refreshable_field_indicies => [1, 2, 3],
              :current_index                   => 123,
              :trigger                         => "true",
              :initial_trigger                 => nil
            }.to_json
          )
        end
      end

      context "when the dialog field does not trigger auto refresh" do
        let(:trigger_auto_refresh) { false }

        it "returns the tag options with a few data-miq attributes" do
          expect(helper.time_tag_options(dialog_field, "url", "hour_or_min", auto_refresh_options_hash)).to eq(
            :class             => "dynamic-date-hour_or_min-100",
            "data_date_start"  => nil,
            "data-miq_observe" => '{"url":"url"}'
          )
        end
      end
    end
  end

  describe "#drop_down_options" do
    context "when the field is read_only" do
      let(:read_only) { true }

      it "returns the tag options with a disabled true" do
        expect(helper.drop_down_options(dialog_field, "url")).to eq(
          :class    => "dynamic-drop-down-100 selectpicker",
          :disabled => true,
          :title    => "This element is disabled because it is read only",
        )
      end
    end

    context "when the dialog field is not read only" do
      let(:read_only) { false }

      context "when the dialog field triggers auto refresh" do
        let(:trigger_auto_refresh) { true }

        it "returns the tag options with a few data-miq attributes" do
          expect(helper.drop_down_options(dialog_field, "url")).to eq(
            :class                 => "dynamic-drop-down-100 selectpicker",
            "data-miq_sparkle_on"  => true,
            "data-miq_sparkle_off" => true,
            "data-live-search"     => true,
            :multiple              => "multiple"
          )
        end
      end

      context "when the dialog field does not trigger auto refresh" do
        let(:trigger_auto_refresh) { false }

        it "returns the tag options with a few data-miq attributes" do
          expect(helper.drop_down_options(dialog_field, "url")).to eq(
            :class                 => "dynamic-drop-down-100 selectpicker",
            "data-miq_sparkle_on"  => true,
            "data-miq_sparkle_off" => true,
            "data-live-search"     => true,
            :multiple              => "multiple"
          )
        end
      end
    end
  end

  describe "#radio_options" do
    let(:dialog_field) do
      double(
        "DialogField",
        :default_value        => "some_value",
        :name                 => "field_name",
        :id                   => "100",
        :read_only            => read_only,
        :trigger_auto_refresh => trigger_auto_refresh,
        :value                => value
      )
    end

    context "when the field is read_only" do
      let(:read_only) { true }
      let(:selected_value) { "some_value" }

      context "when the current value is equal to the default value" do
        let(:value) { "some_value" }

        it "returns the tag options with a disabled true and checked" do
          expect(helper.radio_options(dialog_field, "url", value, selected_value)).to eq(
            :type     => "radio",
            :class    => "100",
            :value    => "some_value",
            :name     => "field_name",
            :checked  => '',
            :disabled => true,
            :title    => "This element is disabled because it is read only"
          )
        end
      end

      context "when the current value is not equal to the default value" do
        let(:value) { "bogus" }

        it "returns the tag options with a disabled true and checked" do
          expect(helper.radio_options(dialog_field, "url", value, selected_value)).to eq(
            :type     => "radio",
            :class    => "100",
            :value    => "bogus",
            :name     => "field_name",
            :checked  => nil,
            :disabled => true,
            :title    => "This element is disabled because it is read only"
          )
        end
      end
    end

    context "when the dialog field is not read only" do
      let(:read_only) { false }
      let(:selected_value) { "some_value" }

      context "when the current value is equal to the default value" do
        let(:value) { "some_value" }

        it "returns the tag options with a disabled true and checked" do
          expect(helper.radio_options(dialog_field, "url", value, selected_value)).to eq(
            :type    => "radio",
            :class   => "100",
            :value   => "some_value",
            :name    => "field_name",
            :checked => '',
          )
        end
      end

      context "when the current value is not equal to the default value" do
        let(:value) { "bogus" }

        it "returns the tag options with a disabled true and checked" do
          expect(helper.radio_options(dialog_field, "url", value, selected_value)).to eq(
            :type    => "radio",
            :class   => "100",
            :value   => "bogus",
            :name    => "field_name",
            :checked => nil,
          )
        end
      end
    end
  end

  describe "#build_auto_refreshable_field_indicies" do
    let(:workflow) { instance_double("ResourceActionWorkflow", :dialog => dialog) }
    let(:dialog) { instance_double("Dialog", :dialog_tabs => [dialog_tab_1, dialog_tab_2]) }
    let(:dialog_tab_1) { instance_double("DialogTab", :dialog_groups => [dialog_group_1, dialog_group_2]) }
    let(:dialog_tab_2) { instance_double("DialogTab", :dialog_groups => [dialog_group_2]) }
    let(:dialog_group_1) do
      instance_double("DialogGroup", :dialog_fields => [dialog_field_1, dialog_field_1, dialog_field_2])
    end
    let(:dialog_group_2) do
      instance_double("DialogGroup", :dialog_fields => [dialog_field_3, dialog_field_2, dialog_field_1])
    end
    let(:dialog_field_1) { instance_double("DialogField", :auto_refresh => nil, :trigger_auto_refresh => false) }
    let(:dialog_field_2) { instance_double("DialogField", :auto_refresh => true, :trigger_auto_refresh => false) }
    let(:dialog_field_3) { instance_double("DialogField", :auto_refresh => false, :trigger_auto_refresh => true) }

    it "builds a list of auto refreshable fields and trigger fields with their indicies" do
      expect(helper.build_auto_refreshable_field_indicies(workflow)).to eq([
                                                                             {:tab_index => 0, :group_index => 0, :field_index => 2, :auto_refresh => true},
                                                                             {:tab_index => 0, :group_index => 1, :field_index => 0, :auto_refresh => false},
                                                                             {:tab_index => 0, :group_index => 1, :field_index => 1, :auto_refresh => true},
                                                                             {:tab_index => 1, :group_index => 0, :field_index => 0, :auto_refresh => false},
                                                                             {:tab_index => 1, :group_index => 0, :field_index => 1, :auto_refresh => true}
                                                                           ])
    end
  end

  describe "#auto_refresh_listening_options" do
    let(:options) { {:trigger => false} }

    it "overrides the trigger attribute" do
      expect(helper.auto_refresh_listening_options(options, true)).to eq(:trigger => true)
    end
  end
end
