import React, { Component } from 'react';
import PropTypes from 'prop-types';

class EditTable extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    let { headers, types, fields } = this.props;

    headers = ['Foo', 'Bar'];
    fields = ['foo', 'bar'];
    const data = [
      {
        foo: 5,
        bar: "Bar",
      },
      {
        foo: true,
        bar: false,
      },
      {
        quux: [],
        bar: null,
      },
    ];
    const canAdd = true;
    const adding = true;
    const editing = null; //data[0];

    return (
      <table className="table table-striped table-bordered table-hover">
        <thead>
          <tr>
            {headers.map((label) => (
              <th>
                {label}
              </th>
            ))}
            <th className="action-cell">
              {__("Actions")}
            </th>
          </tr>
        </thead>
        <tbody>
          {canAdd && (<div>TODO</div>)}
          {adding && (<div>TODO</div>)}
          {data.map((row, index) => (
            <tr className={(['row0', 'row1'])[index % 2]}>
              {(editing !== row) && (
                <React.Fragment>
                  {fields.map((field) => (
                    <td title={__("Click to update this entry")}>
                      {row[field]}
                    </td>
                  ))}
                  <td className="action-cell" title={__("Click to delete this entry")}>
                    <button type="button" className="btn btn-default btn-block btn-sm">
                      {__("Delete")}
                    </button>
                  </td>
                </React.Fragment>
              )}
              {(editing === row) && (<div>TODO</div>)}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
}

export default EditTable;

/*
canAdd:
            %tr{:title => _("Click to add a new entry"), :onclick => remote_function(:url => {:action => 'ap_ce_select', :add => 'new', :item => "file", :id => scan_id})}
              %td= _("<New Entry>")
              %td
              %td.action-cell
                %button.btn.btn-default.btn-block.btn-sm
                  = _("Add")

adding:
            %tr
              %td
                = text_field("entry", "fname", :maxlength => ViewHelper::MAX_NAME_LEN, :style => "width: 100%;")
                = hidden_field("item", "type1", :value => "file")
              %td
                = check_box_tag("entry_content", 1, false, :id => "entry_content")
              %td.action-cell
                %button.btn.btn-default.btn-block.btn-sm{:title => _("Add this entry"),
                  "data-submit"         => 'ap_form_div',
                  "data-miq_sparkle_on" => true,
                  :remote               => true,
                  "data-method"         => :post,
                  'data-click_url'      => {:url => "#{url}?accept=accept"}.to_json}
                  = _("Save")

editing:
                %td
                  = text_field("entry", "fname", :maxlength => ViewHelper::MAX_NAME_LEN, "value" => session[:edit_filename], :style => "width: 100%;")
                  = hidden_field("item", "type1", :value => "file")
                %td
                  - checked = !!entry["content"]
                  = check_box_tag("entry_content", 1, checked, :id => "entry_content")
                  = hidden_field("item", "type1", :value => "file")
                %td.action-cell
                  %button.btn.btn-default.btn-block.btn-sm{:title => _("Update this entry"),
                    "data-submit"         => 'ap_form_div',
                    "data-miq_sparkle_on" => true,
                    :remote               => true,
                    "data-method"         => :post,
                    'data-click_url'      => {:url => "#{url}?accept=accept"}.to_json}
                    = _("Save")
*/
