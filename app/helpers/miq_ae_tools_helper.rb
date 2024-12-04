module MiqAeToolsHelper
  def git_import_button_enabled?
    GitBasedDomainImportService.available?
  end

  def git_import_submit_help
    unless git_import_button_enabled?
      content_tag(
        :i,
        "",
        :class => ["fa", "fa-lg", "fa-question-circle"],
        :title => _("Please enable the git owner role in order to import git repositories")
      )
    end
  end

  private

  def automation_simulation_data(tree, results, resolve)
    if results
      render :json => {
        :tree   => {:text => _('Tree View'),   :rows => ae_result_tree(tree)},
        :xml    => {:text => _('Xml View'),    :rows => ae_result_xml(results)},
        :object => {:text => _('Object info'), :rows => ae_result_uri(resolve)}
      }
    else
      {:notice => _("Enter Automation Simulation options on the left and press Submit.")}
    end
  end

  def ae_result_tree(tree)
    [
      row_data('', {:input => 'component', :component => 'TREE_VIEW_REDUX', :props => tree.locals_for_render, :name => tree.name})
    ]
  end

  def ae_result_xml(results)
    [
      row_data('', {:input => 'component', :component => 'XML_HOLDER', :props => {:xmlData => results.to_s}})
    ]
  end

  def ae_result_uri(resolve)
    rows = [row_data(_('URI'), resolve[:uri])]
    if resolve[:button_attr_name].present? && resolve[:button_class].present?
      rows.push(row_data(_('Object Attribute Name'), resolve[:button_attr_name]))
      rows.push(row_data(_('Object Attribute Type'), ui_lookup(:model => resolve[:button_class])))
    end
    rows
  end

  def row_data(label, value)
    {:cells => {:label => label, :value => value}}
  end
end
