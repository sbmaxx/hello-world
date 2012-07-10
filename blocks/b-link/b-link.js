BEM.DOM.decl('b-link', {

    onSetMod: {
        js: function() {
            this.bindTo('click', this._onClick);
        }
    },

    _onClick: function(e) {
        console.log("click");
        e.preventDefault();
    }

});
