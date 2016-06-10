'use strict';

(function(angular){
    var fsm = angular.module('fsm', []);

    fsm.directive('fsmStickyHeader', [function(){
        return {
            restrict: 'EA',
            replace: false,
            scope: {
                scrollBody: '@',
                scrollStop: '=',
                scrollableContainer: '=',
                contentOffset: '=',
				fsmZIndex: '='
            },
            link: function(scope, element, attributes, control){
                var content,
                    header = $(element, this),
                    clonedHeader = null,
                    scrollableContainer = $(scope.scrollableContainer),
                    contentOffset = scope.contentOffset || 0;

                var unbindScrollBodyWatcher = scope.$watch('scrollBody', function(newValue, oldValue) {
                    content = $(scope.scrollBody);
                    init();
                    unbindScrollBodyWatcher();
                });

                if (scrollableContainer.length === 0){
                    scrollableContainer = $(window);
                }

                function setColumnHeaderSizes() {
                    if (clonedHeader.is('tr') || clonedHeader.is('thead')) {
                        var clonedColumns = clonedHeader.find('th');
                        header.find('th').each(function (index, column) {
                            var clonedColumn = $(clonedColumns[index]);
                            //clonedColumn.css( 'width', column.offsetWidth + 'px'); fixed thead width
                            // fluid thead / table
                            var finalWidthSet = column.offsetWidth;// / ($(window).innerWidth()-20)*100; // $(window) can be replace with a custom wrapper / container
                            clonedColumn.css('width',finalWidthSet + 'px');
                        });
                    }
                };

                function determineVisibility(){
                    var scrollTop = scrollableContainer.scrollTop() + scope.scrollStop;
                    var contentTop = content.offset().top + contentOffset;
                    var contentBottom = contentTop + content.outerHeight(false);

                    if ( (scrollTop > contentTop) && (scrollTop < contentBottom) ) {
                        if (!clonedHeader){
                            createClone();
                            clonedHeader.css({ "visibility": "visible"});
                        }

                        if ( scrollTop < contentBottom && scrollTop > contentBottom - clonedHeader.outerHeight(false) ){
                            var top = contentBottom - scrollTop + scope.scrollStop - clonedHeader.outerHeight(false);
                            clonedHeader.css('top', top + 'px');
                        } else {
                            calculateSize();
                        }
                    } else {
                        if (clonedHeader){
                            /*
                             * remove cloned element (switched places with original on creation)
                             */
                            header.remove();
                            header = clonedHeader;
                            clonedHeader = null;

                            header.removeClass('fsm-sticky-header');
                            header.css({
                                position: 'relative',
                                left: 0,
                                top: 0,
                                width: 'auto',
                                'z-index': 0,
                                visibility: 'visible'
                            });
                        }
                    }
                };

                function calculateSize() {
                    clonedHeader.css({
                        top: scope.scrollStop,
                        width: header.outerWidth(),
                        left: header.offset().left
                    });

                    setColumnHeaderSizes();
                };

                function createClone(){
                    /*
                     * switch place with cloned element, to keep binding intact
                     */
                    clonedHeader = header;
                    header = clonedHeader.clone();
                    clonedHeader.after(header);
                    clonedHeader.addClass('fsm-sticky-header');
                    clonedHeader.css({
                        position: 'fixed',
                        'z-index': scope.fsmZIndex || 10000
                        //visibility: 'hidden'
                    });
                    calculateSize();
                };

                function init() {
                    scrollableContainer.on('scroll.fsmStickyHeader', determineVisibility).trigger("scroll");
                    scrollableContainer.on('resize.fsmStickyHeader', determineVisibility);

                    scope.$on('$destroy', function () {
                        scrollableContainer.off('.fsmStickyHeader');
                    });
                }
            }
        };
    }]);
})(window.angular);
