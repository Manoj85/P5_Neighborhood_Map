





var ViewModel = function () {
    "use strict";
    let self = this;

    // Setting the Application Title
    this.appTitle = ko.observable("Neighborhood Insights");


};

ko.applyBindings(new ViewModel());