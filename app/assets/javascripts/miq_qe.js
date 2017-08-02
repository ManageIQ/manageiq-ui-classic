ManageIQ.qe.get_debounce_index = function () {
  if (ManageIQ.qe.debounce_counter > 30000) {
    ManageIQ.qe.debounce_counter = 0;
  }
  return ManageIQ.qe.debounce_counter++;
};

if (typeof _ !== 'undefined' && typeof _.debounce !== 'undefined') {
  var orig_debounce = _.debounce;
  _.debounce = function(func, wait, options) {
    var debounce_index = ManageIQ.qe.get_debounce_index();

    // Override the original fn; new_func will be the original fn with wait prepended to it
    // We make sure that once this fn is actually run, it decreases the counter
    var new_func = function() {
      try {
        return func.apply(this, arguments);
      } finally {
        // this is run before the return above, always
        delete ManageIQ.qe.debounced[debounce_index];
      }
    };
    // Override the newly-created fn (prepended wait + original fn)
    // We have to increase the counter before the waiting is initiated
    var debounced_func = orig_debounce.call(this, new_func, wait, options);
    var new_debounced_func = function() {
      ManageIQ.qe.debounced[debounce_index] = 1;
      return debounced_func.apply(this, arguments);
    };
    return new_debounced_func;
  };
}

ManageIQ.qe.xpath = function(root, xpath) {
  if (root == null) {
     root = document;
  }
  return document.evaluate(xpath, root, null,
    XPathResult.ANY_UNORDERED_NODE_TYPE, null).singleNodeValue;
};

ManageIQ.qe.isHidden = function(el) {
  if (el === null) {
    return true;
  }
  return el.offsetParent === null;
};

ManageIQ.qe.setAngularJsValue = function (el, value) {
  var angular_elem = angular.element(elem);
  var $parse = angular_elem.injector().get('$parse');
  var getter = $parse(elem.getAttribute('ng-model'));
  var setter = getter.assign;
  angular_elem.scope().$apply(function($scope) { setter($scope, value); });
};

ManageIQ.qe.anythingInFlight = function() {
  var state = ManageIQ.qe.inFlight();

  return (state.autofocus != 0) ||
    (state.debounce) ||
    (state.document != 'complete') ||
    (state.jquery != 0) ||
    (state.spinner) ||
    (state.loading > 0);
};

ManageIQ.qe.spinnerPresent = function() {
  return (!ManageIQ.qe.isHidden(document.getElementById("spinner_div"))) &&
     ManageIQ.qe.isHidden(document.getElementById("lightbox_div"));
};

ManageIQ.qe.debounceRunning = function() {
  return Object.keys(ManageIQ.qe.debounced).length > 0;
};

ManageIQ.qe.loading = 0;
ManageIQ.qe.inFlight = function() {
  return {
    autofocus:  ManageIQ.qe.autofocus,
    debounce:   ManageIQ.qe.debounceRunning(),
    document:   document.readyState,
    jquery:     $.active,
    spinner:    ManageIQ.qe.spinnerPresent(),
    loading:    ManageIQ.qe.loading,
  };
};

ManageIQ.qe.gtl = {
  actionsToFunction: function() {
    var startEnd = function(pageNumber) {
      var start = (pageNumber - 1) * this.settings.perpage;
      var end = start + this.settings.perPage;
      return {
        start: start,
        end: end,
      };
    }.bind(this);

    var goToPage = function(pageNumber) {
      var pageItems = startEnd(pageNumber);
      this.onLoadNext(pageItems.start, pageItems.end);
    }.bind(this);

    var getItem = function(item) {
      return {
        select: function() {
          this.onItemSelect(item, true);
          this.$scope.$digest();
        }.bind(this),
        unselect: function() {
          this.onItemSelect(item, false);
          this.$scope.$digest();
        }.bind(this),
        is_selected: function() {
          return item.selected;
        },
        click: function() {
          this.onItemClicked(item, document.createEvent('Event'));
          this.$scope.$digest();
        }.bind(this),
        item: item,
      };
    }.bind(this);
    return {
      'select_item': function(id, isSelected) {
        var item = this.gtlData.rows.filter(function(currItem) {
          return currItem.id === id;
        });
        this.onItemSelect(item[0], isSelected);
        this.$scope.$digest();
      },
      'click_item': function(id) {
        var item = this.gtlData.rows.filter(function(currItem) {
          return currItem.id === id;
        });
        this.onItemClicked(item[0], document.createEvent('Event'));
      },
      'select_all': function(isSelected) {
        this.gtlData.rows.forEach(function(item) {
          this.onItemSelect(item, isSelected);
        }.bind(this));
        this.$scope.$digest();
      },
      'go_to_page': function(pageNumber) {
        goToPage(pageNumber);
      },
      'last_page': function() {
        goToPage(this.settings.total);
      },
      'first_page': function() {
        goToPage(1);
      },
      'perevious_page': function() {
        goToPage(this.settings.current - 1);
      },
      'next_page': function() {
        goToPage(this.settings.current + 1);
      },
      'get_current_page': function() {
        ManageIQ.qe.gtl.result = this.settings.current;
        return this.settings.current;
      },
      'get_pages_amount': function() {
        ManageIQ.qe.gtl.result = this.settings.total;
        return this.settings.total;
      },
      'get_items_per_page': function() {
        ManageIQ.qe.gtl.result = this.settings.perpage;
        return this.settings.perpage;
      },
      'set_items_per_page': function(itemsPerPage) {
        this.settings.perPage = itemsPerPage;
        goToPage(this.settings.current);
      },
      'get_sorting': function() {
        var result = {
          sortBy: this.settings.sort_col,
          sortDir: this.settings.sort_dir,
        };
        ManageIQ.qe.gtl.result = result;
        return result;
      },
      'set_sorting': function(sortBy) {
        this.onSort(sortBy.columnId, sortBy.isAscending);
      },
      'get_all_items': function() {
        var responseData = [];
        this.gtlData.rows.forEach(function(oneItem) {
          responseData.push(getItem(oneItem));
        });
        ManageIQ.qe.gtl.result = responseData;
        return responseData;
      },
      'get_item': function(identificator) {
        var foundItem;
        var nameColumn = this.gtlData.cols.filter(function(data) {return data.text === 'Name';});
        if (nameColumn) {
          var index = this.gtlData.cols.indexOf(nameColumn[0]);
          foundItem = this.gtlData.rows.filter(function(oneRow) {
            return oneRow.cells[index].text === identificator;
          });
        }
        if (foundItem.length === 0) {
          foundItem = this.gtlData.rows.filter(function(oneRow) {return oneRow.id == identificator;});
        }
        if (foundItem.length === 1) {
          var responseData = getItem(foundItem[0]);
          ManageIQ.qe.gtl.result = responseData;
          return responseData;
        }
        return {};
      },
    };
  },
};
