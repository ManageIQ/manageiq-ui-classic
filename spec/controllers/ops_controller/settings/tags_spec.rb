describe OpsController do
  context "OpsController::Settings::Tags" do
    before do
      stub_user(:features => :all)
    end

    let(:category) { FactoryBot.create(:classification, :name => "department", :description => "Department") }
    let(:entry)    { FactoryBot.create(:classification_tag, :name => "finance", :description => "Finance", :parent => category) }

    describe "#ce_accept" do
      context "add button" do
        it "creates a new entry and fires an audit event" do
          expect(AuditEvent).to receive(:success).with(
            hash_including(
              :event   => "classification_entry_add",
              :message => include("record created")
            )
          )

          post :ce_accept, :params => {:button => "add", :id => category.id.to_s, :name => "newentry", :description => "New Entry"}

          body = response.parsed_body
          expect(body["type"]).to eq("success")
          expect(body["category_id"]).to eq(category.id.to_s)
          expect(body["entry"]["description"]).to eq("New Entry")
          expect(category.entries.find_by(:description => "New Entry").name).to eq("newentry")
        end
      end

      context "save button" do
        it "updates an existing entry and fires an audit event" do
          expect(AuditEvent).to receive(:success).with(
            hash_including(
              :event   => "classification_entry_update",
              :message => include("record updated")
            )
          )

          post :ce_accept, :params => {
            :button      => "save",
            :id          => category.id.to_s,
            :entry_id    => entry.id.to_s,
            :name        => "updated",
            :description => "Updated Description"
          }

          body = response.parsed_body
          expect(body["type"]).to eq("success")
          expect(body["entry"]["description"]).to eq("Updated Description")
          entry.reload
          expect(entry.description).to eq("Updated Description")
          expect(entry.tag.reload.name).to end_with("/updated")
        end
      end
    end

    describe "#ce_created_audit" do
      it "returns a hash with the correct event and message" do
        result = controller.send(:ce_created_audit, entry)

        expect(result[:event]).to eq("classification_entry_add")
        expect(result[:target_id]).to eq(entry.id)
        expect(result[:target_class]).to eq(entry.class.base_class.name)
        expect(result[:message]).to include("record created")
        expect(result[:message]).to include("Department")
        expect(result[:message]).to include("finance")
        expect(result[:message]).to include("name:[finance]")
        expect(result[:message]).to include("description:[Finance]")
      end
    end

    describe "#ce_saved_audit" do
      context "when only the name changed" do
        it "includes name change in the message" do
          old_entry = {:name => "old_name", :description => entry.description}
          entry.name = "new_name"

          result = controller.send(:ce_saved_audit, entry, old_entry)

          expect(result[:event]).to eq("classification_entry_update")
          expect(result[:message]).to include("name:[old_name] to [new_name]")
          expect(result[:message]).not_to include("description:")
        end
      end

      context "when only the description changed" do
        it "includes description change in the message" do
          old_entry = {:name => entry.name, :description => "Old Description"}
          entry.description = "New Description"

          result = controller.send(:ce_saved_audit, entry, old_entry)

          expect(result[:event]).to eq("classification_entry_update")
          expect(result[:message]).to include("description:[Old Description] to [New Description]")
          expect(result[:message]).not_to include("name:")
        end
      end

      context "when both name and description changed" do
        it "includes both changes in the message" do
          old_entry = {:name => "old_name", :description => "Old Description"}
          entry.name = "new_name"
          entry.description = "New Description"

          result = controller.send(:ce_saved_audit, entry, old_entry)

          expect(result[:message]).to include("name:[old_name] to [new_name]")
          expect(result[:message]).to include("description:[Old Description] to [New Description]")
        end
      end

      context "when nothing changed" do
        it "returns a message with no field changes" do
          old_entry = {:name => entry.name, :description => entry.description}

          result = controller.send(:ce_saved_audit, entry, old_entry)

          expect(result[:message]).to eq("Category Department [finance] record updated ()")
        end
      end
    end
  end
end
