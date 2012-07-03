/** @requires BEM */
/** @requires BEM.DOM */

(function() {

BEM.DOM.decl('b-link', {

    _onClick : function(e) {
        this.__base.apply(this, arguments);
        alert("Hello, World!");
    }

});

})();
