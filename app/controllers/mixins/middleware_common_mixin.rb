module MiddlewareCommonMixin
  extend ActiveSupport::Concern
  include Mixins::MiddlewareOperationsMixin

  included do
    # This is a temporary hack ensuring that @ems will be set.
    # Once we use @record in place of @ems, this can be removed
    # together with init_show_ems
    alias_method :init_show_generic, :init_show
    alias_method :init_show, :init_show_ems
  end

  def init_show_ems
    result = init_show_generic
    @ems = @record
    result
  end

  private

  def listicon_image(item, _view)
    item.decorate.try(:listicon_image)
  end
end
