
var modLoader = {

	cfg : {
		lang		: 'auto',
		lang_list	: ['en','fr','de','pl','es','pt','cn','tr'],
		dir_modules : '/static/wf.my.com/modules/site/',
		path_static : '/static/wf.my.com',
	},

	module : {
		name : '',
		ver  : '', // resources version
		lang : '', // redefine from params
		text : 1,  // get text from json
		auth : 0,  // auth required
	},

	data : {
		tpl  : null,
		text : null,
		site : {
			lang : '',
			host : '',
			static : '',
			par  : {}, // url params
			user : {}, // check_data response
		},
		user : {
			status : 0,
			id     : 0,
			name   : '',
			email  : '',
			steam  : false,
		},
		url_lang : null,
	},

	status : {
		tpl   : 0,
		text  : 0,
		user  : 0,
		error : 0,
	},

	el : {
		init : '', // initial script
		cont : '', // app container
		app  : '', // app script
	},

	init() {

		this.get_lang();
		this.get_module_params();
		this.insert_app_container();

	},

	get_lang() {

		if (this.cfg.lang == 'auto') {
			var par = window.location.pathname.split('/');
			if (typeof par[1] != 'undefined') {
				par = par[1];
				for (var key in this.cfg.lang_list) {
					if (par == this.cfg.lang_list[key]) {
						this.cfg.lang = par;
						this.data.url_lang = par;
					}
				}
			}
			if (this.cfg.lang == 'auto') {
				this.cfg.lang = this.cfg.lang_list[0];
			}
		}

		this.data.site.lang = this.cfg.lang;
	},

	get_module_params() {

		// get initial script
		const scripts = document.getElementsByTagName('script');
		this.el.init = scripts[scripts.length - 1];

		// get module data
		if (this.el.init.hasAttribute('data')) {

			var par = this.el.init.getAttribute('data').split(';');
			this.module.name = par[0];

			if (par.length > 1) {
				for (var key in par) {
					var val = par[key].trim().split('=');
					if (val.length == 2) {
						if (typeof this.module[val[0]] != undefined) {
							this.module[val[0]] = val[1];
						}
					}
				}
			}

		}
		else {
			// assign default module name
			var pathname_pos = (this.cfg.lang == 'ru') ? 1 : 2;
			var par = window.location.pathname.split('/');
			if (typeof par[pathname_pos] != 'undefined') {
				if (par[pathname_pos].length > 0) {
					this.module.name = par[pathname_pos];
				}
			}
		}

		// stringify module version
		if (this.module.ver != '') {
			this.module.ver = '?' + this.module.ver;
		}

		// redefine lang from params
		if (this.module.lang != '') {
			this.cfg.lang = this.module.lang;
			this.data.site.lang = this.module.lang;
		}

		// set current host
		if (this.data.url_lang != null) {
			if (this.cfg.lang == 'ru') {
				this.data.site.host = window.location.host;
			}
			else {
				this.data.site.host = window.location.host + '/' + this.data.url_lang;
			}
		}

		// set path static
		this.data.site.static = this.cfg.path_static;

		// get url params
		location.search.substr(1).replace(/([^=&]+)=([^&]*)/g, function(o, k, v) {
			modLoader.data.site.par[k] = v;
		});

	},

	insert_after(newNode, referenceNode) {

		referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);

	},

	insert_app() {

		if (this.status.tpl == 1 && this.status.text == 1 && this.status.error == 0) {

			// insert template
			this.el.cont.innerHTML = this.data.tpl;

			// insert app
			var el = document.createElement('script');
			el.setAttribute('src', `${this.cfg.dir_modules}${this.module.name}/app.js${this.module.ver}`);
			this.insert_after(el, this.el.cont);
			this.el.app = el;
		}

	},

	get_text() {

		if (this.module.text == 1) {
			fetch(`${this.cfg.dir_modules}${this.module.name}/locale/${this.data.site.lang}.json${this.module.ver}`, {
				method: 'GET',
			})
			.then(function(res) {
				if (res.status >= 200 && res.status < 300) {
					return res.json();
				}
				else {
					modLoader.error('Module text not found', res);
				}
			})
			.then(function(data) {
				try {
					modLoader.data.text = data;
					modLoader.status.text = 1;
					modLoader.insert_app();
				}
				catch {
					console.log(data);
				}
			});
		}
		else {
			this.data.text = {};
		}

	},

	get_template() {

		fetch(`${this.cfg.dir_modules}${this.module.name}/template.html${this.module.ver}`, {
			method: 'GET',
		})
		.then(function(res) {
			if (res.status >= 200 && res.status < 300) {
				return res.text();
			}
			else {
				modLoader.error('Module template not found', res);
			}
		})
		.then(function(data) {
			try {
				modLoader.data.tpl = data;
				modLoader.status.tpl = 1;
				modLoader.insert_app();
			}
			catch {
				console.log(data);
			}
		});

	},

	get_user() {

		this.data.user.status = (typeof oauth.user.status != 'undefined') ? oauth.user.status : 0;
		this.data.user.id = (typeof oauth.user.id != 'undefined') ? oauth.user.id : 0;
		this.data.user.name = (typeof oauth.user.name != 'undefined') ? oauth.user.name : '';
		this.data.user.email = (typeof oauth.user.email != 'undefined') ? oauth.user.email : '';
		this.data.user.new = (typeof oauth.user.new != 'undefined') ? oauth.user.new : 0;
		this.data.user.steam = (typeof oauth.user.steam != 'undefined') ? oauth.user.steam : 0;

		if (this.data.user.status == 2) {
			this.data.user.email = (typeof data.mail != 'undefined') ? data.mail : '';
		}

		modLoader.check_auth();

	},

	check_auth() {

		if (this.module.auth == 1 && (this.data.user.status == 0 || this.data.user.status == 2)) {
			this.module.name = 'access_denied';
		}
		modLoader.get_template();
		modLoader.get_text();

	},

	error(message, data = null) {

		var error_tpl = `
			<div class="mod_loader_msg">
				<h3>Error</h3>
				<p>${message}</p>
			</div>
		`;

		this.status.error = 1;
		this.el.cont.innerHTML = error_tpl;
		this.el.cont.classList.remove('loading');

		console.log(`modLoader: ${message}`);
		if (data != null) {
			console.log(data);
		}

	},

	import(val) { // export from modLoader

		var data = {};

		if (val == 'text')
			data = this.data.text;

		if (val == 'site')
			data = this.data.site;

		if (val == 'user')
			data = this.data.user;

		return data;
	},

};

modLoader.init();

document.addEventListener('oauthUser', function(e){
	modLoader.get_user();
});
