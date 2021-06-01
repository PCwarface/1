
var loc = {

	'en' : {

		// profile
		'cashback'	 		 	: 'Cash back',
		'inventory'			 	: 'Inventory',
		'marketplace'		 	: 'Marketplace',

		'market_par1'		 	: 'Inventory holds all the items players get for participating in global operations like <a href="/absolutepower">&quot;Absolute Power&quot;</a>. It is possible to transfer the item to the game to any character on the account or sell it at the <a href="/en/marketplace">marketplace</a>.',
		'market_par2'		 	: 'All my.com users can purchase items on the marketplace.',
		'market_par3'		 	: 'Those my.com users that have access to any Global Operation can also sell items on the marketplace.',

	},

	'fr' : {

		// profile
		'cashback'	 		 	: 'Remboursement',
		'inventory'			 	: 'Inventaire',
		'marketplace'		 	: 'Marché',

		'market_par1'		 	: 'L\'inventaire contient tous les éléments que les joueurs obtiennent pour participacion aux opérations globales comme <a href="/absolutepower">"Absolute Power"</a>. Il est possible de transférer l\'objet au jeu à n\'importe quel personnage du compte ou de le vendre sur le <a href="/fr/marketplace">marché</a>.',
		'market_par2'		 	: 'Tous les utilisateurs de my.com peuvent acheter des articles sur le marché.',
		'market_par3'		 	: 'Les utilisateurs de my.com ayant accès à n’importe quelle Opération Globale peuvent également vendre des articles sur le marché.',

	},

	'de' : {

		// profile
		'cashback'	 		 	: 'Cash back',
		'inventory'			 	: 'Inventar',
		'marketplace'		 	: 'Marktplatz',

		'market_par1'		 	: 'Das Inventar enthält alle Gegenstände, die Spieler für die Teilnahme an globalen Operationen wie <a href="/absolutepower">"Absolute Power" erhalten</a>. Es ist möglich, den Gegenstand an einen beliebigen Charakter ins Spiel zu übertragen oder auf dem <a href="/de/marketplace">Marktplatz</a> zu verkaufen.',
		'market_par2'		 	: 'Alle Benutzer von my.com können Artikel auf dem Marktplatz kaufen.',
		'market_par3'		 	: 'Diese my.com Benutzer, die Zugang zu irgendeinem Globalen Vorgang haben, können auch Artikel auf dem Marktplatz schicken.',

	},

	'pl' : {

		// profile
		'cashback'	 		 	: 'Cash back',
		'inventory'			 	: 'Inwentarz',
		'marketplace'		 	: 'Placówka handlowa',

		'market_par1'		 	: 'Ekwipunek zawiera wszystkie przedmioty, które gracze otrzymują za udział w globalnych operacjach, jak np. <a href="/absolutepower">"Absolute Power"</a>. Przedmiot można przenieść każdej postaci w grze na koncie lub sprzedać na <a href="/pl/marketplace">Placówce handlowej</a>.',
		'market_par2'		 	: 'Wszyscy użytkownicy my.com mogą nabywać przedmioty na Placówce handlowej.',
		'market_par3'		 	: 'Użytkownicy my.com, którzy mają dostęp do jakiejkolwiek globalnej operacji mogą też sprzedawać przedmioty na Placówce handlowej.',

	},

	'cn' : {

		// profile
		'cashback'	 		 	: '返现',
		'inventory'			 	: '我的物品栏',
		'marketplace'		 	: '市场',

		'market_par1'		 	: '在物品栏里面你可以看到从你所参加活动（比如“<a href="/absolutepower">绝对力量</a>”）领取的物品。你可以把物品转移到你的任何角色或者在<a href="/cn/marketplace">市场</a>上交易。',
		'market_par2'		 	: '所有my.com玩家可以在市场上购买物品。',
		'market_par3'		 	: '所有具有全球行动权限my.com玩家可以在市场上出售物品。',

	},

		'es' : {

			// profile
			'cashback'	 		 	: 'Cash back',
			'inventory'			 	: 'Inventory',
			'marketplace'		 	: 'Marketplace',

			'market_par1'		 	: 'Inventory holds all the items players get for participating in global operations like <a href="https://wf.my.com/absolutepower">&quot;Absolute Power&quot;</a>. It is possible to transfer the item to the game to any character on the account or sell it at the <a href="https://wf.my.com/en/marketplace">marketplace</a>.',
			'market_par2'		 	: 'All my.com users can purchase items on the marketplace.',
			'market_par3'		 	: 'Those my.com users that have access to any Global Operation can also sell items on the marketplace.',

		},

};

function data_loc(){
	$('[data-loc]').each(function(index, element) {
		$(element).html(loc[lng][$(element).attr('data-loc')]);
	});
}
