// 表示件数を初期化
var startRecord = 1;

$(() => {
	function search() {
		// cqlパラメーターがなければ処理を終了
		if (!location.search || location.search.match(/query=.*?(&|$)/) == null) {
			return;
		}
		
		// ajaxで検索結果を取得
		$.ajax(
			'http://iss.ndl.go.jp/api/sru' + location.search + '&startRecord=' + startRecord
		).done((data, textStatus, jqXHR) => {
			// 検索結果を表示
			
			// 検索結果一覧の表示領域の生成
			if ($('#result-list').length === 0) {
				$('#result').append($('<ol id="result-list"></ol>'));
			}
			
			// 全てのrecordDataを表示処理
			$(data).find('recordData').each(function() {
				// 要素をjQueryオブジェクト化
				var dataElement = $(this);
				
				// recordData 1件分の表示領域の生成
				var liElement = $('<li class="row offset-lg-2 col-lg-8"></li>');
				$('#result-list').append(liElement);
				
				// タイトルの表示
				var about = dataElement.find('dcndl\\:BibAdminResource').eq(0).attr('rdf:about');
				var title = dataElement.find('dcterms\\:title').eq(0).html();
				var titleElement = $('<h2 class="title"><a href="' + about + '" target="_blank">' + title + '</a></h2>');
				liElement.append(titleElement);
				
				// ページ数イメージの表示
				var extentDataElement = dataElement.find('dcterms\\:extent').eq(0);
				if (extentDataElement && extentDataElement.text().replace(/[０-９ｐ]/g,(c) => {
					return String.fromCharCode(c.charCodeAt(0) - 0xFEE0)
				}).match(/(\d+?)\s*p/) != null) {
					var extent = RegExp.$1 / 2 * 0.11;
					
					// ページ数イメージの表示領域の生成
					var extentElement = $('<div class="extent"></div>');
					extentElement.css({width: extent + 'mm'});
					liElement.append(extentElement);
				};
			});
			
			// 表示件数を進める
			startRecord +=  parseInt($('#maximumRecords').val(), 10);

			
		}).fail((jqXHR, textStatus, errorThrown) => {
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
