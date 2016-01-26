/* This includes 2 files: jquery.textcomplete.js, textcomplete.init.js */
!function(a){"use strict";var b=function(a){var b,d;return b=function(){d=!1},function(){var e;d||(d=!0,e=c(arguments),e.unshift(b),a.apply(this,e))}},c=function(a){var b;return b=Array.prototype.slice.call(a)},d=function(a,b){return a.bind?a.bind(b):function(){a.apply(b,arguments)}},e=function(){var b;return b=a("<div></div>").css(["color"]).color,"undefined"!=typeof b?function(a,b){return a.css(b)}:function(b,c){var d;return d={},a.each(c,function(a,c){d[c]=b.css(c)}),d}}(),f=function(a){return a},g=function(a){var b={};return function(c,d){b[c]?d(b[c]):a.call(this,c,function(a){b[c]=(b[c]||[]).concat(a),d.apply(null,arguments)})}},h=function(a,b){var c,d;if(a.indexOf)return-1!=a.indexOf(b);for(c=0,d=a.length;d>c;c++)if(a[c]===b)return!0;return!1},i=function(){function c(b,c){var e,f,g;f=i.clone(),this.el=b.get(0),this.$el=b,e=k(this.$el),g=this.el===document.activeElement,this.$el.wrap(e).before(f),g&&this.el.focus(),this.listView=new j(f,this),this.strategies=c,this.$el.on("keyup",d(this.onKeyup,this)),this.$el.on("keydown",d(this.listView.onKeydown,this.listView)),a(document).on("click",d(function(a){a.originalEvent&&!a.originalEvent.keepTextCompleteDropdown&&this.listView.deactivate()},this))}var f,g,h,i;f={wrapper:'<div class="textcomplete-wrapper"></div>',list:'<ul class="textcomplete-list"></ul>'},g={wrapper:{position:"relative"},list:{position:"absolute",top:0,left:0,zIndex:"100",display:"none"}},h=a(f.wrapper).css(g.wrapper),i=a(f.list).css(g.list),a.extend(c.prototype,{renderList:function(a){this.clearAtNext&&(this.listView.clear(),this.clearAtNext=!1),a.length&&(this.listView.shown||(this.listView.setPosition(this.getCaretPosition()).clear().activate(),this.listView.strategy=this.strategy),a=a.slice(0,this.strategy.maxCount),this.listView.render(a)),!this.listView.data.length&&this.listView.shown&&this.listView.deactivate()},searchCallbackFactory:function(a){var b=this;return function(c,d){b.renderList(c),d||(a(),b.clearAtNext=!0)}},onKeyup:function(a){var b,c;if(b=this.extractSearchQuery(this.getTextFromHeadToCaret()),b.length){if(c=b[1],this.term===c)return;this.term=c,this.search(b)}else this.term=null,this.listView.deactivate()},onSelect:function(b){var c,d,e;c=this.getTextFromHeadToCaret(),d=this.el.value.substring(this.el.selectionEnd),e=this.strategy.replace(b),a.isArray(e)&&(d=e[1]+d,e=e[0]),c=c.replace(this.strategy.match,e),this.$el.val(c+d),this.el.focus(),this.el.selectionStart=this.el.selectionEnd=c.length},getCaretPosition:function(){if(0!==this.el.selectionEnd){var b,c,d,f,g;return b=["border-width","font-family","font-size","font-style","font-variant","font-weight","height","letter-spacing","word-spacing","line-height","text-decoration","width","padding-top","padding-right","padding-bottom","padding-left","margin-top","margin-right","margin-bottom","margin-left"],c=a.extend({position:"absolute",overflow:"auto","white-space":"pre-wrap",top:0,left:-9999},e(this.$el,b)),d=a("<div></div>").css(c).text(this.getTextFromHeadToCaret()),f=a("<span></span>").text("&nbsp;").appendTo(d),this.$el.before(d),g=f.position(),g.top+=f.height()-this.$el.scrollTop(),d.remove(),g}},getTextFromHeadToCaret:function(){var a,b,c;return b=this.el.selectionEnd,"number"==typeof b?a=this.el.value.substring(0,b):document.selection&&(c=this.el.createTextRange(),c.moveStart("character",0),c.moveEnd("textedit"),a=c.text),a},extractSearchQuery:function(a){var b,c,d,e;for(b=0,c=this.strategies.length;c>b;b++)if(d=this.strategies[b],e=a.match(d.match))return[d,e[d.index]];return[]},search:b(function(a,b){var c;this.strategy=b[0],c=b[1],this.strategy.search(c,this.searchCallbackFactory(a))})});var k=function(a){return h.clone().css("display",a.css("display"))};return c}(),j=function(){function b(a,b){this.$el=a,this.index=0,this.completer=b,this.$el.on("click","li.textcomplete-item",d(this.onClick,this))}return a.extend(b.prototype,{shown:!1,render:function(a){var b,c,d,e,f;for(b="",c=0,d=a.length;d>c&&(f=a[c],h(this.data,f)||(e=this.data.length,this.data.push(f),b+='<li class="textcomplete-item" data-index="'+e+'"><a>',b+=this.strategy.template(f),b+="</a></li>",this.data.length!==this.strategy.maxCount));c++);this.$el.append(b),this.data.length?this.activateIndexedItem():this.deactivate()},clear:function(){return this.data=[],this.$el.html(""),this.index=0,this},activateIndexedItem:function(){this.$el.find(".active").removeClass("active"),this.getActiveItem().addClass("active")},getActiveItem:function(){return a(this.$el.children().get(this.index))},activate:function(){return this.shown||(this.$el.show(),this.shown=!0),this},deactivate:function(){return this.shown&&(this.$el.hide(),this.shown=!1,this.data=this.index=null),this},setPosition:function(a){return this.$el.css(a),this},select:function(a){this.completer.onSelect(this.data[a]),this.deactivate()},onKeydown:function(a){this.shown&&(27===a.keyCode?this.deactivate():38===a.keyCode?(a.preventDefault(),0===this.index?this.index=this.data.length-1:this.index-=1,this.activateIndexedItem()):40===a.keyCode?(a.preventDefault(),this.index===this.data.length-1?this.index=0:this.index+=1,this.activateIndexedItem()):(13===a.keyCode||9===a.keyCode)&&(a.preventDefault(),this.select(parseInt(this.getActiveItem().data("index")))))},onClick:function(b){var c=a(b.target);b.originalEvent.keepTextCompleteDropdown=!0,c.hasClass("textcomplete-item")||(c=c.parents("li.textcomplete-item")),this.select(parseInt(c.data("index")))}}),b}();a.fn.textcomplete=function(a){var b,c,d;for(b=0,c=a.length;c>b;b++)d=a[b],d.template||(d.template=f),null==d.index&&(d.index=2),d.cache&&(d.search=g(d.search)),d.maxCount||(d.maxCount=10);return new i(this,a),this}}(window.jQuery||window.Zepto),jQuery(document).ready(function(){var a=!1;if("undefined"!=typeof navigator&&"undefined"!=typeof navigator.appVersion){var b=navigator.appVersion.match(/msie (\d+)/i);b&&(a=parseInt(b[1]))}if(!(a&&9>=a)){var c=[];jQuery(".user.login").each(function(){var a=jQuery(this).text();""!=a&&-1==c.indexOf(a)&&("@"==a[0]&&(a=a.substr(1)),c.push(a))}),jQuery("textarea.autocomplete_usernames").textcomplete([{match:/\B@(\w+)$/,search:function(a,b){a.length<4?b(jQuery.map(c,function(b){return 0===b.indexOf(a)?b:null})):jQuery.ajax({type:"POST",dataType:"JSON",url:htsrv_url+"anon_async.php",data:"action=autocomplete_usernames&q="+a,success:function(d){d=d.concat(c),b(jQuery.map(d,function(b){return 0===b.indexOf(a)?b:null}))}})},index:1,replace:function(a){return"@"+a+" "},cache:!0}])}});