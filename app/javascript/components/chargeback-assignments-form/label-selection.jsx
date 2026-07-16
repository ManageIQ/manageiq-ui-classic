import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Dropdown,
  Loading,
  DataTable,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  Layer,
} from '@carbon/react';

const LabelSelection = ({
  rates, assignments, savedAssignments, onRateChange, dropdownId = 'label-key',
}) => {
  const [savedLabelRows, setSavedLabelRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSavedLabels, setLoadingSavedLabels] = useState(false);
  const [loadingLabelValues, setLoadingLabelValues] = useState(false);
  const [labelKeys, setLabelKeys] = useState([]);
  const [selectedLabelKey, setSelectedLabelKey] = useState('');
  const [labelValues, setLabelValues] = useState([]);

  // Fetch label keys on mount
  useEffect(() => {
    const fetchLabelKeys = async() => {
      try {
        setLoading(true);
        // Fetch container images with docker_labels custom_attributes expanded
        const response = await API.get("/api/container_images?expand=resources,custom_attributes&filter[]=custom_attributes.section='docker_labels'");
        const images = response.resources || [];

        // Extract unique label names (keys) from all container images
        const uniqueKeys = {};
        images.forEach((image) => {
          if (image.custom_attributes) {
            image.custom_attributes.forEach((attr) => {
              if (attr.section === 'docker_labels' && attr.name && !uniqueKeys[attr.name]) {
                uniqueKeys[attr.name] = attr.name;
              }
            });
          }
        });

        // Default chargeback labels
        const defaultLabels = ['com.redhat.component'];
        const defaultOptions = [];
        const otherOptions = [];

        Object.keys(uniqueKeys).forEach((name) => {
          const option = {
            label: name,
            value: name, // Use name as value for filtering
          };
          if (defaultLabels.includes(name)) {
            defaultOptions.push(option);
          } else {
            otherOptions.push(option);
          }
        });

        // Sort and combine
        defaultOptions.sort((a, b) => a.label.localeCompare(b.label));
        otherOptions.sort((a, b) => a.label.localeCompare(b.label));

        setLabelKeys([...defaultOptions, ...otherOptions]);
        setLoading(false);
      } catch (error) {
        const message = error.data?.error?.message || __('Failed to load image labels');
        add_flash(message, 'error');
        setLoading(false);
      }
    };

    fetchLabelKeys();
  }, []);

  // Build saved rows once from saved label hrefs so the saved Selection column uses custom attribute value
  useEffect(() => {
    let cancelled = false;

    const fetchSavedLabelRows = async() => {
      if (!savedAssignments || savedAssignments.length === 0) {
        if (!cancelled) {
          setSavedLabelRows([]);
          setLoadingSavedLabels(false);
        }
        return;
      }

      try {
        setLoadingSavedLabels(true);
        const savedRows = await Promise.all(savedAssignments.map(async(assignment) => {
          try {
            const labelResponse = await API.get(assignment.labelHref);
            return {
              id: `saved-${assignment.labelId}-${assignment.rateId}`,
              name: labelResponse.name || assignment.labelName || '-',
              value: labelResponse.value || '-',
              rate: assignment.rateDescription,
            };
          } catch (_error) {
            return {
              id: `saved-${assignment.labelId}-${assignment.rateId}`,
              name: assignment.labelName || '-',
              value: assignment.labelValue || '-',
              rate: assignment.rateDescription,
            };
          }
        }));

        if (!cancelled) {
          setSavedLabelRows(savedRows);
        }
      } finally {
        if (!cancelled) {
          setLoadingSavedLabels(false);
        }
      }
    };

    fetchSavedLabelRows();

    return () => {
      cancelled = true;
    };
  }, [savedAssignments]);

  useEffect(() => {
    if (selectedLabelKey || labelKeys.length === 0 || savedAssignments.length === 0) {
      return;
    }

    const firstSavedAssignment = savedAssignments.find((assignment) => assignment.labelName);
    if (!firstSavedAssignment) {
      return;
    }

    const matchingKey = labelKeys.find((lk) => lk.label === firstSavedAssignment.labelName);
    if (matchingKey) {
      setSelectedLabelKey(matchingKey.value);
    }
  }, [savedAssignments, labelKeys, selectedLabelKey]);

  // Fetch label values when label key changes
  useEffect(() => {
    const fetchLabelValues = async() => {
      if (!selectedLabelKey) {
        setLabelValues([]);
        setLoadingLabelValues(false);
        return;
      }

      try {
        setLoadingLabelValues(true);
        // Get the label name from the selected key
        const selectedLabel = labelKeys.find((lk) => lk.value === selectedLabelKey);
        if (!selectedLabel) {
          setLabelValues([]);
          setLoadingLabelValues(false);
          return;
        }

        // Fetch container images with docker_labels custom_attributes expanded, filtered by label name
        const labelName = selectedLabel.label;
        const response = await API.get(
          `/api/container_images?expand=resources,custom_attributes`
          + `&filter[]=custom_attributes.section='docker_labels'`
          + `&filter[]=custom_attributes.name='${labelName}'`
        );
        const images = response.resources || [];

        // Build list of label values with their container_image_id
        const valueOptions = [];
        const valueOptionMap = new Map();

        images.forEach((image) => {
          if (image.custom_attributes) {
            image.custom_attributes.forEach((attr) => {
              // Only include docker_labels with matching name
              if (attr.section === 'docker_labels' && attr.name === selectedLabel.label && attr.value) {
                const containerImageId = image.id;
                const existingOption = valueOptionMap.get(attr.value);

                if (existingOption) {
                  existingOption.assignmentIds.push(String(attr.id));
                } else {
                  const nextOption = {
                    id: attr.id,
                    value: attr.value,
                    containerImageId,
                    customAttributeId: attr.id,
                    assignmentIds: [String(attr.id)],
                  };
                  valueOptionMap.set(attr.value, nextOption);
                  valueOptions.push(nextOption);
                }
              }
            });
          }
        });

        valueOptions.sort((a, b) => a.value.localeCompare(b.value));
        setLabelValues(valueOptions);
        setLoadingLabelValues(false);
      } catch (error) {
        const message = error.data?.error?.message || __('Failed to load label values');
        add_flash(message, 'error');
        setLabelValues([]);
        setLoadingLabelValues(false);
      }
    };

    fetchLabelValues();
  }, [selectedLabelKey, labelKeys]);

  const handleLabelKeyChange = ({ selectedItem }) => {
    setSelectedLabelKey(selectedItem?.value || '');
  };

  if (loading) {
    return (
      <div className="label-selection-loading">
        <Loading description={__('Loading image labels...')} withOverlay={false} />
      </div>
    );
  }

  return (
    <div className="label-selection">
      <div className="form-section">
        <div className="form-field">
          <Dropdown
            id={dropdownId}
            titleText={__('Image Labels')}
            label={__('Select options for image labels')}
            items={labelKeys}
            selectedItem={labelKeys.find((lk) => lk.value === selectedLabelKey)}
            itemToString={(item) => item?.label || ''}
            onChange={handleLabelKeyChange}
          />
        </div>
      </div>

      {savedAssignments && savedAssignments.length > 0 && (
        <>
          <h3>{__('Saved Items')}</h3>
          {loadingSavedLabels ? (
            <div className="label-selection-loading">
              <Loading description={__('Loading saved label assignments...')} withOverlay={false} />
            </div>
          ) : (
            <DataTable
              useZebraStyles
              rows={savedLabelRows}
              headers={[
                { key: 'name', header: __('Label') },
                { key: 'value', header: __('Selection') },
                { key: 'rate', header: __('Rate') },
              ]}
            >
              {({
                rows, headers, getTableProps, getHeaderProps, getRowProps,
              }) => (
                <Table {...getTableProps()} aria-label={__('Saved label assignments')}>
                  <TableHead>
                    <TableRow>
                      {headers.map((header) => (
                        <TableHeader {...getHeaderProps({ header })} key={header.key}>
                          {header.header}
                        </TableHeader>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((row) => (
                      <TableRow {...getRowProps({ row })} key={row.id}>
                        {row.cells.map((cell) => (
                          <TableCell key={cell.id}>{cell.value}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </DataTable>
          )}
          <hr />
        </>
      )}

      {(loadingSavedLabels || loadingLabelValues) && (
        <div className="label-selection-loading">
          <Loading
            description={loadingSavedLabels ? __('Loading saved label assignments...') : __('Loading label values...')}
            withOverlay={false}
          />
        </div>
      )}

      {!loadingSavedLabels && !loadingLabelValues && selectedLabelKey && labelValues.length > 0 && (
        <>
          <h3>{__('Selections')}</h3>
          <DataTable
            useZebraStyles
            rows={labelValues.map((labelValue) => ({
              id: labelValue.id.toString(),
              name: labelValue.value,
              rate: labelValue.id,
              containerImageId: labelValue.containerImageId,
            }))}
            headers={[
              { key: 'name', header: __('Name') },
              { key: 'rate', header: __('Rate') },
            ]}
          >
            {({
              rows, headers, getTableProps, getHeaderProps, getRowProps,
            }) => (
              <Table {...getTableProps()} aria-label={__('Label selections')}>
                <TableHead>
                  <TableRow>
                    {headers.map((header) => (
                      <TableHeader {...getHeaderProps({ header })} key={header.key}>
                        {header.header}
                      </TableHeader>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => {
                    const labelValue = labelValues.find((lv) => lv.id.toString() === row.id);
                    const matchingAssignmentId = labelValue?.assignmentIds?.find((assignmentId) => assignments[assignmentId]);
                    const selectedRateValue = matchingAssignmentId ? assignments[matchingAssignmentId] : 'nil';

                    return (
                      <TableRow {...getRowProps({ row })} key={row.id}>
                        <TableCell>{row.cells[0].value}</TableCell>
                        <TableCell className="dropdown-cell-wrapper">
                          <Layer>
                            <Dropdown
                              id={`rate-label-${row.id}`}
                              type="inline"
                              items={rates}
                              selectedItem={rates.find((r) => r.value === String(selectedRateValue || 'nil'))}
                              itemToString={(item) => item?.label || ''}
                              onChange={({ selectedItem }) => onRateChange(
                                matchingAssignmentId || row.id,
                                selectedItem?.value || 'nil',
                                labelValue.containerImageId
                              )}
                              label={__('Select rate')}
                              size="sm"
                              menuPosition="fixed"
                            />
                          </Layer>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </DataTable>
        </>
      )}

      {!loadingLabelValues && selectedLabelKey && labelValues.length === 0 && (
        <div className="empty-state">
          <p>{__('No label values available for this label key.')}</p>
        </div>
      )}
    </div>
  );
};

LabelSelection.propTypes = {
  rates: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
  })).isRequired,
  assignments: PropTypes.objectOf(PropTypes.string).isRequired,
  savedAssignments: PropTypes.arrayOf(PropTypes.shape({
    type: PropTypes.string.isRequired,
    assignmentType: PropTypes.string.isRequired,
    labelId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    labelHref: PropTypes.string.isRequired,
    rateId: PropTypes.string.isRequired,
    rateDescription: PropTypes.string.isRequired,
  })).isRequired,
  onRateChange: PropTypes.func.isRequired,
  dropdownId: PropTypes.string,
};

export default LabelSelection;
