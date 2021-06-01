
var mailing_gift = {

	gifts_list : ['at308', 'swmp_r8_kiwi', 'utas_uts_15'],

	el   : null,
	cont : null,
	gift : null,
	tpl : {},

	cfg : {
		name : 'mailing_gift',
	},

	defaults : {
		
		ru : {
			host : 'ru.warface.com',
			path : '/static/wf.mail.ru/modules/plugins/{plugin_name}',
		},

		eu : {
			host : 'pc.warface.com',
			path : '/static/wf.my.com/modules/plugins/{plugin_name}',
		},
		
	},

	init() {
		
		this.cfg.lang = oauth.get_lang(0);
		this.read_config();
		this.get_text();
		this.generate.style();
		this.generate.modal();
		this.open('gift');
	},

	check_gift() {

		let par = {};
		location.search.substr(1).replace(/([^=&]+)=([^&]*)/g, (o, k, v) => {par[k] = v});
		
		if (typeof par['mgift'] != 'undefined') {
			this.gift = this.gifts_list.includes(par['mgift']) ? par['mgift'] : 'gift';
		}

		if (this.gift != null) {
			mailing_gift.init();
		}

	},

	read_config() {

		for (var key in this.defaults) {
			if (this.defaults[key].host == document.location.host) {
				this.cfg.region = key;
			}
		}

		this.cfg = {...this.cfg, ...this.defaults[this.cfg.region]};
		this.cfg.path = this.cfg.path.replace('{plugin_name}', this.cfg.name);

		this.cfg.path_lang = (this.cfg.region == 'eu') ? `/${this.cfg.lang}` : '';
		
	},

	get_text() {
		
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function()
		{
			if (xhr.readyState == 4 && xhr.status == 200) {
				var data = JSON.parse(xhr.responseText);
				mailing_gift.text = data[mailing_gift.cfg.lang];
			}
		}
		xhr.open('get', `${this.cfg.path}/data/locale.json`, false);
		xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
		xhr.send();

	},

	open(name) {

		var tpl = mailing_gift.tpl.get(name);
		
		if (tpl != null) {
			document.querySelector('body').classList.add('page_modal_gift_active');
			mailing_gift.cont.setAttribute('data', name);
			mailing_gift.cont.innerHTML = tpl;
			mailing_gift.el.classList.add('active');
		}

	},

	close() {

		document.querySelector('body').classList.remove('page_modal_gift_active');
		mailing_gift.el.classList.remove('active');
		mailing_gift.cont.removeAttribute('data');

	},

	generate : {
		
		modal() {
		
			var el = document.createElement('div');
			el.classList.add('page_modal_gift');
			el.innerHTML = mailing_gift.tpl.get('modal');
			document.body.appendChild(el);

			mailing_gift.el = el;
			mailing_gift.cont = document.querySelector('.modal_gift_inner');

		},

		style() {
			var el = document.createElement('style');
			el.setAttribute('data', 'mailing_gift');
			el.innerHTML = mailing_gift.tpl.css;
			document.head.appendChild(el);
		},

	},

}

// Events

document.addEventListener('oauthUser', function(e) {
	mailing_gift.check_gift();
});

document.addEventListener('click', function(e) {

	if (e.target.matches('.js-gift-modal-close')) {
		mailing_gift.close();
	}

});

document.addEventListener('keyup', function(e) {

	if (e.keyCode == 27) {
		mailing_gift.close();
	}

});

// Templates

mailing_gift.tpl.get = (name) => {
	var text = mailing_gift.text,
		list = {

	modal : `
		<div class="page_modal_gift_overlay"></div>
		<div class="page_modal_gift_section">
			<div class="modal_gift_top">
				<div class="modal_gift_close js-gift-modal-close"></div>
			</div>
			<div class="modal_gift_content">
				<div class="modal_gift_inner"></div>
			</div>
			<div class="modal_gift_border">
				<div class="modal_gift_corners"></div>
				<div class="modal_gift_corners"></div>
			</div>
		</div>
	`,

	gift : `
		<strong>${text.title}</strong>
		<div class="modal_gift_img" style="background-image: url(/static/wf.my.com/modules/plugins/mailing_gift/img/${mailing_gift.gift}.png)"></div>
		<p class="center">${text.desc[0]}<em>${text.desc[1]}</em>${text.desc[2]}</p>
		<div class="modal_gift_buttons">
			<a href="${mailing_gift.cfg.path_lang}/download/" class="modal_gift_button">${text.download}</a>
			<a href="${mailing_gift.cfg.path_lang}/news/" class="modal_gift_button">${text.news}</a>
		</div>
	`,

	};
	return list[name] || null;
};

mailing_gift.tpl.style = {

	layout : {
		bg    : '#262b2f',
		close : ['#f00', '#fff'],
		font  : 'normal 15px/1.4 Plumb, Arial',
	},

	title : {
		color : '#fff',
		font  : '31px/1.1 Quantico, Arial',
		case  : 'uppercase',
	},

	section : {
		color : '#a8a8ab',
		link  : {
			color : ['#ff0000', '#ff0000'],
			case  : ['none', 'none'],
		}
	},

	button : {
		bg    : ['#ff0000', '#ffffff'],
		color : ['#fff', '#000'],
		font  : '16px/1 Quantico, Arial',
		case  : 'uppercase',
	},

};

mailing_gift.tpl.css = `

.page_modal_gift {
	width: 100%;
	height: 100%;
	min-width: 320px;
	display: none;
	position: fixed;
	left: 0px;
	top: 0px;
	font: ${mailing_gift.tpl.style.layout.font};
	z-index: 1000;
}
.page_modal_gift.active {
	display: block;
}

	.page_modal_gift_overlay {
		width: 100%;
		height: 100%;
		background: rgba(0,0,0,0.9);
	}

	.page_modal_gift_section {
		width: 644px;
		position: absolute;
		box-sizing: border-box;
		left: 50%;
		top: 50%;
		transform: translate(-50%,-50%);
		background: ${mailing_gift.tpl.style.layout.bg};
		border-radius: 0px;
		overflow: hidden;
		cursor: default;
	}

	.modal_gift_content {}

		.modal_gift_top {
			height: 24px;
			display: flex;
			justify-content: flex-end;
			align-items: center;
			position: relative;
		}

			.modal_gift_close {
				width: 48px;
				height: 50px;
				position: absolute;
				top: 12px;
				right: 12px;
				color: ${mailing_gift.tpl.style.layout.close[0]};
				font: 28px/44px Tahoma;
				cursor: pointer;
			}
			.modal_gift_close::before {
				content: '\\d7';
				width: 100%;
				height: 100%;
				display: block;
				text-align: center;
			}
			.modal_gift_close:hover {
				color: ${mailing_gift.tpl.style.layout.close[1]};
			}
			.modal_gift_close:active {
				opacity: 0.5;
			}

		.modal_gift_inner {
			padding: 0px 32px 20px;
		}

		.modal_gift_inner strong {
			display: block;
			padding: 8px 70px;
			color: ${mailing_gift.tpl.style.title.color};
			font: ${mailing_gift.tpl.style.title.font};
			text-align: center;
			text-transform: ${mailing_gift.tpl.style.title.case};
		}

		.modal_gift_inner p {
			margin: 14px 0px;
			padding: 0px;
			color: ${mailing_gift.tpl.style.section.color};
			font: ${mailing_gift.tpl.style.layout.font};
			text-align: left;
			text-transform: none;
		}
		.modal_gift_inner p.center {
			text-align: center;
		}

			.modal_gift_inner p a {
				color: ${mailing_gift.tpl.style.section.link.color[0]};
				font: ${mailing_gift.tpl.style.layout.font};
				text-decoration: ${mailing_gift.tpl.style.section.link.case[0]};
				transition: color 0.1s;
			}
			.modal_gift_inner p a:hover {
				color: ${mailing_gift.tpl.style.section.link.color[1]};
				text-decoration: ${mailing_gift.tpl.style.section.link.case[1]};
			}

			.modal_gift_inner p em {
				color: ${mailing_gift.tpl.style.section.link.color[1]};
				font-style: normal;
			}

			.modal_gift_inner hr {
				margin: 16px 0px;
				border: 1px solid rgba(0,0,0,0);
				border-bottom-color: rgba(255,255,255,0.1);
			}
			
			.modal_gift_inner li {
				color: ${mailing_gift.tpl.style.section.color};
				font: ${mailing_gift.tpl.style.layout.font};
			}
			.modal_gift_inner li::marker {
				color: ${mailing_gift.tpl.style.section.link[0]};
			}

		.modal_gift_inner label {
			display: block;
			position: relative;
			padding-left: 30px;
			cursor: pointer;
			-webkit-user-select: none;
			-ms-user-select: none;
			user-select: none;
		}
		.modal_gift_inner label::before {
			content: '';
			width: 20px;
			height: 20px;
			position: absolute;
			top: -1px;
			left: 0px;
			background-color: #3c3c40;
			border: 1px solid #626262;
			border-radius: 0px;
		}

		.modal_gift_inner label,
		.modal_gift_inner label a {
			font-size: 13px;
			line-height: 1.54;
		}

		.modal_gift_inner input.modal_gift_cb {
			width: 0px;
			height: 0px;
			position: absolute;
			left: 0px;
			opacity: 0;
		}
		.modal_gift_inner input.modal_gift_cb:checked + label::before {
			background: #e2e3e7 url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjYiPjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgZD0iTTcuNy4zYy0uNC0uNC0xLS40LTEuNCAwTDMgMy42IDEuNyAyLjNjLS40LS40LTEtLjQtMS40IDAtLjQuNC0uNCAxIDAgMS40bDIgMmMuMi4yLjQuMy43LjMuMyAwIC41LS4xLjctLjNsNC00Yy40LS40LjQtMSAwLTEuNHoiLz48L3N2Zz4=) no-repeat 50%;
			background-size: 10px 7px;
			border-color: #e2e3e7;
		}

		.modal_gift_img {
			width: 100%;
			max-width: 580px;
			height: 250px;
			margin: 0px auto;
			background-repeat: no-repeat;
			background-position: center;
			background-size: 100% auto;
		}

		.modal_gift_buttons {
			display: flex;
			justify-content: center;
		}

		.modal_gift_button {
			width: 40%;
			height: 45px;
			display: flex;
			box-sizing: border-box;
			justify-content: center;
			align-items: center;
			margin: 16px;
			padding: 0px 12px;
			color: ${mailing_gift.tpl.style.button.color[0]};
			font: ${mailing_gift.tpl.style.button.font};
			text-align: center;
			text-decoration: none;
			text-transform: ${mailing_gift.tpl.style.button.case};
			background: ${mailing_gift.tpl.style.button.bg[0]};
			border-radius: 0px;
			cursor: pointer;
			-webkit-user-select: none;
			-ms-user-select: none;
			user-select: none;
		}
		.modal_gift_button:not(.loading):not(.disabled):hover {
			color: ${mailing_gift.tpl.style.button.color[1]};
			text-decoration: none;
			background: ${mailing_gift.tpl.style.button.bg[1]};
		}
		.modal_gift_button:not(.loading):not(.disabled):active {
			opacity: 0.7;
		}

		.modal_gift_button.disabled {
			color: #262626;
			background: #414141;
			filter: grayscale(1);
			cursor: default;
		}

		.modal_gift_button.loading {
			color: rgba(0,0,0,0);
			filter: grayscale(1);
			opacity: 0.7;
			cursor: default;
		}
		.modal_gift_button.loading::before {
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
	
	.modal_gift_border {
		width: calc(100% - 20px);
		height: calc(100% - 20px);
		display: flex;
		position: absolute;
		box-sizing: border-box;
		justify-content: center;
		align-items: center;
		left: 10px;
		top: 10px;
		pointer-events: none;
	}
	.modal_gift_border::before,
	.modal_gift_border::after {
		content: '';
		display: block;
		position: absolute;
		box-sizing: border-box;
		border: 1px solid rgba(255,255,255,0.1);
	}
	.modal_gift_border::before {
		width: calc(100% - 44px);
		height: 100%;
		border-left-width: 0px;
		border-right-width: 0px;
	}
	.modal_gift_border::after {
		width: 100%;
		height: calc(100% - 44px);
		border-top-width: 0px;
		border-bottom-width: 0px;
	}

		.modal_gift_corners {
			height: 100%;
			display: flex;
			position: absolute;
			flex-direction: column;
			align-items: space-between;
		}
		.modal_gift_corners:first-child {
			left: 0px;
		}
		.modal_gift_corners:last-child {
			right: 0px;
		}

		.modal_gift_corners::before,
		.modal_gift_corners::after {
			content: '';
			width: 0px;
			height: 0px;
			display: block;
			position: absolute;
			left: inherit;
			right: inherit;
			border: 6px solid #f00;
		}

		.modal_gift_corners::before {
			top: 0px;
		}
		.modal_gift_corners::after {
			bottom: 0px;
		}

		.modal_gift_corners:first-child::before {
			border-right-color: transparent;
			border-bottom-color: transparent;
		}
		.modal_gift_corners:first-child::after {
			border-right-color: transparent;
			border-top-color: transparent;
		}
		.modal_gift_corners:last-child::before {
			border-left-color: transparent;
			border-bottom-color: transparent;
		}
		.modal_gift_corners:last-child::after {
			border-left-color: transparent;
			border-top-color: transparent;
		}

@media screen and (max-width: 720px) {

	body.page_modal_gift_active {
		overflow: hidden;
	}

	.page_modal_gift_section {
		width: 100%;
		overflow: auto;
	}

		.modal_gift_top {
			height: 70px;
		}

		.modal_gift_inner {
			min-height: 100%;
			display: flex;
			box-sizing: border-box;
			flex-direction: column;
			justify-content: center;
			padding-bottom: 40px;
		}

		.modal_gift_close {
			width: 70px;
			height: 70px;
			position: fixed;
			font-size: 38px;
			line-height: 66px;
		}

		.modal_gift_inner strong {
			padding: 0px;
			font-size: 24px;
		}

}

@media screen and (max-width: 480px) {

	.modal_gift_img {
		height: 180px;
	}

	.modal_gift_buttons {
		flex-direction: column;
	}

		.modal_gift_button {
			width: 100%;
			margin: 8px 0px;
		}

}

`;