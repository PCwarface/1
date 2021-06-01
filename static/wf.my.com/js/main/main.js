
var site = {

	tpl : {},

	lang : null,

	user : {
		status : 0,
		id     : 0,
		name   : '',
		email  : '',
		new    : 0,
	},

	init() {
		this.get_lang();
		//this.mobile.menu.generate();
		this.profile.init();
	},

	get_lang() {

		var list = ['en', 'fr', 'de', 'pl', 'es', 'pt', 'cn'],
			loc = document.location.href.split('/');

		lang = list[0];
		for (var k in loc) {
			for (var key in list) {
				if (loc[k] == list[key]) {
					lang = list[key];
				}
			}
		}

		site.lang = lang;
	},

	get_user() {

		site.user.status = (typeof oauth.user.status != 'undefined') ? oauth.user.status : 0;
		site.user.id = (typeof oauth.user.id != 'undefined') ? oauth.user.id : 0;
		site.user.name = (typeof oauth.user.name != 'undefined') ? oauth.user.name : '';
		site.user.email = (typeof oauth.user.email != 'undefined') ? oauth.user.email : '';
		site.user.new = (typeof oauth.user.new != 'undefined') ? oauth.user.new : 0;

		site.init();

	},

	profile : {

		init() {

			//site.profile.play_button();

			if (site.user.status == 1) {

				setTimeout(() => { // block-user-1 load await
					//site.profile.top_menu_generate();
					site.profile.notifications();
				}, 300);
				
			}
			else {
				//site.profile.menu_disable();
			}

		},

		notifications() {

			var xhr = new XMLHttpRequest();
			xhr.onreadystatechange = function()
			{
				if (xhr.readyState == 4) {
					
					if (xhr.status == 200) {

						try {
							var data = JSON.parse(xhr.responseText);
						}
						catch(e) {
							var data = xhr.responseText;
						}
						finally {
							
							var bell = document.querySelector('.header_menu .bell');
							if (typeof data.badge != 'undefined') {
								bell.setAttribute('data', data.badge);
							}

						}

					}

				}
			}
			xhr.open('get', '/dynamic/site-notification/?a=badge');
			xhr.send();

		},

	},

};

document.addEventListener('DOMContentLoaded', function(e){

});

document.addEventListener('oauthUser', function(e){
	site.get_user();
});

//--------------------------------------------------------------------
// Check language

function check_lang(p){

	var lang_list = ['en', 'fr', 'de', 'pl', 'cn', 'es', 'pt'];

	lang = lang_list[0];
	for (var k in lang_list)
		if (document.location.href.indexOf('/'+ lang_list[k] +'/') > 0)
			lang = (p == 0) ? k : lang_list[k];
	return lang;

}

var lng = check_lang();

function link_loc(){
	$('[data-link-loc]').each(function(index, element) {
		var cur_href = $(this).attr('href').split('/'),
			new_href = [];

		for (var i = 0; i < cur_href.length; i++) {
			new_href.push(cur_href[i]);
			if ((i == 2 && (cur_href[0] == 'https:' || cur_href[0] == 'http:')) || (i == 0 && (cur_href[0] == '' || cur_href[0] == ''))) {
				new_href.push(lng);
			}
		}

		new_href = new_href.join('/');
		$(this).attr('href', new_href).removeAttr('data-link-loc');
	});
}

document.addEventListener('DOMContentLoaded', function(e){
	link_loc();
//	data_loc();
});

//--------------------------------------------------------------------
// Menu buttons state

site.play_button = {

	set(method = 'login') {

		var button = document.querySelector('#play_button'),
			action = {
				'login' 	: 'js-show-oauth-signup',
				'reg' 		: 'js-ovl-open',
				'download' 	: 'js-download',
				'steam' 	: 'is-steam',
			};

		if (method == 'reg') {
			button.setAttribute('data-ovl-link', 'ovl-reg-main');
		}

		if (method == 'download') {
			button.innerHTML = button.getAttribute('data-text-download');
		}

		button.classList.add(action[method]);
		button.style.display = 'block';

	},

};

site.mobile_auth = {

	set(method = 'login') {

		var button = document.querySelector('#mobile_auth'),
			action = {
				'login' 	: 'js-show-oauth-signup',
				'reg' 		: 'js-ovl-open',
			};

		if (method == 'reg') {
			button.setAttribute('data-ovl-link', 'ovl-reg-main');
		}

		button.classList.add(action[method]);
		button.style.display = 'block';
	},

};

document.addEventListener('click', function(e){

	if (e.target && e.target.closest('.js-show-login')) {
		oauth.open('login');
	}

	if (e.target && e.target.closest('.js-show-signup')) {
		oauth.open('signup');
	}

	if (e.target && e.target.closest('.js-login')) {
		oauth.open('login');
	}

	if (e.target && e.target.closest('.js-signup')) {
		oauth.open('signup');
	}

});

var userData;
function checkUser() {
	$.get('/dynamic/auth/?a=checkuser', function(data) {
		userData = data;
		eventAuth = new Event('authLoad');
		document.dispatchEvent(eventAuth);
	}, 'json');
}

function downloadBtn() {
		var user_status = userData.enable;
		if (user_status == 0) {
			site.play_button.set('login');
			site.mobile_auth.set('login');
		}
		else if (user_status == 1)  {
			site.play_button.set('download');
			if (userData.user.steam == true) {
				site.play_button.set('steam');
			}
		}
		else if (user_status == 2)  {
			site.play_button.set('reg');
			site.mobile_auth.set('reg');
		}
}

function shopBtn() {
	$.get('/dynamic/billing/?a=is_first_payment', function(data) {
	    if (data.is_first_payment) {
			$('#block-menu-primary-links > ul > li:nth-last-child(2) > a').addClass('is-first-bonus').attr('data-text', btn_bonus_text);
	    }
	}, 'json');
}

$(document).ready(function() {
	checkUser();
//  shopBtn();
});
document.addEventListener('authLoad', function (e) {
	downloadBtn();
});

//--------------------------------------------------------------------
// download page, button click

$(document).on('click', '.js-download', function(e) {

	if ($(this).hasClass('is-steam')) {
		window.open('http://store.steampowered.com/app/291480', '_blank');
	}
	else {
		if (document.location.href.split('/')[2] == 'wf.my.com') {
			__GMC.whenLoaded(function() {
				__GMC.detectAndDownload();
			});
		}
		else {
			__GEM.detectAndDownload();
		}
	}

});

//--------------------------------------------------------------------
// Sticky controls

var menu_offset;

$(window).scroll(function(){
	var top_offset = window.pageYOffset ? window.pageYOffset : (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop),
		body_margin = parseInt($('body').css('margin-top')),
		footer_offset =  $('footer').position().top,
		menu_height;

	$('aside .sticky').each(function(i, item) {
		if($(item).css('display') != 'none') {
			menu_height = $(item).height();
			return;
		}
	});

	// main menu
	if (top_offset > menu_offset + body_margin) {
		$('.main_menu').addClass('fixed');
	} else {
		$('.main_menu').removeClass('fixed');
	}

	// news aside
	if (top_offset > menu_offset + body_margin) {
		$('aside .sticky').addClass('fixed');
		if (top_offset >= (footer_offset - menu_height - 62)) {
			$('aside .sticky').css('top', footer_offset - menu_height - top_offset);
		} else {
			$('aside .sticky').css('top', 62);
		}
	} else {
		$('aside .sticky').removeClass('fixed');
	}
});

$(document).ready(function(){
	menu_offset = $('.main_menu').offset().top;
	$('#block-menu-menu-profile-menu').addClass('sticky');
	$(window).scroll();
});

//--------------------------------------------------------------------
// Main menu sm logo

$(document).ready(function(){
	var menu_arr = '';

	menu_arr += '<li class="menu_logo">';
	menu_arr += '<div class="menu_cube">';
	menu_arr += '<div class="menu_logo_pic"></div>';
	menu_arr += '<div class="menu_arrow_up"></div>';
	menu_arr += '</div>';
	menu_arr += '</li>';

	$('.main_menu #block-menu-primary-links > .menu').prepend(menu_arr);
});

$(document).on('click', '.menu_logo', function() {
	$('html, body').animate({scrollTop: 0}, 300);
});

//--------------------------------------------------------------------
// Menu generate

function profile_menu_load() {

	// header profile menu
	var profile_menu = $('.main_menu').find('.block-menu > .menu > li:last-child > a[href$="profile/"] + .menu').html();
	$('#header_profile_menu').html(profile_menu);

	// mobile menu
	var m_profile_menu = '<div id="block-menu-menu-mobile-user" class="block block-menu"><ul class="menu">' + profile_menu + '</ul></div>';
	$('.main_menu_layout .block_layout').append(m_profile_menu);

	// mobile overlay
	$('.main_menu .block_layout').append('<div id="menu_overlay_m" style="display: none;"></div>');
}

//--------------------------------------------------------------------
// Mobile menu

function body_layout_set(){

	$(document).scrollTop(0);

	$('body > .layout').addClass('active');
	$('#menu_overlay_m').show();

	body_layout_height();
}

function body_layout_unset(){
	$('body > .layout').removeClass('active');
	$('body > .layout').removeAttr('style');
	$('#menu_overlay_m').hide();
}

function body_layout_height(){

	var layout_height = 0;

	if ($('#block-menu-menu-mobile').hasClass('opened'))
		layout_height = $('#block-menu-menu-mobile').height();

	if ($('#block-menu-menu-mobile-user').hasClass('opened'))
		layout_height = $('#block-menu-menu-mobile-user').height();

	layout_height += 200;
	if (layout_height < window.innerHeight)
		layout_height = window.innerHeight;

	$('body > .layout').css('height', layout_height + 'px');
}

$(document).on('click', '.main_menu_m, .user_menu_m', function() {
	var menu_obj, menu_sib, menu_opened;

	if ($(this).hasClass('main_menu_m')) {
		menu_obj = $('#block-menu-menu-mobile');
		menu_sib = $('#block-menu-menu-mobile-user');
	}

	if ($(this).hasClass('user_menu_m')) {
		menu_obj = $('#block-menu-menu-mobile-user');
		menu_sib = $('#block-menu-menu-mobile');
	}

	menu_sib.removeClass('opened');
	menu_opened = (menu_obj.hasClass('opened')) ? true : false;

	if (menu_opened) {
		menu_obj.removeClass('opened');
		body_layout_unset();
	} else {
		menu_obj.addClass('opened');
		body_layout_set();
	}
});

$(document).on('click', '#menu_overlay_m', function(e) {
	body_layout_unset();
	$('#block-menu-menu-mobile, #block-menu-menu-mobile-user').removeClass('opened');
});

$(document).on('click', '#block-menu-menu-mobile li.expanded > a', function(e) {
	e.preventDefault();
	$(this).toggleClass('opened');

	$(this).next().slideToggle(200, function() {
		body_layout_height();
	});
});

$(window).on('resize',function() {

	if (window.innerWidth > 720) {
		$('body > .layout').removeAttr('style').removeClass('active');
		$('#block-menu-menu-mobile-user, #block-menu-menu-mobile').removeClass('opened');
		$('#menu_overlay_m').hide();
	}

});

//--------------------------------------------------------------------
// Target blank fix

$(document).ready(function(e) {
	$('.block-menu a[href^="http"]').each(function(index, element) {
		if ($(element).attr('href').indexOf('pc.warface.com') < 0)
			$(element).attr('target', '_blank');
	});
});

//--------------------------------------------------------------------
// spoiler

$(document).on('click', '.js-spoiler_block .open', function() {
	$(this).toggleClass('show');
	$(this).next().slideToggle('fast');
});

$(document).on('click', '.js-spoiler', function(){
    $(this).toggleClass('opened');
    $(this).next().slideToggle('fast');
});

//===[ Index ]========================================================

//--------------------------------------------------------------------
// Top block

$(document).on('click', '.top_switch > span', function() {
	var cur_index = $(this).parent().children().index(this);
	$(this).addClass('active').siblings().removeClass('active');
	$('.top_layout_right .top_list > ol').eq(cur_index).show().siblings().hide();
});

//--------------------------------------------------------------------
// Esc close

$(document).on('keydown', 'body', function(e){
	if (e.keyCode == 27) {
		$('.reg__close').click();
	}
});

//--------------------------------------------------------------------
// Timer on right banner

var promoTimer = {
	init : function(finish) {
		var now = this.serverTime();
		if(now < finish) {
			$('.js-promo-timer-count').countdown({
				until: finish,
				format: 'dHMS',
				padZeroes: true,
				compact: true,
				alwaysExpire: true,
				compactLabels: ['', '', '', 'd'],
				compactLabels1: ['', '', '', 'd'],
				onExpiry: this.end,
				serverSync: this.serverTime
			});
			$('.js-promo-timer').show();
		} else {
			this.end();
		}
	},
	serverTime : function() {
	  var time = null;
	  $.ajax({url: '/dynamic/all/time.php',
	    async: false, dataType: 'text',
	    success: function(text) {
	      time = new Date(text);
	    },
	    error: function(http, message, exc) {
	      time = new Date();
	  }});
	  return time;
	},
	end : function() {
		var lang = check_lang(0),
			link = ['https://pc.warface.com/en/news/1209595.html', 'https://pc.warface.com/fr/news/1209599.html', 'https://pc.warface.com/en/news/1209595.html', 'https://pc.warface.com/pl/news/1209597.html'];

		$('.js-promo-timer').hide();
		$('.news_promo a[href="https://pc.warface.com/atlas_of_war/"]').attr('href', link[lang]);
	}
};

//---------------------------------------------------------------------
// select

var select = {
	init: function() {
		var $controls,
			templateScroll = '';

		$('.js-scroll-wrap').each(function() {
				templateScroll = '';
		    if($(this).find('.js-wf-select-list li').length > 5) {
		    	templateScroll += '<div class="js-scroll-controls wf__select-controls">';
	            templateScroll += 	'<span class="controls__button prev js-scroll-prev"></span>';
	            templateScroll += 	'<span class="controls__button next js-scroll-next"></span>';
	            templateScroll += 	'<div class="controls__scrollbar js-scroll-bar">';
	            templateScroll += 		'<div class="controls__handle"></div>';
	            templateScroll += 	'</div>';
	            templateScroll += '</div>';
				thisControl = $(this).after(templateScroll);

		    	$controls = $(this).next('.js-scroll-controls');
		    	$(this).height(240);
			    $(this).sly({
				    scrollBar: $controls.find('.js-scroll-bar'),
				    scrollBy: 100,
				    scrollTrap: true,
						speed: 300,
				    easing: 'easeOutExpo',
				    dragHandle: 1,
				    dynamicHandle: 1,
				    // Buttons
				    prevPage: $controls.find('.js-scroll-prev'),
				    nextPage: $controls.find('.js-scroll-next')
			    });
		    }
		});

		$('.js-wf-select').on({
			click: function() { $(this).toggleClass( "is-hover" ); },
			mouseleave: function() { $(this).removeClass( "is-hover" ); }
		});

		$('.js-wf-select-list li').click(function() {
			var parent = $(this).parents('.js-wf-select'),
				new_name = $(this).text(),
				new_value = $(this).data('value');

			$(parent).find('.js-wf-select-cur').html(new_name).data('value', new_value);
		});
	}
};

//---------------------------------------------------------------------
// right menu

$(document).on('click', '.js-right-menu-item', function() {
	$(this).toggleClass('is-open');
});

//---------------------------------------------------------------------
// change currency

$(document).on('click', '.js-change-currency', function (event) {
    $(this).addClass('is-active').siblings().removeClass('is-active');

    if ($(this).data('attr') == 'eu') {
        $('[data-eur]').each(function (index, element) {
            $(this).html($(this).data('eur'));
        });
    } else if( $(this).data('attr') == 'usd') {
        $('[data-usd]').each(function (index, element) {
            $(this).html($(this).data('usd'));
        });
    }
});

// open reg ovl for 1link users

var url_params = window.location.search,
    queryMatch = url_params.match(/1lr=0-(\d+)_/),
    projectId = queryMatch ? queryMatch[1] : 0;
document.addEventListener('authLoad', function (e) {
	if((projectId==3040512||url_params.match(/regshow/))&&userData.enable==0) {
	  oauth.open('signup');
	}
});
