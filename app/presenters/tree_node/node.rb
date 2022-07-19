module TreeNode
  class Node
    attr_reader :nodes, :tree
    attr_writer :icon, :image, :text
    attr_accessor :checkable, :checked, :color, :expanded, :hide_checkbox, :icon_background, :lazy, :klass, :selectable, :selected, :tooltip

    def initialize(object, parent_id, tree)
      @object = object
      @parent_id = parent_id
      @tree = tree
      @nodes = []
    end

    def text
      @object.name
    end

    def image
      @image || @object.try(:decorate).try(:fileicon)
    end

    def icon
      @icon || @object.try(:decorate).try(:fonticon)
    end

    def key
      if @object.try(:id).nil?
        # FIXME: this makes problems in tests
        # to handle "Unassigned groups" node in automate buttons tree
        "-#{@object.name.split('|').last}"
      else
        base_class = @object.class.base_model.name # i.e. Vm or MiqTemplate
        base_class = "Datacenter" if base_class == "EmsFolder" && @object.kind_of?(::Datacenter)
        base_class = "ManageIQ::Providers::ExternalAutomationManager" if @object.kind_of?(ManageIQ::Providers::ExternalAutomationManager)
        prefix = TreeBuilder.get_prefix_for_model(base_class)
        cid = @object.id
        "#{@tree.try(:options).try(:[], :full_ids) && @parent_id.present? ? "#{@parent_id}_" : ''}#{prefix}-#{cid}"
      end
    end

    def escape(string)
      return string if string.nil? || string.blank? || string.html_safe?
      ERB::Util.html_escape(string)
    end

    def to_h
      {
        :key            => key,
        :text           => escape(text),
        :tooltip        => escape(tooltip),
        :image          => image ? ActionController::Base.helpers.image_path(image) : nil,
        :icon           => icon,
        :iconBackground => icon_background,
        :iconColor      => color,
        :hideCheckbox   => hide_checkbox,
        :class          => [selectable ? nil : 'no-cursor'].push(klass).compact.join(' ').presence, # add no-cursor if not selectable
        :selectable     => selectable,
        :checkable      => checkable ? nil : false,
        :lazyLoad       => lazy,
        :nodes          => nodes.presence,
        :state          => {
          :checked  => checked,
          :expanded => expanded,
          :selected => selected
        }.compact
      }.compact
    end

    class << self
      private

      def set_attribute(attribute, value = nil, &block)
        atvar = "@#{attribute}".to_sym

        define_method(attribute) do
          result = instance_variable_get(atvar)

          if result.nil?
            if block_given?
              # All blocks here are either to_procs that only take the receiver or a block with no arguments.
              result = instance_exec(@object, &block)
            else
              result = value
            end
            instance_variable_set(atvar, result)
          end

          result
        end
      end

      def set_attributes(*attributes, &block)
        attributes.each do |attribute|
          define_method(attribute) do
            result = instance_variable_get("@#{attribute}".to_sym)

            if result.nil?
              results = instance_eval(&block)
              attributes.each_with_index do |local, index|
                instance_variable_set("@#{local}".to_sym, results[index])
                result = results[index] if local == attribute
              end
            end

            result
          end
        end
      end
    end

    set_attribute(:selectable, true)
    set_attribute(:checkable, true)
    set_attribute(:expanded) { @tree.try(:expand_node?, key) || false }
  end
end
