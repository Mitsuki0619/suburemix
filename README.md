# suburemix 素振りみっくす

本番運用中のURL：https://ms-tech-blog-remix-485.pages.dev/

※注意：supabaseは無料プランだとしばらく使わないと落ちるので、その影響でエラーが出て使えない可能性があります。

## 起動手順
本リポジトリをクローン後、.dev.varsに環境変数を記述し、下記のコマンドを実行する。

```
pnpm i
pnpm dev
```

※nodeはv22.11.0, pnpmは9.15.4

## アプリの説明

Remixを素振り（技術の検証のことを指す）するために作ったブログアプリケーション

ログイン認証（OIDC）、ブログの投稿・編集・削除・閲覧が可能なシンプルなCRUDアプリケーション

## 開発秘話

## 主要選定技術と意見

- React：Remixを試したかったため選定。

- Remix：Reactを専門とする身として、Remixは試しておかねばと感じていたため選定した。

- Conform：サーバー側のアクションと同期できるのがこれだけっぽかったので選定。開発体験はかなり良かった。

- zod：バリデーションに使用。軽量のvalibotも考えられたが一旦zodに慣れたかったため選定。

- TailwindCSS：開発でv0を活用しており、相性が良かったため選定。

- ShadcnUI：開発でv0を活用しており、相性が良かったため選定。余談だが、base UIがでてきたのでradixからちゃんと移行されるのか心配。

- Prisma：Drizzleという手段もあったが、一旦TypedSQLもでて勢いが出ているPrismaを選定。

- Prisma Accelerate：PrismaはTCP接続ベースのORMライブラリだが、Cloudflare WorkersのエッジからDBにアクセスしたく、そのためのHTTP接続が可能なPrisma Accelerateを導入。

**インフラ**

- supabase：RDBがよかったのと、個人的には一番使いやすいBaasと感じていたため採用。

- Cloudflare Pages/Workers：無料で早くて使いやすい。最高。

**開発環境**
- ESLint：安定のリンター。ReactCompilerのプラグインを使いたかったため選定。
- React Compiler：まだベータとはいえ、導入するメリットのほうがでかいと感じるため採用。もうプロダクトでも使っていいとは思ってる。

## まだ改善が見込める点・未実装機能
基本素振りが目的だったので特にないが、もうRemixはReact Routerに統合されたため、いずれReact Routerに移行したいところ。