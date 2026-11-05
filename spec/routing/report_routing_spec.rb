describe "routes for ReportController" do
  describe "#db_widget_dd_done" do
    it "routes with GET" do
      expect(get("/report/db_widget_dd_done")).to route_to("report#db_widget_dd_done")
    end

    it "routes with POST" do
      expect(post("/report/db_widget_dd_done")).to route_to("report#db_widget_dd_done")
    end
  end

  describe "#download_report" do
    it "routes with GET" do
      expect(get("/report/download_report")).to route_to("report#download_report")
    end
  end

  describe "#explorer" do
    it "routes with GET" do
      expect(get("/report/explorer")).to route_to("report#explorer")
    end

    it "routes with POST" do
      expect(post("/report/explorer")).to route_to("report#explorer")
    end
  end

  describe "#export_widgets" do
    it "routes with GET" do
      expect(get("/report/export_widgets")).to route_to("report#export_widgets")
    end
  end

  describe "#import_widgets" do
    it "routes with POST" do
      expect(post("/report/import_widgets")).to route_to("report#import_widgets")
    end
  end

  describe "#upload_widget_import_file" do
    it "routes with POST" do
      expect(post("/report/upload_widget_import_file")).to route_to("report#upload_widget_import_file")
    end
  end

  describe "#new" do
    it "routes with GET" do
      expect(get("/report/new")).to route_to("report#new")
    end
  end

  describe "#edit" do
    it "routes with GET and an id" do
      expect(get("/report/edit/1")).to route_to("report#edit", :id => "1")
    end
  end

  describe "#copy" do
    it "routes with GET and an id" do
      expect(get("/report/copy/1")).to route_to("report#copy", :id => "1")
    end
  end

  describe "#render_chart" do
    it "routes with GET" do
      expect(get("/report/render_chart")).to route_to("report#render_chart")
    end
  end

  describe "report_only" do
    it "routes with GET" do
      expect(get("/report/report_only")).to route_to("report#report_only")
    end
  end

  describe "#send_report_data" do
    it "routes with GET" do
      expect(get("/report/send_report_data")).to route_to("report#send_report_data")
    end
  end

  describe "#accordion_select" do
    it "routes with POST" do
      expect(post("/report/accordion_select")).to route_to("report#accordion_select")
    end
  end

  describe "#change_tab" do
    it "routes with POST" do
      expect(post("/report/change_tab")).to route_to("report#change_tab")
    end
  end

  describe "#db_edit" do
    it "routes with POST" do
      expect(post("/report/db_edit")).to route_to("report#db_edit")
    end
  end

  describe "#db_form_field_changed" do
    it "routes with POST" do
      expect(post("/report/db_form_field_changed"))
        .to route_to("report#db_form_field_changed")
    end
  end

  describe "#db_seq_edit" do
    it "routes with POST" do
      expect(post("/report/db_seq_edit")).to route_to("report#db_seq_edit")
    end
  end

  describe "#db_widget_remove" do
    it "routes with POST" do
      expect(post("/report/db_widget_remove")).to route_to("report#db_widget_remove")
    end
  end

  describe "#discard_changes" do
    it "routes with POST" do
      expect(post("/report/discard_changes")).to route_to("report#discard_changes")
    end
  end

  describe "#export_field_changed" do
    it "routes with POST" do
      expect(post("/report/export_field_changed"))
        .to route_to("report#export_field_changed")
    end
  end

  describe "#get_report" do
    it "routes with POST" do
      expect(post("/report/get_report")).to route_to("report#get_report")
    end
  end

  describe "#menu_editor" do
    it "routes with POST" do
      expect(post("/report/menu_editor")).to route_to("report#menu_editor")
    end
  end

  describe "#menu_field_changed" do
    it "routes with POST" do
      expect(post("/report/menu_field_changed"))
        .to route_to("report#menu_field_changed")
    end
  end

  describe "#menu_folder_message_display" do
    it "routes with POST" do
      expect(post("/report/menu_folder_message_display"))
        .to route_to("report#menu_folder_message_display")
    end
  end

  describe "#menu_update" do
    it "routes with POST" do
      expect(post("/report/menu_update")).to route_to("report#menu_update")
    end
  end

  describe "#reload" do
    it "routes with POST" do
      expect(post("/report/reload")).to route_to("report#reload")
    end
  end

  describe "#rep_change_tab" do
    it "routes with POST" do
      expect(post("/report/rep_change_tab")).to route_to("report#rep_change_tab")
    end
  end

  describe "#saved_report_paging" do
    it "routes with POST" do
      expect(post("/report/saved_report_paging"))
        .to route_to("report#saved_report_paging")
    end
  end

  describe "#schedule_edit" do
    it "routes with POST" do
      expect(post("/report/schedule_edit")).to route_to("report#schedule_edit")
    end
  end

  describe "#schedule_form_field_changed" do
    it "routes with POST" do
      expect(post("/report/schedule_form_field_changed"))
        .to route_to("report#schedule_form_field_changed")
    end
  end

  describe "#tree_autoload" do
    it "routes with POST" do
      expect(post("/report/tree_autoload"))
        .to route_to("report#tree_autoload")
    end
  end

  describe "#tree_select" do
    it "routes with POST" do
      expect(post("/report/tree_select")).to route_to("report#tree_select")
    end
  end

  describe "#upload" do
    it "routes with POST" do
      expect(post("/report/upload")).to route_to("report#upload")
    end
  end

  describe "#wait_for_task" do
    it "routes with POST" do
      expect(post("/report/wait_for_task")).to route_to("report#wait_for_task")
    end
  end

  describe "#widget_edit" do
    it "routes with POST" do
      expect(post("/report/widget_edit")).to route_to("report#widget_edit")
    end
  end

  describe "#widget_form_field_changed" do
    it "routes with POST" do
      expect(post("/report/widget_form_field_changed"))
        .to route_to("report#widget_form_field_changed")
    end
  end

  describe "#widget_shortcut_dd_done" do
    it "routes with POST" do
      expect(post("/report/widget_shortcut_dd_done"))
        .to route_to("report#widget_shortcut_dd_done")
    end
  end

  describe "#widget_shortcut_remove" do
    it "routes with POST" do
      expect(post("/report/widget_shortcut_remove"))
        .to route_to("report#widget_shortcut_remove")
    end
  end

  describe "#widget_shortcut_reset" do
    it "routes with POST" do
      expect(post("/report/widget_shortcut_reset"))
        .to route_to("report#widget_shortcut_reset")
    end
  end

  describe "#x_button" do
    it "routes with POST" do
      expect(post("/report/x_button")).to route_to("report#x_button")
    end
  end

  describe "#x_history" do
    it "routes with POST" do
      expect(post("/report/x_history")).to route_to("report#x_history")
    end
  end

  describe "#x_show" do
    it "routes with POST" do
      expect(post("/report/x_show")).to route_to("report#x_show")
    end
  end
end
