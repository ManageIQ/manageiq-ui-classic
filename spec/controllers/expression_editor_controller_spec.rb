describe ExpressionEditorController do
  before { stub_user(:features => :all) }

  describe "#metadata" do
    context "when model parameter is missing" do
      it "returns 400 with an error message" do
        get :metadata
        expect(response.status).to eq(400)
        expect(response.parsed_body["error"]).to eq("model parameter is required")
      end
    end

    context "when model parameter is blank" do
      it "returns 400 with an error message" do
        get :metadata, :params => {:model => "   "}
        expect(response.status).to eq(400)
        expect(response.parsed_body["error"]).to eq("model parameter is required")
      end
    end

    context "when model is invalid" do
      it "returns 400 with an error message" do
        get :metadata, :params => {:model => "NonExistentModel"}
        expect(response.status).to eq(400)
        expect(response.parsed_body).to have_key("error")
      end
    end

    context "when model is valid" do
      let(:fields)  { [["VM : Name", "Vm-name"]] }
      let(:counts)  { [["VM : Number of Disks", "Vm.hardware-number_of_disks"]] }
      let(:finds)   { [] }
      let(:tags)    { [] }
      let(:exp_types) { [["Field", "field"], ["Count of", "count"], ["Tag", "tag"]] }

      before do
        allow(MiqExpression).to receive(:miq_adv_search_lists).with("Vm", :exp_available_finds).and_return(finds)
        allow(MiqExpression).to receive(:miq_adv_search_lists).with("Vm", :exp_available_fields).and_return(fields)
        allow(MiqExpression).to receive(:miq_adv_search_lists).with("Vm", :exp_available_counts).and_return(counts)
        allow(MiqExpression).to receive(:model_details).and_return(tags)
        allow(ExpAtomHelper).to receive(:expression_types_for_primary_filter).with("Vm").and_return(exp_types)

        parsed_field = double("parsed", :column_type => "string", :sub_type => nil, :plural? => false)
        allow(MiqExpression).to receive(:parse_field_or_tag).with("Vm-name").and_return(parsed_field)

        field_double = double("field", :plural? => false)
        allow(MiqExpression::Field).to receive(:parse).with("Vm-name").and_return(field_double)

        allow(MiqExpression).to receive(:get_col_operators).with("Vm-name").and_return(["=", "!=", "<", ">"])
      end

      it "returns 200" do
        get :metadata, :params => {:model => "Vm"}
        expect(response.status).to eq(200)
      end

      it "returns fields, counts, finds, tags, and expression_types keys" do
        get :metadata, :params => {:model => "Vm"}
        body = response.parsed_body
        expect(body).to have_key("fields")
        expect(body).to have_key("counts")
        expect(body).to have_key("finds")
        expect(body).to have_key("tags")
        expect(body).to have_key("expression_types")
      end

      it "includes col_type in field entries" do
        get :metadata, :params => {:model => "Vm"}
        body = response.parsed_body
        label, name, meta = body["fields"].first
        expect(label).to eq("VM : Name")
        expect(name).to eq("Vm-name")
        expect(meta["col_type"]).to eq("string")
      end

      it "excludes fields that are also in exp_available_finds" do
        allow(MiqExpression).to receive(:miq_adv_search_lists).with("Vm", :exp_available_finds)
                                                              .and_return([["VM : Find Disk", "Vm-name"]])

        get :metadata, :params => {:model => "Vm"}
        body = response.parsed_body
        expect(body["fields"]).to be_empty
      end

      it "sets operators to CONTAINS only for plural non-date fields" do
        plural_field = [["VM : Disk Filename", "Vm.hardware.disks-filename"]]
        allow(MiqExpression).to receive(:miq_adv_search_lists).with("Vm", :exp_available_fields).and_return(plural_field)
        allow(MiqExpression).to receive(:miq_adv_search_lists).with("Vm", :exp_available_finds).and_return([])

        parsed = double("parsed", :column_type => "string", :sub_type => nil)
        allow(MiqExpression).to receive(:parse_field_or_tag).with("Vm.hardware.disks-filename").and_return(parsed)

        field_double = double("field", :plural? => true)
        allow(MiqExpression::Field).to receive(:parse).with("Vm.hardware.disks-filename").and_return(field_double)

        get :metadata, :params => {:model => "Vm"}
        body = response.parsed_body
        _, _, meta = body["fields"].first
        expect(meta["operators"]).to eq(["CONTAINS"])
      end
    end
  end

  describe "#operators" do
    context "when field parameter is missing" do
      it "returns 400 with an error message" do
        get :operators
        expect(response.status).to eq(400)
        expect(response.parsed_body["error"]).to eq("field parameter is required")
      end
    end

    context "when field is blank" do
      it "returns 400 with an error message" do
        get :operators, :params => {:field => "   "}
        expect(response.status).to eq(400)
        expect(response.parsed_body["error"]).to eq("field parameter is required")
      end
    end

    context "when field is 'count'" do
      before do
        allow(MiqExpression).to receive(:get_col_operators).with(:count).and_return(["=", "!=", "<", ">="])
      end

      it "returns operators and col_type integer" do
        get :operators, :params => {:field => "count"}
        expect(response.status).to eq(200)
        body = response.parsed_body
        expect(body["col_type"]).to eq("integer")
        expect(body["operators"]).to eq(["=", "!=", "<", ">="])
      end
    end

    context "when field is 'regkey'" do
      before do
        allow(MiqExpression).to receive(:get_col_operators).with(:regkey).and_return(["KEY EXISTS", "VALUE EXISTS"])
      end

      it "returns operators and col_type string" do
        get :operators, :params => {:field => "regkey"}
        expect(response.status).to eq(200)
        body = response.parsed_body
        expect(body["col_type"]).to eq("string")
        expect(body["operators"]).to eq(["KEY EXISTS", "VALUE EXISTS"])
      end
    end

    context "when field is a normal model field" do
      before do
        parsed = double("parsed", :column_type => "string")
        allow(MiqExpression).to receive(:parse_field_or_tag).with("Vm-name").and_return(parsed)
        allow(MiqExpression).to receive(:get_col_operators).with("Vm-name").and_return(["=", "!=", "STARTS WITH"])
      end

      it "returns operators and col_type for the field" do
        get :operators, :params => {:field => "Vm-name"}
        expect(response.status).to eq(200)
        body = response.parsed_body
        expect(body["col_type"]).to eq("string")
        expect(body["operators"]).to eq(["=", "!=", "STARTS WITH"])
      end
    end

    context "when field is invalid" do
      it "returns 400 with an error message" do
        allow(MiqExpression).to receive(:parse_field_or_tag).and_raise(ArgumentError, "invalid field")
        get :operators, :params => {:field => "BadModel-bad_col"}
        expect(response.status).to eq(400)
        expect(response.parsed_body["error"]).to eq("invalid field")
      end
    end
  end

  describe "#tag_values" do
    context "when tag parameter is missing" do
      it "returns 400 with an error message" do
        get :tag_values
        expect(response.status).to eq(400)
        expect(response.parsed_body["error"]).to eq("tag parameter is required")
      end
    end

    context "when tag parameter is blank" do
      it "returns 400 with an error message" do
        get :tag_values, :params => {:tag => "   "}
        expect(response.status).to eq(400)
        expect(response.parsed_body["error"]).to eq("tag parameter is required")
      end
    end

    context "with a valid tag" do
      before do
        allow(MiqExpression).to receive(:get_entry_details).with("managed/location")
                                                           .and_return([["New York", "ny"], ["Boston", "boston"]])
      end

      it "returns 200 with sorted tag_values" do
        get :tag_values, :params => {:tag => "managed/location"}
        expect(response.status).to eq(200)
        body = response.parsed_body
        expect(body["tag_values"]).to eq([["Boston", "boston"], ["New York", "ny"]])
      end
    end
  end

  describe "#find_check_fields" do
    context "when model or field parameter is missing" do
      it "returns 400 when both are missing" do
        get :find_check_fields
        expect(response.status).to eq(400)
        expect(response.parsed_body["error"]).to eq("model and field parameters are required")
      end

      it "returns 400 when only model is given" do
        get :find_check_fields, :params => {:model => "Vm"}
        expect(response.status).to eq(400)
      end

      it "returns 400 when only field is given" do
        get :find_check_fields, :params => {:field => "Vm-name"}
        expect(response.status).to eq(400)
      end
    end

    context "with valid model and field" do
      let(:available_finds) do
        [
          ["VM : Disk Filename", "Vm.hardware.disks-filename"],
          ["VM : Disk Size",     "Vm.hardware.disks-disk_size_in_bytes"],
          ["VM : Name",          "Vm-name"]
        ]
      end

      before do
        allow(MiqExpression).to receive(:miq_adv_search_lists).with("Vm", :exp_available_finds).and_return(available_finds)
        parsed = double("parsed", :column_type => "string")
        allow(MiqExpression).to receive(:parse_field_or_tag).and_return(parsed)
      end

      it "returns 200" do
        get :find_check_fields, :params => {:model => "Vm", :field => "Vm.hardware.disks-filename"}
        expect(response.status).to eq(200)
      end

      it "excludes the field itself and keeps only same-association siblings" do
        get :find_check_fields, :params => {:model => "Vm", :field => "Vm.hardware.disks-filename"}
        body = response.parsed_body
        names = body["fields"].pluck("name")
        expect(names).not_to include("Vm.hardware.disks-filename")
        expect(names).to include("Vm.hardware.disks-disk_size_in_bytes")
        expect(names).not_to include("Vm-name")
      end

      it "uses the last segment of the label colon-split for each entry label" do
        get :find_check_fields, :params => {:model => "Vm", :field => "Vm.hardware.disks-filename"}
        body = response.parsed_body
        expect(body["fields"].first["label"]).to eq(" Disk Size")
      end
    end
  end
end
