var SwipePaginate;
(function()
{
    SwipePaginate = function(pagesList, options)
    {
        if(!options)
        {
            options = {};
        }

        this.swipeTreshold = options.swipeTreshold || 20;
        this.elasticity = (typeof options.elasticity != 'undefined')
                            ? options.elasticity
                            : .4;
        var accelleration = 1;
        var that = this;

        if(typeof pagesList == 'string')
        {
            pagesList = document.getElementById(pagesList);
        }

        this.pagesList = pagesList;
        var currentPage = this.currentPage = 0;
        var pages = this.pages = pagesList.children;
        var pageHeight;

        var setPageHeight = function()
        {
            pageHeight = pages[0].clientHeight;
            var pageCS = window.getComputedStyle(pages[0], null);
            var stylesPositions = ['-top', '-left', '-bottom', '-right'];
            for(var i = stylesPositions.length; --i >= 0;)
            {
                pageHeight += window.parseInt(pageCS.getPropertyValue('margin' + stylesPositions[i]), 10);
                pageHeight += window.parseInt(pageCS.getPropertyValue('padding' + stylesPositions[i]), 10);
            }
            that.pageHeight = pageHeight;
        };
        setPageHeight();

        (function()
        {
            var docEl = document.documentElement;
            docEl.addEventListener(
                'orientationchange',
                function()
                {
                    setPageHeight();
                    var translateY = -(that.currentPage * that.pageHeight);
                    var currPageStyle;

                    for(var i = that.numPages; --i >= 0;)
                    {
                        currPageStyle = that.pages[i].style;
                        currPageStyle.webkitTransition = '';
                        currPageStyle.webkitTransform = 'translate3d(0, ' + translateY + 'px, 0)';
                    }
                },
                false
            );
        })();

        var numPages = this.numPages = pages.length;

        for(var i = numPages; --i >= 0;)
        {
            pages[i].style.webkitTransform = 'translate3d(0, ' + i * pages[i].clientHeight + 'px, 0)';
        }

        var startX, startY, deltaY, deltaX, lastDeltaY;
        pagesList.addEventListener(
            'touchstart',
            function(e)
            {
                //e.preventDefault();
                var tt = e.targetTouches[0];

                startY = tt.pageY;
                startX = tt.pageX;
                lastDeltaY = deltaY = 0;
                deltaX = 0;

                for(var i = numPages; --i >= 0;)
                {
                    pages[i].style.webkitTransition = '';
                }

                this.addEventListener('touchmove', trackTouchMovement, false);
                this.addEventListener('touchend', finishTouch, false);
            },
            false
        );

        var trackTouchMovement = function(e)
        {
            var tt = e.targetTouches[0];
            lastDeltaY = deltaY;
            deltaY = tt.pageY - startY;
            deltaX = tt.pageX - startX;

            if(Math.abs(deltaY) > Math.abs(deltaX))
            {
                e.preventDefault();
            }

            if(
                (!that.currentPage && deltaY > 0)
                || (that.currentPage === numPages - 1 && deltaY < 0)
            )
            {
                accelleration = that.elasticity;
            }
            else
            {
                accelleration = 1;
            }

            var translateY = ((-pageHeight * that.currentPage) + (deltaY * accelleration));

            for(var i = numPages; --i >= 0;)
            {
                pages[i].style.webkitTransform = 'translate3d(0, ' + translateY + 'px, 0)';
            }
        };

        var finishTouch = function(e)
        {
            if(
                (Math.abs(lastDeltaY - deltaY) > that.swipeTreshold)
                || (Math.abs(deltaY) > pageHeight / 2)
            )
            {
                if(deltaY > 0)
                {
                    that.pageUp();
                }
                else
                {
                    that.pageDown();
                }
            }
            else
            {
                that.slingBack();
            }
        };

        this.fireCallback = function(evt, args)
        {
            if(!args)
            {
                args = [];
            }

            return typeof options[evt] == 'function' && options[evt].apply(this, args);
        };
    };

    SwipePaginate.prototype.pageDown = function()
    {
        if(this.currentPage < this.numPages - 1)
        {
            ++this.currentPage;
        }
        this.slingBack();
        this.fireCallback('onNavigate', [this.currentPage]);
    };

    SwipePaginate.prototype.pageUp = function()
    {
        if(this.currentPage)
        {
            --this.currentPage;
        }
        this.slingBack();
        this.fireCallback('onNavigate', [this.currentPage]);
    };

    SwipePaginate.prototype.toPage = function(page)
    {
        if(page < 0 || page >= this.numPages)
        {
            return false;
        }

        this.currentPage = page;
        this.slingBack();
        this.fireCallback('onNavigate', [this.currentPage]);
        return true;
    };

    SwipePaginate.prototype.slingBack = function()
    {
        var translateY = -(this.currentPage * this.pageHeight);
        var currPageStyle;

        for(var i = this.numPages; --i >= 0;)
        {
            currPageStyle = this.pages[i].style;
            currPageStyle.webkitTransition = '-webkit-transform 300ms ease-out';
            currPageStyle.webkitTransform = 'translate3d(0, ' + translateY + 'px, 0)';
        }
    };

})();
