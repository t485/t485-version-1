function initScrollToTop(){$(window).scroll(function(){$(this).scrollTop()>100?$(".to-top-btn").fadeIn():$(".to-top-btn").fadeOut()}),$(document.body).on("click",".scroll-to-top",function(){return $("body,html").animate({scrollTop:0},800),!1})}function preserveLinkStates(){""!==getQuery("continue")&&null!=getQuery("continue")&&$(".attach-continue-url, .preserve-state, .keep-state").each(function(){var e=$(this).attr("href"),t=e.substring(0,e.indexOf("?")>-1?e.indexOf("?"):void 0),n=setQuery("continue",encodeURIComponent(getQuery("continue")),encodeURIComponent(getQueryString(e))),o=e.indexOf("#")>-1?e.substring(e.indexOf("#")):"";$(this).attr("href",t+n+o)})}function preserveCurrentPage(){$(".preserve-page, .keep-page").each(function(){var e=$(this).attr("href"),t=e.substring(0,e.indexOf("?")>-1?e.indexOf("?"):void 0),n=setQuery("continue",encodeURIComponent(window.location.href),getQueryString(e)),o=e.indexOf("#")>-1?e.substring(e.indexOf("#")):"";$(this).attr("href",t+n+o)})}String.prototype.replaceAll=function(e,t){return this.replace(new RegExp(escapeRegExp(e),"g"),t)},$(".dropdown a").click(function(){$(this).parent().hasClass("open")?$(this).parent().removeClass("open"):($(".dropdown").removeClass("open"),$(this).parent().addClass("open"))}),initScrollToTop(),$(document).ready(function(){!1!==window.preserveContinueState&&preserveCurrentPage(),!1!==window.preserveCurrentPage&&preserveLinkStates()}),$(document.body).on("submit",".prevent-submit",function(){return!1}),firebase.auth().onAuthStateChanged(function(e){if(e){var t=e.email,n=e.displayname||t;$(".user-email").text(t),$(".user-displayname").text(n),$(".lo-show").addClass("hidden"),$(".li-show").removeClass("hidden")}else $(".li-show").addClass("hidden"),$(".lo-show").removeClass("hidden")}),function(e,t,n,o,r,i,a){e.GoogleAnalyticsObject=r,e.ga=e.ga||function(){(e.ga.q=e.ga.q||[]).push(arguments)},e.ga.l=1*new Date,i=t.createElement(n),a=t.getElementsByTagName(n)[0],i.async=1,i.src="https://www.google-analytics.com/analytics.js",a.parentNode.insertBefore(i,a)}(window,document,"script",0,"ga"),ga("create","UA-102375833-1","auto"),ga("send","pageview");