(function($, window, document, undefined) {

    var pluginName = 'sharrre',
        defaults = {
            className: 'sharrre',
            share: {
                googlePlus: false,
                facebook: false,
                twitter: false,
                digg: false,
                delicious: false,
                stumbleupon: false,
                linkedin: false,
                pinterest: false
            },
            shareTotal: 0,
            template: '',
            title: '',
            url: document.location.href,
            text: document.title,
            urlCurl: 'sharrre.php', 
            count: {},
            total: 0, 
            shorterTotal: true, 
            enableHover: true, 
            enableCounter: true, 
            enableTracking: false, 
            hover: function() {}, 
            hide: function() {}, 
            click: function() {}, 
            render: function() {}, 
        },
        
 
        loadButton = {
            facebook: function(self) {
                var sett = self.options.buttons.facebook;
                $(self.element).find('.buttons').append('<div class="button facebook"><div id="fb-root"></div><div class="fb-like" data-href="' + (sett.url !== '' ? sett.url : self.options.url) + '" data-send="' + sett.send + '" data-layout="' + sett.layout + '" data-width="' + sett.width + '" data-show-faces="' + sett.faces + '" data-action="' + sett.action + '" data-colorscheme="' + sett.colorscheme + '" data-font="' + sett.font + '" data-via="' + sett.via + '"></div></div>');
                var loading = 0;
                if (typeof FB === 'undefined' && loading == 0) {
                    loading = 1;
                    (function(d, s, id) {
                        var js, fjs = d.getElementsByTagName(s)[0];
                        if (d.getElementById(id)) {
                            return;
                        }
                        js = d.createElement(s);
                        js.id = id;
                        js.src = '//connect.facebook.net/' + sett.lang + '/all.js#xfbml=1';
                        fjs.parentNode.insertBefore(js, fjs);
                    }(document, 'script', 'facebook-jssdk'));
                } else {
                    FB.XFBML.parse();
                }
            },
            twitter: function(self) {
                var sett = self.options.buttons.twitter;
                $(self.element).find('.buttons').append('<div class="button twitter"><a href="https://twitter.com/share" class="twitter-share-button" data-url="' + (sett.url !== '' ? sett.url : self.options.url) + '" data-count="' + sett.count + '" data-text="' + self.options.text + '" data-via="' + sett.via + '" data-hashtags="' + sett.hashtags + '" data-related="' + sett.related + '" data-lang="' + sett.lang + '">Tweet</a></div>');
                var loading = 0;
                if (typeof twttr === 'undefined' && loading == 0) {
                    loading = 1;
                    (function() {
                        var twitterScriptTag = document.createElement('script');
                        twitterScriptTag.type = 'text/javascript';
                        twitterScriptTag.async = true;
                        twitterScriptTag.src = '//platform.twitter.com/widgets.js';
                        var s = document.getElementsByTagName('script')[0];
                        s.parentNode.insertBefore(twitterScriptTag, s);
                    })();
                } else {
                    $.ajax({
                        url: '//platform.twitter.com/widgets.js',
                        dataType: 'script',
                        cache: true
                    });
                }
            },
            linkedin: function(self) {
                var sett = self.options.buttons.linkedin;
                $(self.element).find('.buttons').append('<div class="button linkedin"><script type="in/share" data-url="' + (sett.url !== '' ? sett.url : self.options.url) + '" data-counter="' + sett.counter + '"></script></div>');
                var loading = 0;
                if (typeof window.IN === 'undefined' && loading == 0) {
                    loading = 1;
                    (function() {
                        var li = document.createElement('script');
                        li.type = 'text/javascript';
                        li.async = true;
                        li.src = '//platform.linkedin.com/in.js';
                        var s = document.getElementsByTagName('script')[0];
                        s.parentNode.insertBefore(li, s);
                    })();
                } else {
                    window.IN.init();
                }
            },
        },
        tracking = {
            facebook: function() {
                fb = window.setInterval(function() {
                    if (typeof FB !== 'undefined') {
                        FB.Event.subscribe('edge.create', function(targetUrl) {
                            _gaq.push(['_trackSocial', 'facebook', 'like', targetUrl]);
                        });
                        FB.Event.subscribe('edge.remove', function(targetUrl) {
                            _gaq.push(['_trackSocial', 'facebook', 'unlike', targetUrl]);
                        });
                        FB.Event.subscribe('message.send', function(targetUrl) {
                            _gaq.push(['_trackSocial', 'facebook', 'send', targetUrl]);
                        });
                        //console.log('ok');
                        clearInterval(fb);
                    }
                }, 1000);
            },
            twitter: function() {
                tw = window.setInterval(function() {
                    if (typeof twttr !== 'undefined') {
                        twttr.events.bind('tweet', function(event) {
                            if (event) {
                                _gaq.push(['_trackSocial', 'twitter', 'tweet']);
                            }
                        });
                        //console.log('ok');
                        clearInterval(tw);
                    }
                }, 1000);
            },
            linkedin: function() {
                function LinkedInShare() {
                    _gaq.push(['_trackSocial', 'linkedin', 'share']);
                }
            },
        },
        popup = {
            facebook: function(opt) {
                window.open("http://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent((opt.buttons.facebook.url !== '' ? opt.buttons.facebook.url : opt.url)) + "&t=" + opt.text + "", "", "toolbar=0, status=0, width=900, height=500");
            },
            twitter: function(opt) {
                window.open("https://twitter.com/intent/tweet?text=" + encodeURIComponent(opt.text) + "&url=" + encodeURIComponent((opt.buttons.twitter.url !== '' ? opt.buttons.twitter.url : opt.url)) + (opt.buttons.twitter.via !== '' ? '&via=' + opt.buttons.twitter.via : ''), "", "toolbar=0, status=0, width=650, height=360");
            },
            linkedin: function(opt) {
                window.open('https://www.linkedin.com/cws/share?url=' + encodeURIComponent((opt.buttons.linkedin.url !== '' ? opt.buttons.linkedin.url : opt.url)) + '&token=&isFramed=true', 'linkedin', 'toolbar=no,width=550,height=550');
            },
        };
    function Plugin(element, options) {
        this.element = element;

        this.options = $.extend(true, {}, defaults, options);
        this.options.share = options.share; 
        this._defaults = defaults;
        this._name = pluginName;

        this.init();
    };
    Plugin.prototype.init = function() {
        var self = this;
        if (this.options.urlCurl !== '') {
            urlJson.googlePlus = this.options.urlCurl + '?url={url}&type=googlePlus'; 
            urlJson.stumbleupon = this.options.urlCurl + '?url={url}&type=stumbleupon';
        }
        $(this.element).addClass(this.options.className);
        if (typeof $(this.element).data('title') !== 'undefined') {
            this.options.title = $(this.element).attr('data-title');
        }
        if (typeof $(this.element).data('url') !== 'undefined') {
            this.options.url = $(this.element).data('url');
        }
        if (typeof $(this.element).data('text') !== 'undefined') {
            this.options.text = $(this.element).data('text');
        }
        $.each(this.options.share, function(name, val) {
            if (val === true) {
                self.options.shareTotal++;
            }
        });
        if (self.options.enableCounter === true) {
            $.each(this.options.share, function(name, val) {
                if (val === true) {
                    //self.getSocialJson(name);
                    try {
                        self.getSocialJson(name);
                    } catch (e) {}
                }
            });
        } else if (self.options.template !== '') {
            this.options.render(this, this.options);
        } else {
            this.loadButtons();
        }
        $(this.element).hover(function() {
            if ($(this).find('.buttons').length === 0 && self.options.enableHover === true) {
                self.loadButtons();
            }
            self.options.hover(self, self.options);
        }, function() {
            self.options.hide(self, self.options);
        });

        //click event
        $(this.element).click(function() {
            self.options.click(self, self.options);
            return false;
        });
    };
    Plugin.prototype.loadButtons = function() {
        var self = this;
        $(this.element).append('<div class="buttons"></div>');
        $.each(self.options.share, function(name, val) {
            if (val == true) {
                loadButton[name](self);
                if (self.options.enableTracking === true) {
                    tracking[name]();
                }
            }
        });
    };
    Plugin.prototype.getSocialJson = function(name) {
        var self = this,
            count = 0,
            url = urlJson[name].replace('{url}', encodeURIComponent(this.options.url));
        if (this.options.buttons[name].urlCount === true && this.options.buttons[name].url !== '') {
            url = urlJson[name].replace('{url}', this.options.buttons[name].url);
        }
        if (url != '' && self.options.urlCurl !== '') {
            $.getJSON(url, function(json) {
                    if (typeof json.count !== "undefined") { 
                        var temp = json.count + '';
                        temp = temp.replace('\u00c2\u00a0', ''); 
                        count += parseInt(temp, 10);
                    }
                    else if (json.data && json.data.length > 0 && typeof json.data[0].total_count !== "undefined") {
                        count += parseInt(json.data[0].total_count, 10);
                    } else if (typeof json[0] !== "undefined") {
                        count += parseInt(json[0].total_posts, 10);
                    } else if (typeof json[0] !== "undefined") {
                    }
                    self.options.count[name] = count;
                    self.options.total += count;
                    self.renderer();
                    self.rendererPerso();
                })
                .error(function() {
                    self.options.count[name] = 0;
                    self.rendererPerso();
                });
        } else {
            self.renderer();
            self.options.count[name] = 0;
            self.rendererPerso();
        }
    };
    Plugin.prototype.rendererPerso = function() {
        var shareCount = 0;
        for (e in this.options.count) {
            shareCount++;
        }
        if (shareCount === this.options.shareTotal) {
            this.options.render(this, this.options);
        }
    };
    Plugin.prototype.renderer = function() {
        var total = this.options.total,
            template = this.options.template;
        if (this.options.shorterTotal === true) {
            total = this.shorterTotal(total);
        }

        if (template !== '') {
            template = template.replace('{total}', total);
            $(this.element).html(template);
        } else {
            $(this.element).html(
                '<div class="box"><a class="count" href="#">' + total + '</a>' +
                (this.options.title !== '' ? '<a class="share" href="#">' + this.options.title + '</a>' : '') +
                '</div>'
            );
        }
    };
    Plugin.prototype.shorterTotal = function(num) {
        if (num >= 1e6) {
            num = (num / 1e6).toFixed(2) + "M"
        } else if (num >= 1e3) {
            num = (num / 1e3).toFixed(1) + "k"
        }
        return num;
    };
    Plugin.prototype.openPopup = function(site) {
        popup[site](this.options); //open
        if (this.options.enableTracking === true) {
            var tracking = {
                facebook: {
                    site: 'facebook',
                    action: 'like'
                },
                twitter: {
                    site: 'twitter',
                    action: 'tweet'
                },
                linkedin: {
                    site: 'linkedin',
                    action: 'share'
                },
            };
            _gaq.push(['_trackSocial', tracking[site].site, tracking[site].action]);
        }
    };
    Plugin.prototype.simulateClick = function() {
        var html = $(this.element).html();
        $(this.element).html(html.replace(this.options.total, this.options.total + 1));
    };
    Plugin.prototype.update = function(url, text) {
        if (url !== '') {
            this.options.url = url;
        }
        if (text !== '') {
            this.options.text = text;
        }
    };
    $.fn[pluginName] = function(options) {
        var args = arguments;
        if (options === undefined || typeof options === 'object') {
            return this.each(function() {
                if (!$.data(this, 'plugin_' + pluginName)) {
                    $.data(this, 'plugin_' + pluginName, new Plugin(this, options));
                }
            });
        } else if (typeof options === 'string' && options[0] !== '_' && options !== 'init') {
            return this.each(function() {
                var instance = $.data(this, 'plugin_' + pluginName);
                if (instance instanceof Plugin && typeof instance[options] === 'function') {
                    instance[options].apply(instance, Array.prototype.slice.call(args, 1));
                }
            });
        }
    };
})(jQuery, window, document);