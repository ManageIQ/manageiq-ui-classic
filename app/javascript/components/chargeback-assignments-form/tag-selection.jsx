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

const TagSelection = ({
  rates, assignments, savedAssignments, onRateChange, assignmentType, dropdownId,
}) => {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [categoriesData, setCategoriesData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [tags, setTags] = useState([]);

  // Reset state when assignment type changes only when there are no saved assignments to preload
  useEffect(() => {
    if (!savedAssignments || savedAssignments.length === 0) {
      setSelectedCategory('');
      setTags([]);
    }
  }, [assignmentType, savedAssignments]);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async() => {
      try {
        setLoading(true);
        // Fetch categories with their tags/entries
        const response = await API.get('/api/categories?expand=resources,tags');
        const allCategories = response.resources || [];

        // Filter categories that are visible (show=true) and have entries (tags)
        const visibleCategories = allCategories.filter(
          (cat) => cat.show && cat.tags && cat.tags.length > 0
        );

        // Store full category data for later use
        setCategoriesData(visibleCategories);

        const categoryOptions = visibleCategories.map((cat) => ({
          label: cat.description,
          value: cat.id.toString(),
        }));

        // Sort categories alphabetically by label
        categoryOptions.sort((a, b) => a.label.localeCompare(b.label));

        setCategories(categoryOptions);
        setLoading(false);
      } catch (error) {
        const message = error.data?.error?.message || __('Failed to load tag categories');
        add_flash(message, 'error');
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Auto-select category from saved assignments only for initial preload
  useEffect(() => {
    const fetchSavedTagCategory = async() => {
      if (selectedCategory || !savedAssignments || savedAssignments.length === 0 || categoriesData.length === 0) {
        return;
      }

      const firstAssignment = savedAssignments[0];
      const savedTagId = String(firstAssignment.tagId || firstAssignment.id || '');
      let matchingCategory = categoriesData.find((cat) =>
        cat.tags && cat.tags.some((tag) => String(tag.id) === savedTagId));

      if (!matchingCategory && firstAssignment.tagCategory) {
        matchingCategory = categoriesData.find((cat) => cat.name === firstAssignment.tagCategory);
      }

      if (!matchingCategory && firstAssignment.tagHref) {
        try {
          const savedTag = await API.get(firstAssignment.tagHref);
          const fetchedTagId = String(savedTag.id || '');
          matchingCategory = categoriesData.find((cat) =>
            (cat.tags && cat.tags.some((tag) => String(tag.id) === fetchedTagId))
            || cat.name === savedTag.category);
        } catch (_error) {
          matchingCategory = null;
        }
      }

      if (matchingCategory) {
        setSelectedCategory(matchingCategory.id.toString());
      }
    };

    fetchSavedTagCategory();
  }, [savedAssignments, categoriesData, selectedCategory]);

  // Update tags when category changes
  useEffect(() => {
    if (!selectedCategory) {
      setTags([]);
      return;
    }

    // Find the selected category in our stored data
    const category = categoriesData.find((cat) => cat.id.toString() === selectedCategory);
    if (category && category.tags) {
      // Extract tag name from the full tag path (e.g., "/managed/location/ny" -> "ny")
      const tagsWithNames = category.tags.map((tag) => {
        const nameParts = tag.name.split('/');
        const displayName = nameParts[nameParts.length - 1];
        return {
          ...tag,
          description: displayName,
        };
      });

      // Sort tags alphabetically by description
      tagsWithNames.sort((a, b) => a.description.localeCompare(b.description));
      setTags(tagsWithNames);
    } else {
      setTags([]);
    }
  }, [selectedCategory, categoriesData]);

  const handleCategoryChange = ({ selectedItem }) => {
    setSelectedCategory(selectedItem?.value || '');
  };

  if (loading) {
    return (
      <div className="tag-selection-loading">
        <Loading description={__('Loading tag categories...')} withOverlay={false} />
      </div>
    );
  }

  return (
    <div className="tag-selection">
      <div className="form-section">
        <div className="form-field">
          <Dropdown
            id={dropdownId}
            titleText={__('Tag Category')}
            label={__('Choose a Category')}
            items={categories}
            selectedItem={categories.find((c) => c.value === selectedCategory)}
            itemToString={(item) => item?.label || ''}
            onChange={handleCategoryChange}
          />
        </div>
      </div>

      {savedAssignments && savedAssignments.length > 0 && (
        <>
          <h3>{__('Saved Items')}</h3>
          <DataTable
            useZebraStyles
            rows={savedAssignments.map((assignment) => {
              let tagCategory = '-';
              let tagName = '-';
              const matchingCategory = categoriesData.find((cat) => cat.name === assignment.tagCategory);
              if (matchingCategory) {
                tagCategory = matchingCategory.description;
                tagName = assignment.tagDescription || assignment.tagName || '-';
              }
              return {
                id: `saved-${assignment.tagId}-${assignment.rateId}`,
                category: tagCategory,
                tag: tagName,
                rate: assignment.rateDescription,
              };
            })}
            headers={[
              { key: 'category', header: __('Tag Category') },
              { key: 'tag', header: __('Tag Name') },
              { key: 'rate', header: __('Rate') },
            ]}
          >
            {({
              rows, headers, getTableProps, getHeaderProps, getRowProps,
            }) => (
              <Table {...getTableProps()} aria-label={__('Saved tag assignments')}>
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
          <hr />
        </>
      )}

      {selectedCategory && tags.length > 0 && (
        <>
          <h3>{__('Selections')}</h3>
          <DataTable
            useZebraStyles
            rows={tags.map((tag) => ({
              id: tag.id.toString(),
              name: tag.description,
              rate: tag.id,
            }))}
            headers={[
              { key: 'name', header: __('Name') },
              { key: 'rate', header: __('Rate') },
            ]}
          >
            {({
              rows, headers, getTableProps, getHeaderProps, getRowProps,
            }) => (
              <Table {...getTableProps()} aria-label={__('Tag selections')}>
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
                      <TableCell>{row.cells[0].value}</TableCell>
                      <TableCell className="dropdown-cell-wrapper">
                        <Layer>
                          <Dropdown
                            id={`rate-tag-${row.id}`}
                            type="inline"
                            items={rates}
                            selectedItem={rates.find((r) => r.value === String(assignments[row.id] || 'nil'))}
                            itemToString={(item) => item?.label || ''}
                            onChange={({ selectedItem }) => onRateChange(row.id, selectedItem?.value || 'nil')}
                            label={__('Select rate')}
                            size="sm"
                            menuPosition="fixed"
                          />
                        </Layer>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </DataTable>
        </>
      )}

      {selectedCategory && tags.length === 0 && (
        <div className="empty-state">
          <p>{__('No tags available for this category.')}</p>
        </div>
      )}
    </div>
  );
};

TagSelection.propTypes = {
  rates: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
  })).isRequired,
  assignments: PropTypes.objectOf(PropTypes.string).isRequired,
  savedAssignments: PropTypes.arrayOf(PropTypes.shape({
    type: PropTypes.string.isRequired,
    assignmentType: PropTypes.string.isRequired,
    tagId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    tagHref: PropTypes.string.isRequired,
    tagName: PropTypes.string,
    tagDescription: PropTypes.string,
    tagCategory: PropTypes.string,
    rateId: PropTypes.string.isRequired,
    rateDescription: PropTypes.string.isRequired,
  })).isRequired,
  onRateChange: PropTypes.func.isRequired,
  assignmentType: PropTypes.string.isRequired,
  dropdownId: PropTypes.string,
};

TagSelection.defaultProps = {
  dropdownId: 'tag-category',
};

export default TagSelection;
