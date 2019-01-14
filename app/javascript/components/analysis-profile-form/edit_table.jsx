import React, { Component } from 'react';
import PropTypes from 'prop-types';

const FieldShow = ({field, type, row}) => (
  <React.Fragment>
    {row[field]}
  </React.Fragment>
);

const FieldEdit = ({field, type, row}) => (
  <React.Fragment>
    <input type="text" style={{width: "100%"}} />
    <input type="checkbox" />
  </React.Fragment>
);

class EditTable extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { headers, types, fields } = this.props;
    const data = [
      {
        foo: 5,
        name: "foo",
        bar: "Bar",
      },
      {
        foo: true,
        name: 5,
        bar: false,
      },
      {
        quux: [],
        name: false,
        bar: null,
      },
    ];

    const canAdd = true;
    const adding = null; // {}
    const editing = null; // data[0];

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
          {canAdd && (
            <tr title={__("Click to add a new entry")}>
              <td colspan={fields.length}>
                {__("<New Entry>")}
              </td>
              <td className="action-cell">
                <button className="btn btn-default btn-block btn-sm" type="button">
                  {__("Add")}
                </button>
              </td>
            </tr>
          )}
          {adding && (
            <tr>
              {fields.map((field) => (
                <td>
                  <FieldEdit field={field} type={types[field]} row={adding} />
                </td>
              ))}
              <td className="action-cell">
                <button className="btn btn-default btn-block btn-sm" type="button" title={__("Add this entry")}>
                  {__("Save")}
                </button>
              </td>
            </tr>
          )}
          {data.map((row, index) => (
            <tr className={(['row0', 'row1'])[index % 2]}>
              {(editing !== row) && (
                <React.Fragment>
                  {fields.map((field) => (
                    <td title={__("Click to update this entry")}>
                      <FieldShow field={field} type={types[field]} row={row} />
                    </td>
                  ))}
                  <td className="action-cell" title={__("Click to delete this entry")}>
                    <button type="button" className="btn btn-default btn-block btn-sm">
                      {__("Delete")}
                    </button>
                  </td>
                </React.Fragment>
              )}
              {(editing === row) && (
                <React.Fragment>
                  {fields.map((field) => (
                    <td>
                      <FieldEdit field={field} type={types[field]} row={row} />
                    </td>
                  ))}
                  <td className="action-cell">
                    <button className="btn btn-default btn-block btn-sm" type="button" title={__("Update this entry")}>
                      {__("Save")}
                    </button>
                  </td>
                </React.Fragment>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
}

export default EditTable;
