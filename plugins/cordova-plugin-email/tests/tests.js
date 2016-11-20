/* jshint jasmine: true */

exports.defineAutoTests = function() {
    describe('Namespace exists (cordova.plugins.email)', function () {
        it("should exist", function() {
            expect(cordova.plugins.email).toBeDefined();
        });
    });
};