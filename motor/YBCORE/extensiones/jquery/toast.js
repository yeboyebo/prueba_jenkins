//BASADO EN: http://www.jqueryscript.net/other/jQuery-Bootstrap-Based-Toast-Notification-Plugin-toaster.html
/***********************************************************************************
* Add Array.indexOf                                                                *
***********************************************************************************/
(function () {
    if (typeof Array.prototype.indexOf !== 'function') {
        Array.prototype.indexOf = function (searchElement, fromIndex) {
            for (var i = (fromIndex || 0), j = this.length; i < j; i += 1) {
                if ((searchElement === undefined) || (searchElement === null)) {
                    if (this[i] === searchElement) {
                        return i;
                    }
                }
                else if (this[i] === searchElement) {
                    return i;
                }
            }
            return -1;
        };
    }
})();
/**********************************************************************************/

(function ($, another_param) {
    var toasting =
	{
	    gettoaster: function (id,container) {
	        var toaster = $('#' + id);

	        if (toaster.length < 1) {
	            toaster = $(settings.toaster.template).attr('id', id).css(settings.toaster.css).addClass(settings.toaster['class']);

	            if ((settings.stylesheet) && (!$("link[href=" + settings.stylesheet + "]").length)) {
	                $('head').appendTo('<link rel="stylesheet" href="' + settings.stylesheet + '">');
	            }

	            $(container).append(toaster);
	        }

	        return toaster;
	    },

	    notify: function (title, message, priority,id,container) {
	        var $toaster = this.gettoaster(id,container);
	        var $toast = $(settings.toast.template.replace('%priority%', priority)).hide().css(settings.toast.css).addClass(settings.toast['class']);

	        $('.title', $toast).css(settings.toast.csst).html(title);
	        $('.message', $toast).css(settings.toast.cssm).html(message);

	        if ((settings.debug) && (window.console)) {
	            console.log(toast);
	        }

	        $toaster.append(settings.toast.display($toast));

	        if (settings.donotdismiss.indexOf(priority) === -1) {
	            var timeout = (typeof settings.timeout === 'number') ? settings.timeout : ((typeof settings.timeout === 'object') && (priority in settings.timeout)) ? settings.timeout[priority] : 1500;
	            setTimeout(function () {
	                settings.toast.remove($toast, function () {
	                    $toast.remove();
	                });
	            }, timeout);
	        }
	    }
	};

    var defaults =
	{
	    'toaster':
		{
		    'id': 'toaster',
		    'container': 'body',
		    'template': '<div></div>',
		    'class': 'toaster',
		    'css':
			{
			    'position': 'fixed',
			    'top': '10px',
			    'left': '10px',
			    'width': '200px',
			    'zIndex': 1000,
			    'font-weight': 'bold'
			}
		},

	    'toast':
		{
		    'template':
			'<div class="alert alert-%priority% alert-dismissible" role="alert">' +
				'<button type="button" class="close" data-dismiss="alert">' +
					'<span aria-hidden="true">&times;</span>' +
					'<span class="sr-only">Close</span>' +
				'</button>' +
				'<span class="title"></span> <span class="message"></span>' +
			'</div>',

		    'defaults':
			{
			    'title': 'Correcto',
			    'priority': 'success'
			},

		    'css': {},
		    'cssm': {},
		    'csst': { 'font-weight': 'bold' },

		    'fade': 'slow',

		    'display': function ($toast) {
		        return $toast.fadeIn(settings.toast.fade);
		    },

		    'remove': function ($toast, callback) {
		        return $toast.animate(
					{
					    "opacity": '0',
					    "padding": '0px',
					    "margin": '0px',
					    "height": '0px'
					},
					{
					    "duration": settings.toast.fade,
					    "complete": callback
					}
				);
		    }
		},

	    'debug': false,
	    'timeout': {
	    	'success': 1500,
            'info': 2500,
            'warning': 3000,
            'danger': 10000
        },
	    'stylesheet': null,
	    'donotdismiss': []
	};

	var error =
	{
	    'toaster':
		{
		    'id': 'toaster',
		    'container': 'body',
		    'template': '<div></div>',
		    'class': 'toaster',
		    'css': {
			    'position': 'fixed',
			    'top': '10px',
			    'left': '10px',
			    'width': '200px',
			    'zIndex': 1000,
			    'font-weight': 'bold'
			}
		},

	    'toast':
		{
		    'template':
			'<div class="alert alert-%priority% alert-dismissible" role="alert">' +
				'<button type="button" class="close" data-dismiss="alert">' +
					'<span aria-hidden="true">&times;</span>' +
					'<span class="sr-only">Close</span>' +
				'</button>' +
				'<span class="title"></span> <span class="message"></span>' +
			'</div>',

		    'defaults':
			{
			    'title': 'Error',
			    'priority': 'success'
			},

		    'css': {'background-color' : 'red'},
		    'cssm': {},
		    'csst': {'font-weight': 'bold'},
		    'fade': 'slow',

		    'display': function ($toast) {
		        return $toast.fadeIn(settings.toast.fade);
		    },

		    'remove': function ($toast, callback) {
		        return $toast.animate(
					{
					    "opacity": '0',
					    "padding": '0px',
					    "margin": '0px',
					    "height": '0px'
					},
					{
					    "duration": settings.toast.fade,
					    "complete": callback
					}
				);
		    }
		},

	    'debug': false,
	    'timeout': {
	    	'success': 1500,
            'info': 2500,
            'warning': 3000,
            'danger': 10000
        },
	    'stylesheet': null,
	    'donotdismiss': []
	};

	var navbar =
	{
	    'toaster':
		{
		    'id': 'toaster',
		    'container': 'body',
		    'template': '<div></div>',
		    'class': 'toaster',
		    'css':
			{
			    'position': 'fixed',
			    'top': '50px',
			    'left': '10px',
			    'width': '200px',
			    'zIndex': 1000
			}
		},

	    'toast':
		{
		    'template':
			'<div class="alert alert-%priority% alert-dismissible" role="alert">' +
				'<button type="button" class="close" data-dismiss="alert">' +
					'<span aria-hidden="true">&times;</span>' +
					'<span class="sr-only">Close</span>' +
				'</button>' +
				'<span class="title"></span> <span class="message"></span>' +
			'</div>',

		    'defaults':
			{
			    'title': '',
			    'priority': 'success'
			},
		    'css': {'background-color' : 'blue'},
		    'cssm': {},
		    'csst': {'fontWeight': 'bold'},
		    'fade': 'slow',

		    'display': function ($toast) {
		        return $toast.fadeIn(settings.toast.fade);
		    },

		    'remove': function ($toast, callback) {
		        return $toast.animate(
					{
					    "opacity": '0',
					    "padding": '0px',
					    "margin": '0px',
					    "height": '0px'
					},
					{
					    "duration": settings.toast.fade,
					    "complete": callback
					}
				);
		    }
		},

	    'debug': false,
	    'timeout': {
	    	'success': 1500,
		    'info': 2500,
		    'warning': 3000,
		    'danger': 10000
        },
	    'stylesheet': null,
	    'donotdismiss': []
	};

    var settings = {};
    $.extend(settings, defaults);

    $.toaster = function (options) {
    	if (options.template==undefined) {
    		$.extend(settings, defaults);
    	}
    	else if (options.template=='error') {
    		$.extend(settings, error);
    	}
    	else if (options.template=='navbar') {
    		$.extend(settings, navbar);
    	}
    	else {
    		$.extend(settings, defaults);
    	}
        if (typeof options === 'object') {
            if ('settings' in options) {
                settings = $.extend(true, settings, options.settings);
            }
        }
        else {
            var values = Array.prototype.slice.call(arguments, 0);
            var labels = ['message', 'title', 'priority'];
            options = {};

            for (var i = 0, l = values.length; i < l; i += 1) {
                options[labels[i]] = values[i];
            }
        }

        var title = (('title' in options) && (typeof options.title === 'string')) ? options.title : settings.toast.defaults.title;
        var message = ('message' in options) ? options.message : null;
        var priority = (('priority' in options) && (typeof options.priority === 'string')) ? options.priority : settings.toast.defaults.priority;
        var id = (('id' in options) && (typeof options.id === 'string')) ? options.id : settings.toaster.id;
        var container = ('container' in options) ? options.container : settings.toaster.container;
        if (message !== null) {
            toasting.notify(title, message, priority,id,container);
        }
    };

    $.toaster.reset = function () {
        settings = {};
        $.extend(settings, defaults);
    };
})(jQuery);
