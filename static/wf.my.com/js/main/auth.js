
var oauth = {

	cfg : {

		account : {
			redirect_uri  : encodeURIComponent('https://pc.warface.com/dynamic/auth/?o2=1'),
			client_id     : 'wf.my.com',
			response_type : 'code',
			signup_method : encodeURIComponent('email,phone'),
			signup_social : encodeURIComponent('mailru,fb,vk,g,ok,twitch,tw,ps,xbox,steam'),
			lang          : 'en_US',
			gc_id         : '13.2000076',
		},

		gems : {
			auth : 0,

			client_id : 'wf.my.com',
			continue  : document.location.href,
			failure   : 'https://pc.warface.com/?error',

			lang: 'en_US',

			no_headline : 1,
			no_header   : 1,

			signup_subscribe : 1,
			signup_continue  : '',
			signup_repeat    : 0,
			signup_soc_steam : 1,
			signup_captcha   : 'recaptcha',

			without_css : 1,

			gc_id : '13.2000076',
			gc_download_url : 'https://the.earth.li/~sgtatham/putty/latest/w64/putty.exe',
			gc_download_heading : 'Warface installation',
			gc_download_pic_path : 'https://pc.warface.com/static/wf.my.com/img/main/content/download',
		},

		present : null,
		mailing : 1,

		captcha : {
			active  : 0,
			sitekey : '',
			theme   : 'light', /* light, dark */
		},

	},

	gems : {

		init() {
			if (typeof promo_present != 'undefined') {
				oauth.cfg.present = promo_present;
				oauth.cfg.gems['signup_continue'] += `&promo_present=${promo_present}`;
			}
			window.__GEMS = Object.assign({}, oauth.cfg.gems);
			oauth.generate.script('https://store.my.games/hotbox/gem_static/leela/header.js', {'charset' : 'utf-8'});
		},

	},

	user : {
		status : 0,
		id     : 0,
		name   : '',
		email  : '',
		new    : 0,
		steam  : 0,
		social : 0,
	},

	tpl : {},

	init() {

		var lang = oauth.get_lang(0),
			lang_ext = oauth.get_lang(1);

		oauth.cfg.account.lang = lang_ext;
		oauth.cfg.gems.lang = lang_ext;
		this.text = (typeof this.tpl.text[lang] != 'undefined') ? this.tpl.text[lang] : this.tpl.text['en'];

		this.read_config();
		this.generate.style();
		this.generate.modal();
		this.user_block.init();
		this.get_user();
		this.gems.init();

		if (this.cfg.captcha.active) {
			this.captcha.init();
		}

	},

	reg() {

		if (oauth.user.status == 0) {
			var link = oauth.browser_modal.get_account_link() + '&signup=1';
			oauth.browser_modal.open(link);
		}

		if (oauth.user.status == 2) {
			oauth.page_modal.open('reg_project');
			oauth.event('oauth_reg_project_open');
		}

	},

	login(force = null) {

		var link = oauth.browser_modal.get_account_link();

		if (force != null) {
			link += '&force_signup_social=' + force;
		}

		this.browser_modal.open(link);

	},

	logout() {

		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function()
		{
			if (xhr.readyState == 4 && xhr.status == 200) {
				document.location.reload();
			}
		}
		xhr.open('get', `https://${window.location.host}/dynamic/auth/?a=logout`);
		xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
		xhr.send();

	},

	get_user() {

		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function()
		{
			if (xhr.readyState == 4 && xhr.status == 200)
			{
				try {
					var data = JSON.parse(xhr.responseText);
				}
				catch(e) {
					var data = xhr.responseText;
				}
				finally {

					oauth.user.status = (typeof data.status != 'undefined') ? data.status : 0;
					oauth.user.social = (typeof data.is_social != 'undefined') ? ((data.is_social) ? 1 : 0) : 0;

					if (typeof data.user != 'undefined') {
						oauth.user.id = (typeof data.user.uid != 'undefined') ? data.user.uid : 0;
						oauth.user.name = (typeof data.user.name != 'undefined') ? data.user.name : '';
						oauth.user.email = (typeof data.user.mail != 'undefined') ? data.user.mail : '';
						oauth.user.new = (typeof data.user.isNew != 'undefined') ? ((data.user.isNew) ? 1 : 0) : 0;
						oauth.user.steam = (typeof data.user.steam != 'undefined') ? ((data.user.steam) ? 1 : 0) : 0;
					}

					if (oauth.user.status == 2) {
						oauth.user.email = (typeof data.mail != 'undefined') ? data.mail : '';
						if (oauth.cfg.mailing) {
							oauth.mailing.init();
						}
						if (oauth.cookie.read('reg_postpone') != 1) {
							oauth.page_modal.open('reg_project');
						}
					}

				}

				oauth.event('oauthUser');
			}
		}
		xhr.open('get', `https://${window.location.host}/dynamic/auth/?a=checkuser`);
		xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
		xhr.send();

	},

	download() {

		if (oauth.user.status == 1) {

			if (oauth.user.steam) {
				window.open('https://store.steampowered.com/app/291480', '_blank');
			}
			else {
				__GEM.detectGameCenter().then(
					result => {
						__GEM.downloadGame();
					},
					error => {
						window.location.href = window.__GEMS.gc_download_url;
					}
				);
			}

		}
		else {
			oauth.reg();
		}

	},

	read_config() {

		if (typeof oauth_cfg != 'undefined') {
			for (var key of Object.keys(oauth.cfg)) {
				if (typeof oauth_cfg[key] != 'undefined') {

					if (oauth.cfg[key] && typeof oauth.cfg[key] === 'object' && oauth.cfg[key].constructor === Object) {
						oauth.cfg[key] = Object.assign(oauth.cfg[key], oauth_cfg[key]);
					}
					else {
						oauth.cfg[key] = oauth_cfg[key];
					}

				}
			}
		}

	},

	browser_modal : {

		el : null,

		open(link, w = 504, h = 500) {

			if (oauth.browser_modal.el == null || oauth.browser_modal.el.closed) {

				var dualScreenLeft = window.screenLeft != undefined ? window.screenLeft : window.screenX,
				dualScreenTop = window.screenTop != undefined ? window.screenTop : window.screenY,
				width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width,
				height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height,
				systemZoom = width / window.screen.availWidth,
				left = (width - w) / 2 / systemZoom + dualScreenLeft,
				top = (height - h) / 2 / systemZoom + dualScreenTop - 100;

				oauth.browser_modal.el = window.open(link, `Account`, `width=${w / systemZoom}, height=${h / systemZoom}, top=${top}, left=${left}, scrollbars=no`);

			}
			else {
				oauth.browser_modal.el.focus();
			}

		},

		get_account_link() {

			let link = 'https://account.my.games/oauth2/',
				sep = '?',
				par = Object.assign({}, oauth.cfg.account);

			for (var key in par) {
				link += sep + key + '=' + par[key];
				if (sep == '?') sep = '&';
			}

			link += `&lang=${oauth.cfg.account.lang}`;

			return link;

		},

	},

	page_modal : {

		el   : null,
		cont : null,

		open(name) {

			var tpl = oauth.tpl.get(name);

			if (tpl != null) {
				document.querySelector('body').classList.add('oauth_page_modal_active');
				oauth.page_modal.cont.setAttribute('data', name);
				oauth.page_modal.cont.innerHTML = tpl;
				oauth.page_modal.el.classList.add('active');

				if (name == 'reg_project' && oauth.cfg.captcha.active && oauth.captcha.loaded) {
					oauth.captcha.render();
				}
			}

		},

		close() {

			if (oauth.page_modal.cont.getAttribute('data') == 'reg_project') {
				oauth.cookie.set('reg_postpone', 1);
			}
			document.querySelector('body').classList.remove('oauth_page_modal_active');
			oauth.page_modal.el.classList.remove('active');
			oauth.page_modal.cont.removeAttribute('data');

		},

		reg_status() {

			var status = 1,
				checkbox = document.querySelector('.oauth_page_modal input.js-reg-checkbox'),
				button = document.querySelector('.oauth_page_modal .js-reg-project');

			if (!checkbox.checked) {
				status = 0;
			}

			if (oauth.cfg.captcha.active && !oauth.captcha.status) {
				status = 0;
			}

			if (status) {
				button.classList.remove('disabled');
			}
			else {
				button.classList.add('disabled');
			}

		},

		reg_project(button) {

			if (!button.classList.contains('loading') && !button.classList.contains('disabled')) {

				var present_par = (oauth.cfg.present != null) ? `&promo_present=${oauth.cfg.present}`: '',
					checkbox = document.querySelectorAll('.oauth_page_modal input[type="checkbox"]'),
					checkbox_subscribe = document.querySelector('.js-subscribe'),
					subscribe_par = '';

				if (checkbox_subscribe != null) {
					if (checkbox_subscribe.checked) {
						subscribe_par = '&subscribe=true';
					}
				}

				checkbox.forEach(el => el.setAttribute('disabled', 'disabled'));
				button.classList.add('loading');

				var xhr = new XMLHttpRequest();
				xhr.onreadystatechange = function()
				{
					if (xhr.readyState == 4) {
						if (xhr.status == 200) {
							oauth.cookie.del('reg_postpone');
							document.location.reload();
						}
						if (xhr.status >= 400) {
							oauth.page_modal.open('error');
						}
					}
				}
				xhr.open('post', `https://${window.location.host}/dynamic/auth/?confirm_reg=true${present_par}${subscribe_par}`);
				xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
				xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
				xhr.send();

			}

		},

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

	event(name) {

		var event = new Event(name);
		document.dispatchEvent(event);

	},

	generate : {

		style() {
			var el = document.createElement('style');
			el.setAttribute('data', 'oauth');
			el.innerHTML = oauth.tpl.css;
			document.head.appendChild(el);
		},

		modal() {
			var el = document.createElement('div');
			el.classList.add('oauth_page_modal');
			el.innerHTML = oauth.tpl.get('page_modal');
			document.body.appendChild(el);

			oauth.page_modal.el = el;
			oauth.page_modal.cont = document.querySelector('.oauth_modal_inner');
		},

		script(src, attr = {}) {
			var el = document.createElement('script');
			el.setAttribute('src', src);
			for (var key in attr) {
				el.setAttribute(key, attr[key]);
			}
			document.head.appendChild(el);
		},

	},

	mailing : {

		tpl : '',

		init() {
			if (oauth.cfg.mailing && !oauth.user.social) {
				oauth.mailing.tpl = oauth.tpl.get('mailing');
			}
			else {
				oauth.mailing.tpl = '';
			}
		},

	},

	captcha : {

		status : 0,
		loaded : 0,

		tpl : '',

		init() {
			window.captcha_success = () => oauth.captcha.success();
			window.captcha_expired = () => oauth.captcha.expired();
			window.captcha_onload = () => oauth.captcha.onload();
			oauth.captcha.tpl = oauth.tpl.get('captcha');
			oauth.generate.script('https://www.google.com/recaptcha/api.js?onload=captcha_onload');
		},

		success() {
			oauth.captcha.status = 1;
			oauth.page_modal.reg_status();
		},

		expired() {
			oauth.captcha.status = 0;
			oauth.page_modal.reg_status();
		},

		onload() {
			oauth.captcha.loaded = 1;
		},

		render() {
			try {
				grecaptcha.render('oauth_recaptcha', {'sitekey' : oauth.cfg.captcha.sitekey, 'theme' : oauth.cfg.captcha.theme});
			}
			catch(e) {}
		},

	},

	user_block : {

		list : null,

		init() {

			oauth.user_block.list = document.querySelectorAll('.js-user-block');
			oauth.user_block.list.forEach(el => {
				el.classList.add('loading');
				el.innerHTML = '';
			});

		},

		update() {

			oauth.user_block.list.forEach(el => {

				var status = oauth.user.status,
					tpl = oauth.tpl.get(`user_block_state_${status}`);
				el.innerHTML = tpl;
				el.classList.remove('loading');

			});

		},

	},

	get_lang(extended = 0) {

		var	list = {
			'en' : 'en_US',
			'fr' : 'fr_FR',
			'de' : 'de_DE',
			'pl' : 'pl_PL',
			'es' : 'es_ES',
			'pt' : 'pt_BR',
			'cn' : 'zh_CN',
			'ko' : 'ko_KR',
			'jp' : 'ja_JP',
			'tr' : 'tr_TR',
		};

		if (oauth.cookie.read('cur_language') != null) {
			var lang = oauth.cookie.read('cur_language');
		}
		else {
			var keys = Object.keys(list),
				lang = keys[0],
				loc = document.location.href.split('/');

			for (var k in loc) {
				if (keys.includes(loc[k])) {
					lang = loc[k];
				}
			}
		}

		if (extended) {
			lang = list[lang];
		}

		return lang;

	},

};

// Events

document.addEventListener('DOMContentLoaded', function(e){
	oauth.init();
});

document.addEventListener('oauthUser', function(e){
	oauth.user_block.update();
});

document.addEventListener('click', function(e) {

	// auth

	if (e.target.matches('.js-reg')) {
		oauth.reg();
	}

	if (e.target.matches('.js-login')) {
		oauth.login();
	}

	if (e.target.matches('.js-logout')) {
		oauth.logout();
	}

	if (e.target.matches('.js-download')) {
		oauth.download();
	}

	// auth deprecated

	if (e.target.classList.contains('js-show-oauth-login')) {
		oauth.login();
	}

	if (e.target.classList.contains('js-show-oauth-signup')) {
		oauth.reg();
	}

	if (e.target.classList.contains('js-menu-change-user')) {
		oauth.logout();
	}

	// page modal

	if (e.target.matches('.js-reg-checkbox')) {
		oauth.page_modal.reg_status();
	}

	if (e.target.matches('.js-reg-project')) {
		oauth.page_modal.reg_project(e.target);
	}

	if (e.target.matches('.js-modal-close')) {
		oauth.page_modal.close();
	}

});

// Templates

oauth.tpl.get = (name) => {
	var text = oauth.text;
	var list = {

	page_modal : `
		<div class="oauth_page_modal_overlay"></div>
		<div class="oauth_page_modal_section">
			<div class="oauth_modal_top">
				<div class="oauth_modal_close js-modal-close"></div>
			</div>
			<div class="oauth_modal_content">
				<div class="oauth_modal_inner"></div>
			</div>
		</div>
	`,

	error : `
		<strong>${text.error.title}</strong>
		<p class="center">${text.error.later}</p>
		<div class="oauth_modal_button js-modal-close">${text.error.ok}</div>
	`,

	reg_project : `
		<strong>${text.reg.title}</strong>
		${oauth.mailing.tpl}
		<p>
			<input type="checkbox" id="oauth_reg_terms" class="oauth_modal_cb js-reg-checkbox" autocomplete="off">
			<label for="oauth_reg_terms">
				${text.reg.policy.p1}
				<a href="${text.reg.link_1}" target="_blank">${text.reg.policy.d1}</a>${text.reg.policy.p2}
				<a href="${text.reg.link_2}" target="_blank">${text.reg.policy.d2}</a>${text.reg.policy.p3}
				<a href="${text.reg.link_3}" target="_blank">${text.reg.policy.d3}</a>${text.reg.policy.p4}
			</label>
		</p>
		${oauth.captcha.tpl}
		<div class="oauth_modal_button disabled js-reg-project">${text.reg.register}</div>
	`,

	mailing : `
		<p><input type="checkbox" id="subscribe" class="oauth_modal_cb js-subscribe" autocomplete="off"><label for="subscribe">${text.reg.subscribe}</label></p>
	`,

	captcha : `
		<div class="g-recaptcha" id="oauth_recaptcha" data-sitekey="${oauth.cfg.captcha.sitekey}" data-callback="captcha_success" data-expired-callback="captcha_expired" data-theme="${oauth.cfg.captcha.theme}"></div>
	`,

	user_block_state_0 : `
		<div class="item js-login">${text.user_block.login}</div>
		<div class="item js-reg">${text.user_block.reg}</div>
	`,

	user_block_state_1 : `
		<div class="name">${oauth.user.name}</div>
		<div class="item js-logout">${text.user_block.logout}</div>
	`,

	user_block_state_2 : `
		<div class="item js-reg">${text.user_block.reg_project}</div>
		<div class="item js-logout">${text.user_block.logout}</div>
	`,

	};
	return list[name] || null;
};

oauth.tpl.text = {

	en : {

		reg : {
			title        : 'Register in project «Warface»',
			subscribe    : 'I would like to subscribe to Warface mailing list to receive latest news and interesting deals.',
			policy       : {p1: 'I agree with MY.GAMES ', d1: 'Terms of Use', p2: ', ', d2: 'Privacy Policy', p3: ' and ', d3: 'EULA', p4: ' for Games.'},
			link_1		 : 'https://documentation.my.games/terms/mygames_tou',
			link_2		 : 'https://documentation.my.games/terms/mygames_privacy',
			link_3		 : 'https://documentation.my.games/terms/mygames_eula',
			register     : 'Register',
		},

		error : {
			title        : 'Error',
			later        : 'An error has occurred. Please try again later.',
			ok           : 'Ok',
		},

		user_block : {
			login         : 'Log In',
			reg           : 'Sign Up',
			reg_project   : 'Register',
			logout        : 'Log Out',
		},

	},

	fr : {

		reg : {
			title        : `S'inscrire dans le projet «Warface»`,
			subscribe    : `Je souhaite m'inscrire à la liste de diffusion Warface pour recevoir les dernières nouvelles et offres intéressantes.`,
			policy       : {p1: `J'accepte les `, d1: `Conditions d'utilisation`, p2: `, la `, d2: `Politique de confidentialité`, p3: ` et la `, d3: `EULA`, p4: ` de MY.GAMES pour les jeux.`},
			link_1		 : 'https://documentation.my.games/terms/mygames_tou',
			link_2		 : 'https://documentation.my.games/terms/mygames_privacy',
			link_3		 : 'https://documentation.my.games/terms/mygames_eula',
			register     : `S'inscrire`,
		},

		error : {
			title        : `Erreur`,
			later        : `Une erreur est survenue. Veuillez réessayer plus tard.`,
			ok           : `D'accord`,
		},

		user_block : {
			login         : `Se connecter`,
			reg           : `S'inscrire`,
			reg_project   : `S'inscrire`,
			logout        : `Se déconnecter`,
		},

	},

	de : {

		reg : {
			title        : 'Registriere dich für das projekt «Warface»',
			subscribe    : 'Ich möchte die Warface-Mailingliste abonnieren, um die neuesten Nachrichten und interessante Angebote zu erhalten.',
			policy       : {p1: 'Ich stimme den ', d1: 'Nutzungsbedingungen', p2: ', ', d2: 'Datenschutzerklärung', p3: ' und ', d3: 'EULA', p4: ' für Spiele von MY.GAMES zu.'},
			link_1		 : 'https://documentation.my.games/terms/mygames_tou',
			link_2		 : 'https://documentation.my.games/terms/mygames_privacy',
			link_3		 : 'https://documentation.my.games/terms/mygames_eula',
			register     : 'Registrieren',
		},

		error : {
			title        : 'Error',
			later        : 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später noch einmal.',
			ok           : 'OK',
		},

		user_block : {
			login         : 'Anmelden',
			reg           : 'Registrieren',
			reg_project   : 'Registrieren',
			logout        : 'Ausloggen',
		},

	},

	pl : {

		reg : {
			title        : 'Zarejestruj się w projekcie «Warface»',
			subscribe    : 'Chciałbym zapisać się na listę mailingową Warface, aby otrzymywać najnowsze wiadomości i ciekawe oferty.',
			policy       : {p1: 'Zgadzam się z ', d1: 'Warunkami użytkowania', p2: ', ', d2: 'Polityką prywatności', p3: ' i ', d3: 'EULA', p4: ' gier MY.GAMES.'},
			link_1		 : 'https://documentation.my.games/terms/mygames_tou',
			link_2		 : 'https://documentation.my.games/terms/mygames_privacy',
			link_3		 : 'https://documentation.my.games/terms/mygames_eula',
			register     : 'Rejestracja',
		},

		error : {
			title        : 'Błąd',
			later        : 'Wystąpił błąd. Spróbuj ponownie później.',
			ok           : 'Dobrze',
		},

		user_block : {
			login         : 'Zaloguj',
			reg           : 'Zarejestruj się',
			reg_project   : 'Rejestracja',
			logout        : 'Wyloguj',
		},

	},

	es : {

		reg : {
			title        : 'Registrarse en el proyecto «Warface»',
			subscribe    : 'Me gustaría suscribirme a la lista de correo de Warface para recibir las últimas noticias y ofertas interesantes.',
			policy       : {p1: 'Acepto los ', d1: 'Términos de uso', p2: ', la ', d2: 'Política de privacidad', p3: ' y la ', d3: 'EULA', p4: ' de juegos de MY.GAMES.'},
			link_1		 : 'https://documentation.my.games/terms/mygames_tou',
			link_2		 : 'https://documentation.my.games/terms/mygames_privacy',
			link_3		 : 'https://documentation.my.games/terms/mygames_eula',
			register     : 'Registrarse',
		},

		error : {
			title        : 'Error',
			later        : 'Se ha producido un error. Por favor, inténtelo de nuevo más tarde.',
			ok           : 'Okay',
		},

		user_block : {
			login         : 'Iniciar sesión',
			reg           : 'Inscribirse',
			reg_project   : 'Registrarse',
			logout        : 'Cerrar sesión',
		},

	},

	cn : {

		reg : {
			title        : '注册《战争前线》项目',
			subscribe    : '我想订阅Warface邮件列表以接收最新消息和有趣的交易。',
			policy       : {p1: '我同意MY.GAMES', d1: '网站使用条款', p2: '', d2: '隐私策略', p3: '和', d3: '最终用户许可协议', p4: '游戏。'},
			link_1		 : 'https://documentation.my.games/terms/mygames_tou',
			link_2		 : 'https://documentation.my.games/terms/mygames_privacy',
			link_3		 : 'https://documentation.my.games/terms/mygames_eula',
			register     : '注册',
		},

		error : {
			title        : '错误',
			later        : '发生了错误。 请稍后再试。',
			ok           : '好',
		},

		user_block : {
			login         : '登录',
			reg           : '注册',
			reg_project   : '注册',
			logout        : '登出',
		},

	},

	ru : {

		reg : {
			title        : 'Регистрация в проекте «Warface»',
			subscribe    : 'Я бы хотел подписаться на рассылку Warface, чтобы получать последние новости и интересные предложения.',
			policy       : {p1: 'Я принимаю условия ', d1: 'Пользовательского соглашения', p2: ', ', d2: 'Политики конфиденциальности', p3: ' и ', d3: 'EULA', p4: '.'},
			link_1		 : 'https://documentation.my.games/terms/mygames_tou',
			link_2		 : 'https://documentation.my.games/terms/mygames_privacy',
			link_3		 : 'https://documentation.my.games/terms/mygames_eula',
			register     : 'Зарегистрироваться',
		},

		error : {
			title        : 'Ошибка',
			later        : 'Произошла ошибка. Попробуйте повторить запрос позже.',
			ok           : 'Ok',
		},

		user_block : {
			login         : 'Войти',
			reg           : 'Регистрация',
			reg_project   : 'Зарегистрироваться',
			logout        : 'Выйти',
		},

	},

	tr : {

		reg : {
			title        : '«Warface» projesine kaydol',
			subscribe    : 'En son haberler ve cazip tekliflerden haberdar olmak için Warface e-posta listesine abone olmak istiyorum.',
			policy       : { p1: 'Şunları kabul ediyorum: Oyunlar için MY.GAMES ', d1: 'Kullanım Şartları', p2: ', ', d2: 'Gizlilik Politikası', p3: ' ve ', d3: 'EULA (Son Kullanıcı Lisans Anlaşması)', p4: '.'},
			link_1		 : 'https://documentation.my.games/terms/mygames_tou',
			link_2		 : 'https://documentation.my.games/terms/mygames_privacy',
			link_3		 : 'https://documentation.my.games/terms/mygames_eula',
			register     : 'Kaydol',
		},

		error : {
			title        : 'Hata',
			later        : 'Bir hata meydana geldi. Lütfen daha sonra tekrar dene.',
			ok           : 'Tamam',
		},

		user_block : {
			login         : 'Giriş Yap',
			reg           : 'Kaydol',
			reg_project   : 'Kaydol',
			logout        : 'Çıkış Yap',
		},

	},

};

oauth.tpl.style = {

	layout : {
		bg    : '#323236',
		close : ['#78787c', '#fff'],
		font  : 'normal 13px/1.54 Roboto, Arial',
	},

	title : {
		color : '#fff',
		font  : '500 20px/24px Roboto, Arial',
		case  : 'none',
	},

	section : {
		color : '#a8a8ab',
		link  : {
			color : ['#fff', '#ababae'],
			case  : ['none', 'none'],
		}
	},

	button : {
		bg    : ['#fff', '#c7c8cb'],
		color : ['#000', '#000'],
		font  : '500 17px/18px Roboto, Arial',
		case  : 'none',
	},

	user_block : {
		color : '#fff',
		font  : 'normal 14px/38px Roboto, Arial',
		case  : 'uppercase',
		name  : {
			color : 'inherit',
			case  : 'none',
		}
	},

};

oauth.tpl.css = `

@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500&display=swap');

/* Modal */

.oauth_page_modal {
	width: 100%;
	height: 100%;
	min-width: 320px;
	display: none;
	position: fixed;
	left: 0px;
	top: 0px;
	font: ${oauth.tpl.style.layout.font};
	z-index: 1000;
}
.oauth_page_modal.active {
	display: block;
}

	.oauth_page_modal_overlay {
		width: 100%;
		height: 100%;
		background: rgba(0,0,0,0.9);
	}

	.oauth_page_modal_section {
		width: 644px;
		position: absolute;
		box-sizing: border-box;
		left: 50%;
		top: 50%;
		transform: translate(-50%,-50%);
		background: ${oauth.tpl.style.layout.bg};
		border-radius: 4px;
		overflow: hidden;
		cursor: default;
	}

	.oauth_modal_content {}

		.oauth_modal_top {
			height: 50px;
			display: flex;
			justify-content: flex-end;
			align-items: center;
			position: relative;
			background: #242429 url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTM3IiBoZWlnaHQ9IjI0IiB2aWV3Qm94PSIwIDAgMTM3IDI0IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMjEuODkzIDBsLTUuNzk2IDYuNDY3TDEwLjMxLjAwOCAwIDExLjUxM2w0LjQxOCA0LjkzIDUuODIzLTYuNDk3IDUuNzk5IDYuNDcyIDUuODI1LTYuNSAyLjMzOCAyLjYxNS01LjgyMiA2LjQ5N0wyMi44MzQgMjQgMzkuODggNC45OCAzNS40MjUuMDFsLTYuNzYyIDcuNTQ1TDIxLjg5MyAwem00Ni44MDEgNi4yNjlMNjUuMjYgMTEuMTVsLTMuNTk4LTQuODhoLTIuNTZsNS4wMzYgNi44MDd2NC4xMzZoMi4xODN2LTQuMTM4bDQuODk3LTYuODA1aC0yLjUyNHptMTEuODIgNC45MTh2MS45MjJoMy43MTR2Mi4xMjljLS44MTMuMjMzLTEuNzk2LjM2NS0yLjcyNi4zNjUtMi44NTMgMC00LjU1Ny0xLjM2Ny00LjU1Ny0zLjY1NiAwLTIuMTg3IDEuODMxLTMuNjU2IDQuNTU3LTMuNjU2IDEuMyAwIDIuNjU1LjI3MiAzLjkxNy43ODhsLjIwMS4wODIuNjcyLTEuODIyLS4xODEtLjA3MmExMi44MiAxMi44MiAwIDAwLTQuNzU4LS45M2MtMy45ODkgMC02LjY2OCAyLjI5My02LjY2OCA1LjcwNyAwIDMuNDUyIDIuNTE3IDUuNTE0IDYuNzM0IDUuNTE0IDEuNjYzIDAgMy41NzQtLjM4IDQuODY4LS45NjdsLjExNy0uMDUzdi01LjM1MWgtNS44OXptMzkuMzgzIDQuMjg4di0yLjY4N2g1LjQ5NnYtMS45MjJoLTUuNDk2VjguMzRoNi4wNjJWNi40MTdoLTguMjM5djEwLjk4aDguMzM5di0xLjkyMmgtNi4xNjJ6bTEyLjY4Ni00LjU2OGMtMS42OTctLjIzMS0yLjcyNy0uNDM4LTIuNzI3LTEuMzUzIDAtLjgwMi44NTQtMS4yNjMgMi4zNDMtMS4yNjMgMS41NjQgMCAyLjkxNC41NyAzLjQyMi44MTVsLjE4NS4wOS44NTgtMS42OTYtLjE2NS0uMDkzYy0xLjE5Ny0uNjctMi44NDktMS4wNy00LjQxNy0xLjA3LTIuODA5IDAtNC40ODYgMS4yMzktNC40ODYgMy4zMTMgMCAxIC4zNTUgMS43MzYgMS4wODQgMi4yNDkuODk1LjYyOCAyLjE5OC44MDUgMy4zNDguOTYgMS42MzEuMjIxIDIuNjMuNCAyLjYzIDEuMjU2IDAgMS4zNDMtMS45NjUgMS40ODgtMi44MDkgMS40ODgtMS4yNjQgMC0yLjQzMy0uMzA5LTMuNDc0LS45MTlsLS4xODItLjEwNi0uOTk4IDEuNzA1LjE2MS4xMDJjLjg0NS41MzUgMi4zMDggMS4xNzIgNC40NzYgMS4xNzIgMy4wOSAwIDUuMDg2LTEuMzgyIDUuMDg2LTMuNTIyIDAtMi41MzYtMi40MDQtMi44NjQtNC4zMzUtMy4xMjh6bS04NS41MDkgNi40ODhsMi4yMTEtNi4wNjkgMy43MzUgNi4wMyAzLjczNC02LjAzIDIuMjEyIDYuMDY5aDIuMjc0bC0zLjk3Ni0xMS4wNS00LjI0NCA2Ljg3Ni00LjI0NS02Ljg3Ny0zLjk3NiAxMS4wNWgyLjI3NXptNDYuMzcyLTYuNjA0bDEuNjg2IDIuOTE1aC0zLjM2OGwxLjY4Mi0yLjkxNXptLTMuODIzIDYuNjA3bDEuMTctMi4wMTcgNS4zMDUtLjAwMyAxLjE2OSAyLjAyaDIuNDYzbC02LjI4NS0xMS4wNS02LjI4NyAxMS4wNWgyLjQ2NXptMTIuOTAyIDBsMi4yMTEtNi4yNDQgMy43MzUgNi4yMDUgMy43MzUtNi4yMDUgMi4yMTEgNi4yNDRoMi4yNzRsLTMuOTc1LTExLjA1LTQuMjQ1IDYuODc3LTQuMjQ1LTYuODc3LTMuOTc1IDExLjA1aDIuMjc0em0tMjkuNDcxLTEuNzE2bC0xLjk0NSAxLjg3Ni0xLjk0NC0xLjg3NiAxLjk0NC0xLjg3NSAxLjk0NSAxLjg3NXoiIGZpbGw9IiNGNUY1RjciLz48L3N2Zz4=) center center no-repeat;
		}

			.oauth_modal_close {
				width: 48px;
				height: 50px;
				color: ${oauth.tpl.style.layout.close[0]};
				font: 28px/44px Tahoma;
				cursor: pointer;
			}
			.oauth_modal_close::before {
				content: '\\d7';
				width: 100%;
				height: 100%;
				display: block;
				text-align: center;
			}
			.oauth_modal_close:hover {
				color: ${oauth.tpl.style.layout.close[1]};
			}
			.oauth_modal_close:active {
				opacity: 0.5;
			}

		.oauth_modal_inner {
			padding: 12px 32px 20px;
		}

		.oauth_modal_inner strong {
			display: block;
			padding: 8px 0px;
			color: ${oauth.tpl.style.title.color};
			font: ${oauth.tpl.style.title.font};
			text-align: center;
			text-transform: ${oauth.tpl.style.title.case};
		}

		.oauth_modal_inner p {
			margin: 14px 0px;
			padding: 0px;
			color: ${oauth.tpl.style.section.color};
			font: ${oauth.tpl.style.layout.font};
			text-align: left;
			text-transform: none;
		}
		.oauth_modal_inner p.center {
			text-align: center;
		}

			.oauth_modal_inner a {
				color: ${oauth.tpl.style.section.link.color[0]};
				font: ${oauth.tpl.style.layout.font};
				text-decoration: ${oauth.tpl.style.section.link.case[0]};
				transition: color 0.1s;
			}
			.oauth_modal_inner a:hover {
				color: ${oauth.tpl.style.section.link.color[1]};
				text-decoration: ${oauth.tpl.style.section.link.case[1]};
			}

			.oauth_modal_inner hr {
				margin: 16px 0px;
				border: 1px solid rgba(0,0,0,0);
				border-bottom-color: rgba(255,255,255,0.1);
			}

			.oauth_modal_inner li {
				color: ${oauth.tpl.style.section.color};
				font: ${oauth.tpl.style.layout.font};
			}
			.oauth_modal_inner li::marker {
				color: ${oauth.tpl.style.section.link[0]};
			}

		.oauth_modal_inner label {
			display: block;
			position: relative;
			padding-left: 30px;
			cursor: pointer;
			-webkit-user-select: none;
			-ms-user-select: none;
			user-select: none;
		}
		.oauth_modal_inner label::before {
			content: '';
			width: 20px;
			height: 20px;
			position: absolute;
			top: -1px;
			left: 0px;
			background-color: #3c3c40;
			border: 1px solid #626262;
			border-radius: 3px;
		}

		.oauth_modal_inner label,
		.oauth_modal_inner label a {
			font-size: 13px;
			line-height: 1.54;
		}

		.oauth_modal_inner input.oauth_modal_cb {
			width: 0px;
			height: 0px;
			position: absolute;
			left: 0px;
			opacity: 0;
		}
		.oauth_modal_inner input.oauth_modal_cb:checked + label::before {
			background: #e2e3e7 url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjYiPjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgZD0iTTcuNy4zYy0uNC0uNC0xLS40LTEuNCAwTDMgMy42IDEuNyAyLjNjLS40LS40LTEtLjQtMS40IDAtLjQuNC0uNCAxIDAgMS40bDIgMmMuMi4yLjQuMy43LjMuMyAwIC41LS4xLjctLjNsNC00Yy40LS40LjQtMSAwLTEuNHoiLz48L3N2Zz4=) no-repeat 50%;
			background-size: 10px 7px;
			border-color: #e2e3e7;
		}

		.oauth_modal_button {
			width: 60%;
			height: 48px;
			display: flex;
			box-sizing: border-box;
			justify-content: center;
			align-items: center;
			margin: 32px auto 16px;
			padding: 12px;
			color: ${oauth.tpl.style.button.color[0]};
			font: ${oauth.tpl.style.button.font};
			text-align: center;
			text-transform: ${oauth.tpl.style.button.case};
			background: ${oauth.tpl.style.button.bg[0]};
			border-radius: 4px;
			cursor: pointer;
			-webkit-user-select: none;
			-ms-user-select: none;
			user-select: none;
		}
		.oauth_modal_button:not(.loading):not(.disabled):hover {
			color: ${oauth.tpl.style.button.color[1]};
			background: ${oauth.tpl.style.button.bg[1]};
		}
		.oauth_modal_button:not(.loading):not(.disabled):active {
			opacity: 0.7;
		}

		.oauth_modal_button.disabled {
			color: #262626;
			background: #414141;
			filter: grayscale(1);
			cursor: default;
		}

		.oauth_modal_button.loading {
			color: rgba(0,0,0,0);
			filter: grayscale(1);
			opacity: 0.7;
			cursor: default;
		}
		.oauth_modal_button.loading::before {
			content: '';
			width: 100%;
			height: 100%;
			display: block;
			position: absolute;
			left: 0px;
			top: 0px;
			background: url(data:image/gif;base64,R0lGODlhKwALAPEAAHd3d////7i4uP///yH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAKwALAAACMoSOCMuW2diD88UKG95W88uF4DaGWFmhZid93pq+pwxnLUnXh8ou+sSz+T64oCAyTBUAACH5BAkKAAAALAAAAAArAAsAAAI9xI4IyyAPYWOxmoTHrHzzmGHe94xkmJifyqFKQ0pwLLgHa82xrekkDrIBZRQab1jyfY7KTtPimixiUsevAAAh+QQJCgAAACwAAAAAKwALAAACPYSOCMswD2FjqZpqW9xv4g8KE7d54XmMpNSgqLoOpgvC60xjNonnyc7p+VKamKw1zDCMR8rp8pksYlKorgAAIfkECQoAAAAsAAAAACsACwAAAkCEjgjLltnYmJS6Bxt+sfq5ZUyoNJ9HHlEqdCfFrqn7DrE2m7Wdj/2y45FkQ13t5itKdshFExC8YCLOEBX6AhQAADsAAAAAAAAAAAA=) center no-repeat;
			opacity: 0.4;
		}

.g-recaptcha > div {
	margin: 0px auto;
}

@media screen and (max-width: 720px) {

	body.oauth_page_modal_active {
		overflow: hidden;
	}

	.oauth_page_modal_section {
		width: 100%;
		overflow: auto;
	}

		.oauth_modal_top {
			height: 70px;
		}

		.oauth_modal_inner {
			min-height: 100%;
			display: flex;
			box-sizing: border-box;
			flex-direction: column;
			justify-content: center;
			padding-bottom: 40px;
		}

		.oauth_modal_button {
			width: 80%;
			padding: 16px;
		}

		.oauth_modal_close {
			width: 70px;
			height: 70px;
			position: fixed;
			font-size: 38px;
			line-height: 66px;
		}

}

@media screen and (max-width: 480px) {

		.oauth_modal_button {
			width: 100%;
		}

}

/* User block */

.js-user-block:not([data-style="none"]) {
	display: flex;
	color: ${oauth.tpl.style.user_block.color};
	font: ${oauth.tpl.style.user_block.font};
	text-transform: ${oauth.tpl.style.user_block.case};
	cursor: default;
}

.js-user-block[data-style~="column"] {
	flex-direction: column;
}
.js-user-block[data-style~="center"] {
	justify-content: center;
	align-items: center;
}

	.js-user-block[data-style~="inline"] > div {
		padding: 0px 12px;
	}
	.js-user-block[data-style~="inline"] > div:first-child {
		padding-left: 0px;
	}
	.js-user-block[data-style~="inline"] > div:last-child {
		padding-right: 0px;
	}

	.js-user-block:not([data-style="none"]) .item {
		text-decoration: none;
		cursor: pointer;
	}
	.js-user-block:not([data-style="none"]) .item:hover {
		text-decoration: underline;
	}
	.js-user-block:not([data-style="none"]) .item:active {
		text-decoration: none;
	}

	.js-user-block:not([data-style="none"]) .name {
		color: ${oauth.tpl.style.user_block.name.color};
		text-transform: ${oauth.tpl.style.user_block.name.case};
	}

`;
