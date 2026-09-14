require.config({
    paths: {
        'ui': '/App_Widgets',
        'widgets': '/App_Widgets/widgets',
        'widget': '/App_Widgets/widget'
    },
    config: {
        'widgets': {
            registration: function () {
                var widgetsOption = parseInt(function (querystring, param) {
                    var q = querystring.split('&');
                    for (var i = 0, p; p = q[i]; i++) {
                        var pair = p.split('=');
                        if (decodeURIComponent(pair[0]).toLowerCase() == param.toLowerCase()) {
                            return pair[1] ? decodeURIComponent(pair[1]) : "";
                        }
                    }
                    return "";
                }(window.location.search.substring(1), "widgets")) || 0;

                var widgets =
                [
                    widgetsOption & 1 ? 'ui/app/button/jquery-ui/button' : 'ui/app/button/bootstrap/button',
                    widgetsOption & 2 ? 'ui/app/datepicker/kendo-ui/datepicker' : 'ui/app/datepicker/jquery-ui/datepicker',
                    'ui/app/multiselect/kendo-ui/multiselect',
                    'ui/app/tooltip/jquery-qtip/tooltip'
                ];

                if (typeof Modernizr !== 'undefined') {
                    if (!Modernizr.input.placeholder)
                        widgets.push('ui/html5/placeholder');
                }

                return widgets;
            }
        }
    },
    map: {
        'jquery-ui': {
            'jquery-ui': 'load!jquery!Scripts/jquery-1.10.2.min.js,Scripts/jquery-ui-1.11.4.min.js'
        },
        'kendo-ui': {
            //'kendo-ui': 'load!jquery!Scripts/kendo/2015.3.1111/jquery.min.js,Scripts/kendo/2015.3.1111/kendo.ui.core.min.js'
            'kendo-ui': 'load!jquery!Scripts/jquery-1.10.2.min.js,Scripts/kendo/2015.3.1111/kendo.ui.core.min.js'
        },
        'jquery-qtip': {
            'jquery-qtip': 'load!jquery!Scripts/jquery-1.10.2.min.js,Scripts/qTip/jquery.qtip.min.js'
        },
    }
});