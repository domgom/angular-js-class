angular.module("exercise",["ngResource"])
.controller("TodoCtrl", TodoCtrl)
.controller("TodoListCtrl", TodoListCtrl)
.service("TodoRepo", todoRepo)
.directive("inlineEdit", inlineEditable);


// controller for the todo form
function TodoCtrl(TodoRepo, $scope) {
  // create a single todo from form data
  $scope.create = function() {
    TodoRepo.create($scope.todo);
    $scope.todo = {};
  }
}

// controller for a list of todos
function TodoListCtrl(TodoRepo, $scope) {
  // retrieves the complete list of todos
  $scope.todos = TodoRepo.all();
}

// todoRepo abstracts the persistence of Todos, in an
// active-record style.
function todoRepo($resource) {

  // define our resource
  var Todo = $resource("/api/todo/:id",
      // take the value for param :id from the id property
      {id: "@id"},
      // add a 'create' method that posts for creating items
      { 
        create: { method: "POST" },
      });

  var all;

  this.create = function(data) {
    var todo = Todo.create(data);
    // if we already have the cache...
    if(all) {
      // update it
      all.push(todo);
    } else {
      // or retrieve it, then cache object
      all = Todo.query();
      all.$promise.then(function() {
        all.push(todo);
      });
    }
    
    // save our todo to the server
    todo.$save();
    return todo;
  }

  // retrieve list of todos, from local cache if possible
  this.all = function() {
    return all || (all = Todo.query());
  }

}

function inlineEditable() {
  return {
    transclude: true,
    template: "<div> <div ng-show='!editing' ng-transclude></div> <form ng-submit='done' ng-show='editing'><input ng-model=target><button>Ok</button></form> </div>",
    replace: true,
    scope: {
      target: "=inlineEdit",
    },
    link: function(scope, el, attr) {
      scope.editing = false;

      el.on("click", function() {
        scope.$apply(function() {
          scope.editing = true;
        });
      });

      el.on("submit", function() {
        scope.$apply(function() {
          scope.editing = false;
        });
      });
    }
  }
}

