(function()  {
	// 取得開始位置
	var startRecord;
	
	//DOM パーサー
	var parser = new DOMParser();
	
	// xslt読み込み
	var xslt = new XSLTProcessor();
	var loadXslt = fetch('./xsl/xml2html.xsl')
		.then(ruok).then(resTxt)
		.then(async function(text) {
			// xsltインポート
			xslt.importStylesheet(parser.parseFromString(text, 'text/xml'));
		}).catch(catErr);
	
	$(function()  {
		$('#cql-parameter').submit(submit);
		$('#next').click(search);
		// ブラウザバックの際に初期処理を実行
		$(window).on("popstate", init);
		
		init();
	});
	
	// 初期処理
	function init() {
		// フォームの入力内容を復元
		$('#cql-parameter input').each(restoreQuery);
		
		// 取得開始位置を初期化
		startRecord = '1';
		// 検索結果一覧の表示領域の削除
		$('#result').empty();
		
		search();
	}
	
	// 検索
	function search() {
		// cqlパラメーターがなければ処理を終了
		if (!location.search
		 	|| location.search.match(/query=.*?(&|$)/) == null
		) {
			return;
		}
		
		// ボタン非活性化
		$('button').attr('disabled', true);
		
		//fetchで検索結果を取得
		fetch(
			'https://iss.ndl.go.jp/api/sru'
				+ location.search
				+ '&startRecord='
				+ startRecord
		).then(ruok).then(resTxt)
		.then(print).catch(catErr);
	}
	
	// 検索結果を表示
	async function print(text) {
		// xslt読み込み待ち
		await loadXslt;
		
		// レスポンスxmlをパース
		var data = parser.parseFromString(text, 'text/xml');
		var jdata = $(data);
		
		// エラー表示
		var diagnostics = jdata.find('diagnostics');
		if (diagnostics.length !== 0) {
			alert(diagnostics.text());
			$('#search-btn').attr('disabled', false);
			return;
		}
		
		// xsltでレスポンスxmlをhtmlに変換
		var fragment = $(xslt.transformToFragment(data, document));
		
		// ページ数を視覚化
		fragment.find('.extent').each(drawExtent);
		
		// 検索結果の表示領域の生成
		if ($('#result-list').length === 0) {
			// 検索結果一覧
			$('#result').append($('<div class="offset-xl-1  col-xl-11"><ol id="result-list" class="list-group w-100"></ol></div>'));
			// ヒット数
			$('#result').append($('<p id="numberOfRecords" class="offset-xl-1  col-xl-11">' + jdata.find('numberOfRecords').text() + '件ヒット</p>'));
		}
		
		// 検索結果一覧の表示
		$('#result-list').append(fragment);
		
		// 取得開始位置を進める
		startRecord = jdata.find('nextRecordPosition').text();
		
		// ボタン活性化
		if (startRecord != '0') {
			$('#next').attr('disabled', false);
		}
		$('#search-btn').attr('disabled', false);
	}
	
	// ページ数を視覚化
	function drawExtent() {
		// 大きさ、容量等を取得
		var extentElement = $(this);
		var extentData = extentElement.text();
		
		// 全角文字を半角文字に変換してページ数の表記を抽出
		var matched = extentData.replace(/[０-９ｐＰ]/g, toHalf)
			.replace(/，/g, ',').replace(/　/g, ' ')
			.match(/((\d+)\s*((,\s*)|p))+/i);
		
		if(matched) {
			// ページ数を背景色の幅で視覚化
			var extent = matched[0].split(',') // カンマ区切りで配列化
				.map(toInt).reduce(sum) / 2 * 0.155; // 適当な係数でmmに変換
			// cssのグラデーション背景を使ってページ数を表現
			extentElement.closest('.data').css({
				background: 'linear-gradient(90deg, lightgray 0%, lightgray ' + extent + 'mm, transparent ' + extent + 'mm, transparent 100%)'
			});
		} else {
			// ページ数の表記を抽出できなかった場合は背景色は透明化
			extentElement.closest('.row').css({
				background: 'transparent'
			});
		};
	};
	
	function submit() {
		// submit前にcqlを組み立てる
		query = '';
		$('#cql-parameter').find('input').each(buildQuery);
		$('#query').val(query);
		
		// 取得開始位置を初期化
		startRecord = '1';
		// 検索結果一覧の表示領域の削除
		$('#result').empty();
		
		// 検索パラメーター復元のためurl書き換え
		history.pushState(null, null, '?' + $('#search-form').serialize());
		
		search();
		
		return false;
	}
	
	var query;
	// クエリを組み立て
	function buildQuery(index, element) {
		// 空ではないcqlパラメーターを全てANDで連結
		if (element.value != '') {
			if (query != '') {
				query += ' AND ';
			}
			query += element.name + ' = "' + element.value + '"';
		}
	}
	
	// クエリを復元
	function restoreQuery(index, element) {
		if (decodeURIComponent(location.search)
			.match(new RegExp(element.name + ' = "(.*?)"')) != null
		) {
			element.value = RegExp.$1;
		}
	}
	
	// Are you OK? (HTTPステータスチェック)
	function ruok(response) {
		// HTTPエラー処理
		if (!response.ok) {
			throw Error(response.statusText);
		}
		return response;
	}
	
	// レスポンスをテキスト形式で返却
	function resTxt(response) {
		return response.text();
	}
	
	// エラーをキャッチ
	function catErr(error) {
		// エラー表示
		alert(error);
		$('#search-btn').attr('disabled', false);
	}
	
	// 全角英数字→半角英数字
	function toHalf(c) {
		return String.fromCharCode(c.charCodeAt(0) - 0xFEE0);
	}
	
	// 文字列から数値に変換
	function toInt(a) {
		return parseInt(a, 10);
	}
	
	// 合計を算出
	function sum(sum, a) {
		return sum + a;
	}
})();

