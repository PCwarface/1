// GoogleTag vars

dataLayer = [];

// GoogleTag init

var gtmi = {

	id : 'GTM-54XLG6X',

	init(id) {

		if (!document.querySelectorAll('script[src*="googletagmanager"]').length) {
			
			(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
			new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
			j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
			'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
			})(window,document,'script','dataLayer',id);

		}

	},

};

gtmi.init(gtmi.id);

// GoogleTag site events

var gtms = {

	cfg : {
		log : 0,
	},

	user : {
		id : 0,
		status : 0,
	},

	init() {
		
		gtms.get_user();
		gtms.handle('ch_registration_finish');
		gtms.handle('ch_visit');
		//gtms.gc_set_cookie();
		
	},

	get_user() {
		
		if (typeof oauth != 'undefined') {
			gtms.user.id = oauth.user.id;
			gtms.user.status = oauth.user.status;
		}

	},

	gc_set_cookie() {
		
		// cookies are to be used in gamecenter

		/* var ga_client_id = ga.getAll()[0].get('clientId'),
			domain = (window.location.host == 'wf.mail.ru') ? 'mail.ru' : 'my.games';
		
		try {
			document.cookie = `ga_client_id=${ga_client_id}; path=/; domain=.${domain}; SameSite=None; Secure`;
			document.cookie = `ga_user_id=${gtms.user.id}; path=/; domain=.${domain}; SameSite=None; Secure`;
		}
		catch(e){}; */
	},

	push(name, par = {}) {

		var event = null,
			test = 0;

		if (typeof gtms.event[name] != 'undefined') {
			event = gtms.event[name];
		}

		if (typeof gtms.event_test[name] != 'undefined') {
			event = gtms.event_test[name];
			test = 1;
		}

		if (event != null) {
			var obj = Object.assign(event, par);

			gtms.log(`event: ${name}`);
			gtms.log(obj);

			if (!test) {
				dataLayer.push(obj);
			}
		}

	},

	cookie : {

		set(name, val) {
			document.cookie = `${name}=${val}; path=/;`;
		},

		read(name) {
			let a = `; ${document.cookie}`.match(`;\\s*${name}=([^;]+)`);
			return a ? a[1] : null;
		},

		del(name) {
			document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
		},

	},

	log(par) {
		if (gtms.cfg.log) {
			console.log(par);
		}
	},

	handle(name, par = null) {

		if (par != null && typeof par != 'undefined') {
			if (typeof par.origin != 'undefined') {
				gtms.log(`message: ${par.origin}`);
			}
		}

		if (name == 'ch_purchase') {
			
			if (par.origin == 'https://cpg.pay.my.com' || par.origin == 'https://pay.my.com') {
				var data = JSON.parse(par.data);
				console.log('ch_purchase handle:');
				console.log(data);
				if (data.action == 'stateSubmitButton') {
					gtms.push('ch_purchase_init');
				}

				if (data.action == 'paySuccess') {
					gtms.push('ch_purchase_finish');
				}
			}
		}

		if (name == 'ch_visit') {

			if (gtms.user.status == 1) {
				gtms.push('ch_visit', {'userID' : gtms.user.id});
			}

		}

		if (name == 'ch_registration_finish') {

			if (gtms.cookie.read('gtms_reg') != null && gtms.user.id != 0) {
				gtms.push('ch_registration_finish', {'userID' : gtms.user.id});
				gtms.cookie.del('gtms_reg');
			}

		}

	},

	event : {

		'ch_purchase_init' : {
			'event': 'ch.purchase.init',
		},

		'ch_purchase_finish' : {
			'event': 'ch.purchase.finish',
		},

		'ch_visit' : {
			'event' : 'ch.visit', 'userID' : 0,
		},

		'ch_registration_init' : {
			'event' : 'ch.registration.init',
		},

		'ch_registration_project' : {
			'event' : 'ch.registration.project',
		},

		'ch_registration_finish' : {
			'event' : 'ch.registration.finish', 'userID' : 0,
		},

		'ch_click_download' : {
			'event' : 'ch.click.download',
		},

	},

	event_test : {

	},

};

// Events

document.addEventListener('oauthUser', function(e) {
	gtms.init();
});

document.addEventListener('click', function(e) {

	if (e.target.matches('.js-reg')) {
		gtms.push('ch_registration_init');
	}

	if (e.target.matches('.js-reg-project:not(.disabled)')) {
		gtms.cookie.set('gtms_reg', 1);
	}

	if (e.target.matches('.js-download')) {
		gtms.push('ch_click_download');
	}

	// deprecated
	
	if (e.target.matches('.js-show-oauth-signup')) {
		gtms.push('ch_registration_init');
	}

	if (e.target.matches('[data-ovl-link="ovl-reg-main"]')) {
		gtms.push('ch_registration_init');
	}

	if (e.target.matches('#reg_finish_button:not(.is-disabled)')) {
		gtms.cookie.set('gtms_reg', 1);
	}

	if (e.target.matches('.js-reg-button:not(.is-disabled)')) {
		gtms.cookie.set('gtms_reg', 1);
	}

});

document.addEventListener('oauth_reg_project_open', function(e) {
	gtms.push('ch_registration_project');
});

window.addEventListener('message', function(e) {
	gtms.handle('ch_purchase', e);
});
