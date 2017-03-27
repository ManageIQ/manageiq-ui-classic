describe Quadicons::SingleQuadicon, :type => :helper do
  let(:record) { FactoryGirl.create(:configuration_manager_foreman) }
  let(:kontext) { Quadicons::Context.new(helper) }
  let(:instance) { Quadicons::SingleQuadicon.new(record, kontext) }

  describe "Setup" do
    subject(:quadicon) { instance }

    it 'includes a type icon quadrant' do
      expect(quadicon.quadrant_list).to include(:type_icon)
    end
  end

  describe "Rendering" do
    subject(:rendered) { instance.render }

    before do
      kontext.embedded = false
      kontext.explorer = true

      allow(controller).to receive(:list_row_id).with(record) do
        ApplicationRecord.compress_id(record.id)
      end
    end

    context "when @listicon is nil" do
      before do
        kontext.listicon = nil
      end

      context "when record is decorated" do
        # TODO: break out into EmsConfig quadicon
        context "when item is a config manager foreman" do
          before do
            allow(record.class).to receive(:db_name) { "provider_foreman" }

            allow(controller).to receive(:default_url_options) do
              { :controller => "provider_foreman" }
            end
          end

          it 'includes a vendor listicon img' do
            expect(rendered).to have_selector("img[src*='vendor-#{record.image_name}']")
          end
        end

        context "when item is a middleware deployment" do
          # TODO: break out into MiddlewareDeploymentQuadicon
          let(:record) { FactoryGirl.create(:middleware_deployment) }

          before do
            kontext.explorer = false

            allow(controller).to receive(:default_url_options) do
              { :controller => "middleware_deployment", :action => "show" }
            end
          end

          it 'includes a vendor listicon img' do
            expect(rendered).to have_selector("img[src*='middleware_deployment']")
          end
        end
      end

      context "when item is not decorated" do
        let(:record) { FactoryGirl.create(:service) }
        before do
          allow(record).to receive(:decorate) { nil }

          allow(controller).to receive(:default_url_options) do
            { :controller => "service" }
          end
        end

        it "includes an image with the item's base class name" do
          name = record.class.base_class.to_s.underscore
          expect(rendered).to have_selector("img[src*='#{name}']")
        end
      end

      context "when type is not :listnav" do
        context "when not embedded" do
          before do
            kontext.embedded = false
          end

          context "when explorer" do
            before do
              kontext.explorer = true

              allow(record.class).to receive(:db_name) { "provider_foreman" }

              allow(controller).to receive(:default_url_options) do
                { :controller => "provider_foreman", :action => "show" }
              end
            end

            # TODO: break link-specific examples into separate spec
            include_examples :has_sparkle_link

            it 'links to x_show with compressed id' do
              cid = ApplicationRecord.compress_id(record.id)
              expect(rendered).to have_selector("a[href*='x_show/#{cid}']")
            end
          end

          context "when not explorer" do
            # FIXME: This branch will error if item is Configuration Manager,
            # a bug to be handled in this refactoring
            #
            let(:record) { FactoryGirl.create(:middleware_deployment) }

            before do
              kontext.explorer = false

              allow(record.class).to receive(:db_name) { "middleware_deployment" }

              allow(controller).to receive(:default_url_options) do
                { :controller => "middleware_deployment", :action => "show" }
              end
            end

            it 'links to the record' do
              cid = ApplicationRecord.compress_id(record.id)
              expect(rendered).to have_selector("a[href*='#{cid}']")
            end
          end
        end

        context "when embedded" do
          before do
            kontext.embedded = true

            allow(record.class).to receive(:db_name) { "provider_foreman" }

            allow(controller).to receive(:default_url_options) do
              { :controller => "provider_foreman" }
            end
          end

          it 'links to nowhere' do
            expect(rendered).to have_selector("a[href='']")
          end
        end
      end
    end # => when @listicon is nil

    context "when listicon is not nil" do
      before do
        kontext.listicon = "foo"
        # @parent = FactoryGirl.build(:vm_vmware)

        allow(record.class).to receive(:db_name) { "provider_foreman" }

        allow(controller).to receive(:default_url_options) do
          { :controller => "provider_foreman" }
        end
      end

      # include_examples :has_base_single

      it 'includes a listicon image' do
        pending "Can we avoid getting the name of the icon from a view ivar?"
        expect(rendered).to have_selector("img[src*='foo']")
      end

      # TODO: Break out into ScanHistory specific class
      context "when listicon is scan_history" do
        let(:record) { ScanHistory.new(:started_on => Time.current) }

        before do
          kontext.listicon = "scan_history"
        end

        it 'titles based on the item started_on' do
          pending "Move to ScanHistoryQuadicon"
          expect(rendered).to include("title=\"#{record.started_on}\"")
        end
      end

      # TODO: break out into OrchestrationStackOutput specific class
      context "when listicon is orchestration_stack_output" do
        let(:record) { OrchestrationStackOutput.new(:key => "Bar") }

        before do
          kontext.listicon = "orchestration_stack_output"
        end

        it 'titles based on the item key' do
          pending "Move to OrchestrationStackOutputQuadicon"
          expect(rendered).to include("title=\"Bar\"")
        end
      end
    end # => when listicon is not nil
  end
end
