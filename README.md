# きゃんばしーず公式サイト

きゃんばしーずの公式Webサイトです。
HTML、CSS、JavaScriptで構成されており、ニュースや活動報告は簡易CMSページから投稿データを作成できます。

## 構成

- `index.html` - トップページ
- `news.html` - ニュース一覧
- `activities.html` - 活動内容・活動報告一覧
- `members.html` - メンバー紹介
- `cms.html` - ニュース・活動報告を管理する簡易CMS
- `css/style.css` - サイト全体のスタイル
- `js/cms-data.js` - CMS投稿データ
- `js/cms-render.js` - CMS投稿の表示処理
- `js/cms-admin.js` - CMS編集ページの処理
- `images/` - サイト内で使用する画像
- `news/` - 個別ニュースページ
- `guidelines/` - ガイドライン関連ページ

## ローカルで確認する

静的サイトなので、基本的には `index.html` をブラウザで開くだけで確認できます。

CMSやページ遷移の動作をより本番に近い形で確認したい場合は、任意のローカルサーバーを使ってください。

```bash
python -m http.server 8000
```

起動後、ブラウザで `http://localhost:8000/` を開きます。

## CMSの使い方

1. `cms.html` をブラウザで開きます。
2. 種別、日付、カテゴリ、タイトル、概要、詳細ページURL、画像URLなどを入力します。
3. `追加する` を押します。
4. 画面下部の生成データをコピー、または `cms-data.js をダウンロード` します。
5. 生成された内容で `js/cms-data.js` を置き換えます。

CMSページ上の投稿内容はブラウザの `localStorage` に一時保存されます。公開サイトに反映するには、必ず `js/cms-data.js` の更新が必要です。

## 画像を表示する時の注意

画像URLには、サイトのルートから見た相対パスを入力します。

```text
images/activity-event.jpg
images/parkProject.png
```

次の点を確認してください。

- 画像ファイルが `images/` フォルダに入っている
- ファイル名の大文字・小文字、拡張子が一致している
- パスの先頭に不要な `/` や `../` を付けていない
- `cms.html` で投稿を作った後、`js/cms-data.js` に生成データを反映している

## 投稿データの形式

`js/cms-data.js` は次のような形式です。

```javascript
window.CanvaseedsCMS = {
  posts: [
    {
      id: "news-2026-10-01-example",
      type: "news",
      title: "投稿タイトル",
      date: "2026-10-01",
      category: "お知らせ",
      excerpt: "一覧に表示する概要文",
      url: "news/news-20261001.html",
      featured: true,
      image: "images/activity-event.jpg",
      alt: "画像の説明"
    }
  ]
};
```

`type` は `news` または `activity` を指定します。`featured` が `true` の活動報告はトップページにも表示されます。

## ニュース詳細ページの作り方

ニュース一覧から「詳しく見る」で移動するページを作りたい場合は、`news/` フォルダの中に個別HTMLを追加します。

既存のページをコピーして作るのが一番簡単です。


詳細ページを作ったら、主に次の部分を書き換えます。

- `<title>` の投稿タイトル
- `<p class="news-category">` のカテゴリ
- `<time datetime="YYYY-MM-DD">` の日付
- `<h1>` の見出し
- 本文の `<p>` やリンク

詳細ページを一覧から開けるようにするには、CMS投稿データの `url` に詳細ページのパスを入れます。

```javascript
{
  id: "news-2026-10-10-example",
  type: "news",
  title: "投稿タイトル",
  date: "2026-10-10",
  category: "イベント",
  excerpt: "一覧に表示する概要文",
  url: "news/news-20261010.html",
  featured: true,
  image: "images/parkProject.png",
  alt: "イベントの様子"
}
```

詳細ページ内では、トップページや画像へのパスに `../` を付けます。

```html
<link rel="stylesheet" href="../css/style.css">
<a href="../index.html">ホーム</a>
<img src="../images/logo.png" alt="団体ロゴ">
<script src="../js/main.js"></script>
```

ニュース一覧やトップページのCMS投稿データでは、サイトのルートから見たパスを書くため `../` は付けません。

## 公開前チェック

- 各ページのリンク切れがないか確認する
- 画像が表示されているか確認する
- スマートフォン幅でレイアウトが崩れていないか確認する
- `cms.html` で作成した投稿が `js/cms-data.js` に反映されているか確認する
- 個別ページを追加した場合は、一覧から詳細ページへ移動できるか確認する
