
var cookie_notice = {

	policy : 'https://documentation.my.games/terms/mygames_cookies',

	lang : null,
	tpl : {},

	init() {
		if (this.check_domain()) {
			if (this.get_cookie('cookies_accept') == null) {
				this.check_lang();
				this.assign_tpl(this);
				this.generate.css();
				this.generate.block();
				this.show();
			}
			else {
				this.generate.css();
			}
		}
	},

	show() {
		document.querySelector('.cookie_notice').style.display = 'block';
	},

	hide() {
		document.querySelector('.cookie_notice').style.display = 'none';
		document.cookie = "cookies_accept=1; path=/;";
	},

	check_domain() {
		return (document.location.host == 'pc.warface.com') ? true : false;
	},

	check_lang() {

		var list = Object.keys(this.tpl.text),
			loc = document.location.href.split('/'),
			match = false;

		for (var k in loc) {
			if (list.includes(loc[k])) {
				this.lang = loc[k];
				match = true;
			}
		}
		if (!match) {
			this.lang = list[0];
		}

		this.text = this.tpl.text[this.lang];

	},

	get_cookie(name) {
		let a = `; ${document.cookie}`.match(`;\\s*${name}=([^;]+)`);
		return a ? a[1] : null;
	},

	generate : {

		css() {
			var el = document.createElement('style');
			el.innerHTML = cookie_notice.tpl.css;
			document.head.appendChild(el);
		},

		block() {
			var el = document.createElement('div');
			el.classList.add('cookie_notice');
			el.innerHTML = cookie_notice.tpl.block;
			document.body.appendChild(el);
		},

	},

};

// Events

document.addEventListener('DOMContentLoaded', function(e){
	cookie_notice.init();
});

document.addEventListener('click', function(e){
	if (e.target && e.target.closest('.cookie_notice_button, .cookie_notice_close')){
		cookie_notice.hide();
	}
});

// Templates

cookie_notice.assign_tpl = (obj, text = obj.text) => {
	Object.assign(obj.tpl, {

		block : `
			<strong>${text.cookie_files}</strong>
			<p>${text.continue}</p>
			<p><a href="${obj.policy}" target="_blank">${text.policy}</a></p>
			<div class="cookie_notice_button">${text.ok}</div>
			<div class="cookie_notice_close">&times;</div>
		`,

	});
};

cookie_notice.tpl.text = {

	en : {
		cookie_files	: `Cookie files`,
		continue	 	: `By continuing to browse, you consent to our use of cookies.`,
		policy		 	: `You can read our Cookies Policy here.`,
		ok			 	: `Got it!`,
	},

	fr : {
		cookie_files 	: `Fichier de cookies`,
		continue	 	: `En continuant la navigation, vous acceptez notre utilisation des cookies.`,
		policy		 	: `Vous pouvez consulter notre Politique sur les cookies ici.`,
		ok			 	: `Compris !`,
	},

	de : {
		cookie_files 	: `Cookie-dateien`,
		continue	 	: `Wenn du weiter surfst, stimmst du der Verwendung unserer Cookies zu.`,
		policy		 	: `Hier kannst du unsere Cookie-Richtlinie lesen.`,
		ok			 	: `Verstanden!`,
	},

	pl : {
		cookie_files 	: `Pliki cookie`,
		continue	 	: `Kontynuując przeglądanie, wyrażasz zgodę na wykorzystanie przez nas plików cookie.`,
		policy		 	: `Tutaj możesz zapoznać się z naszą Polityką dotyczącą plików cookie.`,
		ok			 	: `Jasne!`,
	},

	es : {
		cookie_files 	: `Archivos de cookies`,
		continue	 	: `Si continúas navegando, consideramos que aceptas nuestro uso de cookies.`,
		policy		 	: `Puedes leer aquí nuestra política de cookies.`,
		ok			 	: `¡Entendido!`,
	},

	pt : {
		cookie_files 	: `Arquivos de cookie`,
		continue	 	: `Ao continuar navegando, você concorda com o uso de cookies.`,
		policy		 	: `Você pode ler nossa Política de Cookies aqui.`,
		ok			 	: `Entendi!`,
	},

	cn : {
		cookie_files 	: `Cookie文件`,
		continue	 	: `继续浏览即表示您同意我们使用cookie。`,
		policy		 	: `您可以在此处阅读我们的Cookies政策。`,
		ok			 	: `得到它了！`,
	},

	ko : {
		cookie_files	: `쿠키 파일`,
		continue	 	: `계속 탐색하면 쿠키 사용에 동의하는 것입니다.`,
		policy		 	: `쿠키 정책은 여기를 참조하십시오.`,
		ok			 	: `알았다!`,
	},

	tr : {
		cookie_files	: `Çerez dosyaları`,
		continue	 	: `Gezinmeye devam ederek çerezleri kullanmamıza izin vermiş sayılırsın.`,
		policy		 	: `Çerez Politikamızı buradan okuyabilirsin.`,
		ok			 	: `Anladım!`,
	},

};

cookie_notice.tpl.css = `

.cookie_notice {
	width: 335px;
	position: fixed;
	box-sizing: border-box;
	right: 30px;
	bottom: 30px;
	padding: 16px 30px 20px;
	background: #262b2f;
	box-shadow: 4px 4px 14px #000;
	cursor: default;
	z-index: 100;
}

	.cookie_notice strong {
		color: #fff;
		font: 14px/26px Quantico, Arial;
		text-transform: uppercase;
	}

	.cookie_notice p {
		margin: 14px 0px;
		color: #fff;
		font: 14px/18px Plumb, Arial;
	}

	.cookie_notice p a {
		color: #ff0000;
		text-decoration: none;
	}
	.cookie_notice p a:hover {
		text-decoration: underline;
	}

	.cookie_notice_close {
		width: 40px;
		height: 40px;
		display: flex;
		position: absolute;
		box-sizing: border-box;
		justify-content: center;
		align-items: center;
		right: 8px;
		top: 8px;
		padding-bottom: 4px;
		color: #fff;
		font: 24px/1 Verdana, Tahoma;
		opacity: 0.5;
		cursor: pointer;
	}
	.cookie_notice_close:hover {
		opacity: 1;
	}

	.cookie_notice_button {
		min-width: 200px;
		height: 34px;
		display: flex;
		justify-content: center;
		align-items: center;
		color: #fff;
		font: 14px/18px Quantico, Arial;
		text-align: center;
		text-transform: uppercase;
		border: 1px solid #fff;
		cursor: pointer;
	}
	.cookie_notice_button:hover {
		color: #000;
		background: #fff;
	}

@media screen and (max-width: 720px) {
	.cookie_notice {
		width: 100%;
		right: 0px;
		bottom: 0px;
	}
}

`;
