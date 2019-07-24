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
      presenter[:right_cell_text] = @right_cell_text
      presenter.set_visibility(false, :toolbar)
      presenter.set_visibility(false, :adv_searchbox_div)
      presenter[:lock_sidebar] = true
      presenter
    end
  end
end
