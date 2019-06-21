module Spec
  module Support
    module MenuHelper
      SECTION_DEF = <<~EOF.freeze
        type: section
        name: Red Hat
        id: redhat
        before: compute
        section_type: big_iframe
        href: http://www.redhat.com
EOF

      ITEM_DEF = <<~EOF.freeze
        type: item
        name: courses
        id: rht2
        feature: redhat_forum
        rbac:
          feature: redhat_forum
        parent: redhat
        href: http://www.redhat.com/en/services/training/all-courses-exams
        item_type: big_iframe
EOF

      def create_temp_file(content)
        temp_file = Tempfile.new('snafu')
        temp_file << content
        temp_file.close
        temp_file
      end

      def section_file
        create_temp_file(SECTION_DEF)
      end

      def item_file
        create_temp_file(ITEM_DEF)
      end

      def settings_custom_items
        [
          {
            :type => 'item',
            :icon => 'fa fa-bug',
            :id   => 'custom_i1',
            :name => 'Custom Item 1',
            :href => 'https://www.redhat.com',
            :rbac => 'vm_explorer'
          },
          {
            :type => 'item',
            :icon => 'pficon pficon-help',
            :id   => 'custom_i2',
            :name => 'Custom Item 2',
            :href => 'https://www.hmpf.cz',
            :rbac => 'vm_explorer'
          }
        ]
      end
    end
  end
end
