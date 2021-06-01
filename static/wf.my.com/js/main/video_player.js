
// Video player

var vpl = {

	el : null,
	content : null,

	init() {

		var styles = document.createElement('style');
		styles.innerHTML = vpl.css;
		document.head.appendChild(styles);

		var content = document.createElement('div');
		content.setAttribute('id', 'vpl');
		content.innerHTML = `
			<div id="vpl_overlay"></div>
			<div id="vpl_content"></div>
			<div id="vpl_close"></div>
		`;
		document.body.appendChild(content);

		vpl.el = document.getElementById('vpl');
		vpl.content = document.getElementById('vpl_content');

	},

	win_size() {

		var video_size = 0.8,
			win_width = document.documentElement.clientWidth,
			win_height = document.documentElement.clientHeight,
			new_height = 0,
			new_width = 0;
		
		if (win_width < 960) video_size = 1;
		
		if (win_height / 9 > win_width / 16) {
			new_width = win_width * video_size;
			new_height = Math.ceil((new_width / 16) * 9);
		}
		else {
			new_height = win_height * video_size;
			new_width = Math.ceil((new_height / 9) * 16);
		}

		vpl.content.style.width = `${new_width}px`;
		vpl.content.style.height = `${new_height}px`;
		
	},

	open(src) {

		vpl.el.style.display = 'block';
		vpl.win_size();
		vpl.content.innerHTML = `<iframe width="100%" height="100%" frameborder="0" allowfullscreen="" src="${src}?rel=0&autoplay=0"></iframe>`;
		vpl.vstop.stop();
		document.querySelector('body').setAttribute('data-vpl', 'active');

	},

	close() {

		vpl.el.style.display = 'none';
		vpl.content.innerHTML = '';
		vpl.vstop.play();
		document.querySelector('body').removeAttribute('data-vpl');

	},

	vstop : {

		get() {
			vpl.vstop.list = [];
			var list = document.querySelectorAll('video');
			list.forEach(el => {
				if (!el.paused)
					vpl.vstop.list.push(el);
			});
		},

		stop() {
			vpl.vstop.get();
			vpl.vstop.list.forEach(el => {
				el.pause();
			});
		},

		play() {
			vpl.vstop.list.forEach(el => {
				el.play();
			});
		},

	},

};

document.addEventListener('DOMContentLoaded', function(e){
	vpl.init();
});

document.addEventListener('click', function(e){
	
	if (e.target && e.target.id == 'vpl_close'){
		vpl.close();
	}

	if (e.target && e.target.id == 'vpl_overlay'){
		vpl.close();
	}

	if (e.target && e.target.closest('[data-video]')){
		var video = e.target.closest('[data-video]').getAttribute('data-video');
		vpl.open(video);
	}

});

document.addEventListener('keyup', function(e){
	if (e.keyCode == 27 && document.querySelector('body').getAttribute('data-vpl') == 'active')
		vpl.close();
});

window.addEventListener('resize', function(){
	vpl.win_size();
});

vpl.css = `

#vpl {
	width: 1px;
	height: 1px;
	position: fixed;
	display: none;
	left: -1px;
	top: -1px;
	z-index: 1000;
}

#vpl_overlay {
	width: 100%;
	height: 100%;
	position: fixed;
	top: 0px;
	left: 0px;
	background: #000;
	opacity: 0.7;
}

#vpl_content {
	width: auto;
	height: auto;
	position: fixed;
	top: 50%;
	left: 50%;
	border-radius: 0px;
	-webkit-transform: translate(-50%, -50%);
	transform: translate(-50%, -50%);
}

#vpl_close {
	width: 10vh;
	height: 10vh;
	position: fixed;
	top: 0px;
	right: 0px;
	background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6OTU5NDA5ODY0QjE4MTFFNUFBQ0FCMTQyNTZGNzEyRDEiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6OTU5NDA5ODc0QjE4MTFFNUFBQ0FCMTQyNTZGNzEyRDEiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo5NTk0MDk4NDRCMTgxMUU1QUFDQUIxNDI1NkY3MTJEMSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo5NTk0MDk4NTRCMTgxMUU1QUFDQUIxNDI1NkY3MTJEMSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PiTdSrEAAAF+SURBVHjapJZNSwMxEIZDL4KCV1Gq1t2utSqioj9XbG9+/BXxJJRSEA8qKrq6/bBUxfgGJhji5GPrwHNJJu/MTjLJCimlIM7ABNSNsbI0wTc412N6oiV/7Q2kU4hvgIGh09YBTuRfK0p+icp8yOicqskbyVsfNCLEN8HIoXGtHNYpY87Uwi2P+A4YO9aqUmfaUZXj1eE4JiFbfJcOBWc5WDM3WdBA7lgwIUHtuw8+HL7PYNU+RZoaeHEs/ASLxJfD5wksm5pcXVcoC85uCc4eQdXWc21elRbE2j19mYgNoFgCDxHid2DBpRM64xXQ8YhfhfqkIvw2C2YC8/NeBU/0lJolZKrjs7IlihUP3l2ceOLp6i7huhrSUIDEk7nKco4oYoPEXhWFVed6IEhiB6h5xF2bmHmC5KQpQuLDwJsQDKKcep63oBnx4DSsp9K0nmq0S6Y93sEh6IiwdcEBGDBzFzqL4yky58rVN3SO7FPUpprv/eO3ZZv2pKXHfgQYANgdLu4BU/uzAAAAAElFTkSuQmCC');
	background-position: center center;
	background-repeat: no-repeat;
	opacity: 0.7;
	cursor: pointer;
	}
#vpl_close:hover {
	opacity: 1;
}

`;