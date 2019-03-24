// 表示件数を初期化
var startRecord = 1;

$(() => {
	function search() {
		// cqlパラメーターがなければ処理を終了
		if (!location.search || location.search.match(/query=.*?(&|$)/) == null) {
			return;
		}
		
		var parser = new DOMParser();
		//fetchで検索結果を取得
		fetch('https://iss.ndl.go.jp/api/sru' + location.search + '&startRecord=' + startRecord).then(function(response) {
			return response.text();
		}).then(function(text) {
			var data = parser.parseFromString(text, 'text/xml');
			
			// 検索結果を表示
			
			// 検索結果一覧の表示領域の生成
			if ($('#result-list').length === 0) {
				$('#result').append($('<ol id="result-list"></ol>'));
			}
			
			// 検索結果の取得と名前空間リゾルバの作成
			var result = data.evaluate('.//rdf:RDF', data, function() { return 'http://www.w3.org/1999/02/22-rdf-syntax-ns#'; }, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
			var nsr = data.createNSResolver(result.snapshotItem(0));
			
			// 全てのrecordDataを表示処理
			for (var i = 0; i < result.snapshotLength; i ++) {
				var rdf = result.snapshotItem(i);
				
				// recordData 1件分の表示領域の生成
				var liElement = $('<li class="row offset-lg-2 col-lg-8"></li>');
				$('#result-list').append(liElement);
				
				// タイトルの表示
				var about = data.evaluate('.//@rdf:about', rdf, nsr, XPathResult.STRING_TYPE, null).stringValue;
				var title = data.evaluate('.//dcterms:title', rdf, nsr, XPathResult.STRING_TYPE, null).stringValue;
				
				var titleElement = $('<h2 class="title"><a href="' + about + '" target="_blank">' + title + '</a></h2>');
				liElement.append(titleElement);
				
				// ページ数イメージの表示
				var extentData = data.evaluate('.//dcterms:extent', rdf, nsr, XPathResult.STRING_TYPE, null).stringValue;
				if (extentData && extentData.replace(/[０-９ｐ]/g, c => {
					return String.fromCharCode(c.charCodeAt(0) - 0xFEE0)
				}).match(/(\d+?)\s*p/) != null) {
					var extent = RegExp.$1 / 2 * 0.11;
					
					// ページ数イメージの表示領域の生成
					var extentElement = $('<div class="extent"></div>');
					extentElement.css({width: extent + 'mm'});
					liElement.append(extentElement);
				};
			}
			
			// 表示件数を進める
			startRecord +=  parseInt($('#maximumRecords').val(), 10);

		}).catch(function(error) {
		});
	}
	
	$('#cql-parameter').submit(function() {
		// submit前にcqlを組み立てる
		var query = '';
		$(this).find('input').each(function() {
			var input = $(this);
			// 空ではないcqlパラメーターを全てANDで連結
			if (input.val() != '') {
				if (query != '') {
					query += ' AND ';
				}
				query += input.attr('name') + ' = "' + input.val() + '"';
			}
		});
		$('#query').val(query);
		
		// 表示件数を初期化
		startRecord = 1;
		
		// 検索結果一覧の表示領域の削除
		$('#result').empty();
		
		history.pushState(null, null, '?' + $('#search-form').serialize());
		search();
		return false;
	});
	
	$('#next').click(search);
	
	function init() {
		// フォームの入力内容を復元
		$('#cql-parameter input').each(function() {
			var input = $(this);
			if (decodeURIComponent(location.search).match(new RegExp(this.name + ' = "(.*?)"')) != null) {
				input.val(RegExp.$1);
			}
		});
		
		// 表示件数を初期化
		startRecord = 1;
		
		search();
	}
	
	$(window).on("popstate", init);
	
	init();
});
