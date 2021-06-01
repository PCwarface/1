
var app = new Vue({
	
	el: '#app',
	
	data: {
		text : modLoader.import('text'),
		site : modLoader.import('site'),
	},

	mounted: function(){
		this.$el.className = '';
	},

	methods: {

	},

	computed: {

	},

});