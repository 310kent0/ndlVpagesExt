$(() => {
	$('#search-form').submit((event) => {
		// submit前にcqlを組み立てる
		var cqlElement = $('#search-form #cql');
		$('#search-form #cql-parameter input').each((index, element) => {
			// 空ではないcqlパラメーターを全てANDで連結
			if (element.value != '') {
				if (cqlElement.val() != '') {
					cqlElement.val(cqlElement.val() + ' AND ');
				}
				cqlElement.val(cqlElement.val() + element.name + ' = "' + element.value + '"');
			}
			
			// 要素を削除して組み立て前のcqlパラメーターを送信させない
			element.remove();
		});
	});
	
	// クエリ文字列がなければ処理を終了
	if(!location.search) {
		return;
	}
	
	// cqlパラメーターがなければ処理を終了
	if (location.search.match(/cql=(.*?)(&|$)/) == null) {
		return;
	}
	
	// cqlパラメーターの半角スペースを+から%20に変換
	var cql = RegExp.$1.replace(/\+/g,'%20');
	
	// フォームの入力内容を復元
	$('#search-form input').each((index, element) => {
		if (decodeURIComponent(location.search).match(new RegExp(element.name + '\\+=\\+"(.*?)"')) != null) {
			element.value = RegExp.$1.replace(/\+/g,' ');
		};
	});
	
	// 表示件数を初期化
	maximumRecords = 10;
	startRecord = 1;
	
	function search() {
		// url組み立て
		
		// ajaxで検索結果を取得
		$.ajax({
			type: 'GET',
			url: 'http://iss.ndl.go.jp/api/sru',
			data: {
				operation: 'searchRetrieve',
				recordSchema: 'dcndl',
				recordPacking: 'xml',
				maximumRecords: maximumRecords,
				startRecord: startRecord,
				query: decodeURIComponent(cql)
			},
			dataType: 'xml',
		}).done((data, textStatus, jqXHR) =>{
			// 検索結果を表示
			
			// 検索結果一覧の表示領域の生成
			if (!$('#result-list')[0]) {
				$('#result').append($('<ol id="result-list"></ol>'));
			}
			
			// 全てのrecordDataを表示処理
			$(data).find('recordData').each((index, element) => {
				// 要素をjQueryオブジェクト化
				var dataElement = $(element);
				
				// recordData 1件分の表示領域の生成
				var liElement = $('<li class="row offset-lg-2 col-lg-8"></li>');
				$('#result-list').append(liElement);
				
				// タイトルの表示
				var titleElement = $('<h2 class="title"><a href="' + dataElement.find('dcndl\\:BibAdminResource')[0].getAttribute('rdf:about') + '" target="_blank">' + dataElement.find('dcterms\\:title')[0].innerHTML + '</a></h2>');
				liElement.append(titleElement);
				
				// ページ数イメージの表示
				var extentDataElement = dataElement.find('dcterms\\:extent')[0];
				if (extentDataElement && extentDataElement.innerHTML.replace(/[０-９ｐ]/g,(c) => {
							return String.fromCharCode(c.charCodeAt(0) - 0xFEE0)
						}).match(/(\d+?)\s*p/) != null) {
					var extent = RegExp.$1 / 2 * 0.11;
					
					// ページ数イメージの表示領域の生成
					var extentElement = $('<div class="extent"></div>');
					extentElement.css({'width':extent + 'mm'});
					liElement.append(extentElement);
				};
			});
			
			// 表示件数を進める
			startRecord += maximumRecords;
		}).fail((jqXHR, textStatus, errorThrown) => {
		});
	}
	search();
	$('#next').click(search);
});
