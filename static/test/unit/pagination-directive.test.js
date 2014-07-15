describe('Directive pagination test', function () {

    var $rootScope,
        $compile,
        element,
        lis;

    beforeEach(angular.mock.module('templates'));
    beforeEach(angular.mock.module('app.directives'));
    beforeEach(inject(function (_$rootScope_, _$compile_) {
        $rootScope = _$rootScope_;
        $compile = _$compile_;

        $rootScope.numPages = 5;
        $rootScope.currentPage = 3;

        element = $compile('<pagination num-pages="numPages" current-page="currentPage"></pagination>')($rootScope);
        $rootScope.$digest();

        lis = function() {return element.find('li');};
    }));

    it('has the number of the page as text in each page item', function() {
        for (var i=1; i<=$rootScope.numPages; i++) {
            expect(lis().eq(i).text().trim()).toEqual(''+i);
        }
    });

//    it('set the current page to be active', function() {
//        var currentPageItem = lis().eq($rootScope.currentPage);
//        expect(currentPageItem.hasClass('active')).toBe(true);
//    });
//
//    it('disables "prev" if current-page is 1', function() {
//        $rootScope.currentPage = 1;
//        $rootScope.$digest();
//        var prevPageItem = lis().eq(0);
//        expect(prevPageItem.hasClass("disabled")).toBe(true);
//    });
//
//    it('disables "next" if current-page is num-pages', function() {
//        $rootScope.currentPage = 5;
//        $rootScope.$digest();
//        var nextPageItem = lis().eq(-1);
//        expect(nextPageItem.hasClass("disabled")).toBe(true);
//    });
//
//    it('changes currentPage if page link is clicked', function() {
//        var page2 = lis().eq(2).find('a').eq(0);
//        page2.click();
//        $rootScope.$digest();
//        expect($rootScope.currentPage).toBe(2);
//    });
//
//    it('does not change the current page on "next" click if already at last page', function() {
//        var next = lis().eq(-1).find('a');
//        $rootScope.currentPage = 5;
//        $rootScope.$digest();
//        next().click();
//        $rootScope.$digest();
//        expect($rootScope.currentPage).toBe(5);
//    });
//
//    it('changes the number of the items when numPages changes', function() {
//        $rootScope.numPages = 8;
//        $rootScope.$digest();
//        expect(lis().length).toBe(8);
//        expect(lis().eq(0).text()).toBe('Previous');
//        expect(lis().eq(-1).text()).toBe('Next');
//    });
});