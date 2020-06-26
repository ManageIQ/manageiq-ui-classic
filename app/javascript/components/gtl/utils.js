import * as React from 'react';
import PropTypes from 'prop-types';

import {
  Paginator,
  PaginationRow,
  PAGINATION_VIEW,
  Toolbar,
} from 'patternfly-react';

// overriding this here, to make per page drop down open downwards,
// pf-react paginator component has a bug, it doesnt pass this value to PaginationRow component
PaginationRow.defaultProps.pageSizeDropUp = false;

export const renderDataTableToolbar = () => {
  return (
    <Toolbar
    // onClick={onClick}
    // onViewClick={onViewClick}
    />
  );
};

// fixme: Grid view paginator has sorting!
export const renderPagination = ({
  pagination,
  total,
  onPageSet,
  onPerPageSelect,
}) => (
  <Paginator
    viewType={PAGINATION_VIEW.TABLE}
    pagination={pagination}
    itemCount={total}
    onPageSet={onPageSet}
    onPerPageSelect={onPerPageSelect}
  />
);
//   <miq-pagination
//  MISSING:
//     settings="tableCtrl.settings"
//     per-page="tableCtrl.perPage"
//     on-select-all="tableCtrl.onCheckAll(isSelected)"
//     has-checkboxes="tableCtrl.countCheckboxes() > 0"
//     on-change-sort="tableCtrl.onSortClick(sortId, isAscending)"
//   </miq-pagination>

// import {IDataTableBinding, ITableSettings} from './dataTable';
// import * as _ from 'lodash';
// /**
//  * This is abstract controller for implementing shared methods between data table and tile views.
//  * @memberof miqStaticAssets.gtl
//  * @ngdoc controller
//  * @name DataViewClass
//  */
// // export abstract class DataViewClass implements IDataTableBinding {
// //   public perPage: any;
// //   public rows: any[];
// //   public columns: any[];
// //
// //   public onRowClick: (args: {item: any, event: ng.IAngularEvent}) => void;
// //   public settings: ITableSettings;
// //   public currentPageView: number = 1;
// //
// //   public onSort: (args: {headerId: any, isAscending: boolean}) => void;
// //   public onItemSelected: (args: {item: any, isSelected: boolean}) => void;
// //   public loadMoreItems: (args: {start: number, perPage: number}) => void;
// //
// //   /*@ngInject*/
// //   constructor(public MiQTranslateService: any) {
// //   }
//
//   /**
//    * Public method which will perform checking all entities.
//    * @memberof DataViewClass
//    * @function onCheckAll
//    * @param isChecked true | false based on checked value.
//    */
//   public onCheckAll(isChecked: boolean) {
//     _.each(this.rows, oneRow => {
//       this.onItemSelected({item: oneRow, isSelected: isChecked});
//     });
//   }
//
//   /**
//    * Helper method which will pass sortId and isAscending to parent controller.
//    * @memberof DataViewClass
//    * @function onSortClick
//    * @param sortId id of sorted header column.
//    * @param isAscending true | false based on ascending order.
//    */
//   public onSortClick(sortId, isAscending) {
//     this.onSort({headerId: sortId, isAscending: isAscending});
//   }
//
//   /**
//    * Helper method for calculating loading more items after selecting how many items per page should be visible.
//    * @memberof DataViewClass
//    * @function perPageClick
//    * @param item {Object} enhanced IToolbarItem with value.
//    */
//   public perPageClick(item) {
//     const maxPage = Math.ceil(this.settings.items / item.value);
//     this.currentPageView = this.currentPageView > maxPage ? maxPage : this.currentPageView;
//     const start = DataViewClass.calculateStartIndex(this.currentPageView, item.value);
//     this.loadMoreItems({start: start, perPage: item.value});
//   }
//
//   /**
//    * Helper method for calculating what page should be visible, it works with perPage and total amount of values.
//    * @memberof DataViewClass
//    * @function setPage
//    * @param pageNumber {number} number of desired page, if this page is out of bound, it will be rounded.
//    */
//   public setPage(pageNumber) {
//     if (pageNumber > this.settings.total) {
//       this.currentPageView = this.settings.total;
//       pageNumber = this.currentPageView;
//     }
//     this.currentPageView = pageNumber;
//     const start = DataViewClass.calculateStartIndex(pageNumber, this.settings.perpage);
//     this.loadMoreItems({start: start, perPage: this.settings.perpage});
//   }
//
//   public translateOf(start, end, total): string {
//     return this.settings && this.settings.hasOwnProperty('translateTotalof') ?
//       this.settings.translateTotalOf(start, end, total) :
//       `${start} - ${end} of ${total}`;
//   }
//
//   /**
//    * Helper method to count all checkboxes in rows data.
//    * Checkboxes are stored under each row's cells.
//    */
//   public countCheckboxes() {
//     return this.rows.reduce(
//       (curr: number, next) => {
//         if (next.cells) {
//           curr += next.cells.filter(oneCell => oneCell && oneCell.is_checkbox).length;
//         }
//         return curr;
//       },
//       0
//     );
//   }
//
//   public onItemButtonClick(item: any, $event: any) {
//     $event.stopPropagation();
//     if (item.hasOwnProperty('onclick')) {
//       let onClickFunction = new Function(item.onclick);
//       onClickFunction.bind(item.bindTo)();
//     }
//   }
//
//   protected setPagingNumbers() {
//     if (this.settings.hasOwnProperty('current') && this.settings.hasOwnProperty('perpage')) {
//       this.settings.startIndex =
//         this.settings.startIndex ||
//         DataViewClass.calculateStartIndex(this.settings.current, this.settings.perpage);
//
//       if (this.settings.current === this.settings.total) {
//         this.settings.endIndex = this.settings.items - 1;
//       } else {
//         this.settings.endIndex = this.settings.current * this.settings.perpage - 1;
//       }
//     }
//   }
//
//   protected $onChanges(changesObj: any) {
//     if (changesObj.columns && this.settings) {
//       this.settings.columns = this.columns;
//     }
//
//     if (changesObj.perPage) {
//       this.perPage.text += `${this.perPage.labelItems ? ' ' + this.perPage.labelItems : ''}`;
//       this.perPage.items = this.perPage.items.map(oneItem => {
//         oneItem.text += `${this.perPage.labelItems ? ' ' + this.perPage.labelItems : ''}`;
//         return oneItem;
//       });
//     }
//   }
//
//   /**
//    * Helper static method for calculating start index based on pageNumber and number of visible items.
//    * @memberof DataViewClass
//    * @function calculateStartIndex
//    * @param pageNumber {number} current page number.
//    * @param perPage {number} how many of items are visible per page.
//    * @returns {number} start index for limit filter.
//    */
//   protected static calculateStartIndex(pageNumber, perPage) {
//     return (pageNumber - 1) * perPage;
//   }
// }

renderPagination.propTypes = {
  pagination: PropTypes.shape({
    page: PropTypes.number,
    perPage: PropTypes.number,
    perPageOptions: PropTypes.arrayOf(PropTypes.number),
  }).isRequired,
  total: PropTypes.number.isRequired,
  onPageSet: PropTypes.func.isRequired,
  onPerPageSelect: PropTypes.func.isRequired,
};

