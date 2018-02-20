module Mixins
  module CustomButtonDialogFormMixin
    def set_custom_button_dialog_presenter(options)
      presenter ||= ExplorerPresenter.new(
        :active_tree => x_active_tree,
      )
      presenter.show(:default_left_cell).hide(:custom_left_cell)
      presenter.update(:main_div, r[
        :partial => "shared/dialogs/dialog_provision",
        :locals  => options[:dialog_locals]
      ])
      unless using_new_dialog_runner?(options)
        presenter.update(:form_buttons_div, r[
          :partial => 'layouts/x_dialog_buttons',
          :locals  => {
            :action_url => "dialog_form_button_pressed",
            :record_id  => @edit[:rec_id],
          }
        ])
        presenter.show(:form_buttons_div)
      end
      presenter[:right_cell_text] = @right_cell_text
      presenter.set_visibility(false, :toolbar)
      presenter.set_visibility(false, :adv_searchbox_div)
      presenter[:lock_sidebar] = true
      presenter
    end

    private

    def using_new_dialog_runner?(options)
      options[:dialog_locals].present? && options[:dialog_locals][:force_old_dialog_use].to_s == "false"
    end
  end
end
