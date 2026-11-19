# 環境変数の棚卸しと Vercel 切り替え手順

2026-11-19 時点のコード、ローカル設定のキー名、CI設定と Vercel の4プロジェクトのキー一覧に基づく移行手順。値、ビルド設定、ブランチ別上書きは認証復旧後に照合する。

## 環境別の割り当て（実装後）

| Vercel の対象 | メール | DB・Blob・接続先 |
|---|---|---|
| 本番用プロジェクトの Production | バックエンドに実送信用の EMAIL_FROM と ADMIN_NOTIFICATION_EMAIL | 本番用のフロント・バック・DB・ストアの組 |
| 開発用プロジェクトの Production | EMAIL_FROM は未設定。ダイジェストを含めテスト宛先へ | 開発用の組。フロントの定期ジョブもこの組を使用 |
| 両プロジェクトの Preview | 全ブランチで EMAIL_FROM は未設定 | Preview 用または開発用の組。ビルドで変更してよい DB を割り当てる |
| Development / ローカル | EMAIL_FROM は未設定 | ローカルのフロント・バック・DB。アップロードを試す場合は開発用ストア |

## 設定台帳

| 配置 | キー | 設定内容・移行判断 |
|---|---|---|
| バック | EMAIL_FROM、ADMIN_NOTIFICATION_EMAIL | 送信元が未設定・空白・不正なら Resend の onboarding@resend.dev → delivered@resend.dev に固定し、CC・BCC・Reply-To を消す。メールアドレス形式が有効な送信元はそのまま使う。管理者通知先が未設定または不正ならテスト宛先に送る。Resend が受理すると通知は送信済みになる。公開問い合わせ窓口は本文の CONTACT_EMAIL。初期管理者と同じアドレスを通知先に指定できる。通知先は明示的に設定する |
| バック | RESEND_API_KEY | テスト宛先への実際の送信にも必要。本番の送信元はこのキーで送信可能なドメインのアドレス |
| バック | POSTGRES_PRISMA_URL、POSTGRES_URL_NON_POOLING | 順にアプリ用とマイグレーション用直結URL。同一環境・同一DB・同一スキーマを指すこと。ローカルでアプリURLが直結なら後者を省略可能 |
| バック | FRONTEND_ORIGIN | フロントの正確な https origin。CORS が完全一致で比較し、認証・再設定メールのリンクにも使用。末尾スラッシュやパスを付けない。動的な Preview URL ごとに動かすには対応する設定が必要。固定の開発ドメインを使う場合は、そのドメインから検証する |
| フロント | BACKEND_ORIGIN、NEXT_PUBLIC_BACKEND_ORIGIN | 同じ環境のバックエンドの https origin を両方設定。前者はログイン・プロキシ、後者はAPI呼び出し・一部Cron・ビルド時の設定で参照。片方だけ更新するとログインと通常操作で接続先がずれる |
| フロント | NEXT_PUBLIC_FRONTEND_ORIGIN | 同じ環境のフロントの origin。絶対URLで自分の /api/proxy にアクセスするため、Preview に本番URLを入れると本番へ向かう |
| 両側 | AUTH_SECRET、CRON_SECRET | 用途ごとに異なる秘密値を用意し、対応するフロント・バック間で一致させる。本番と開発は分ける。既存 AUTH_SECRET を維持すれば、この整理によるセッション再発行を避けられる |
| バック | AUTH_SALT | 現行値は next-auth.session-token。JWTの検証時にCookieを取り出す名前。フロントが固定値を使うので、将来はコードで共有可能。現行バックでは必須 |
| フロント | AUTH_TRUST_HOST | 現行READMEの設定は true。利用中のAuth.jsは Vercel の環境も検出する。ローカル・E2Eを含め認証動作を確認するまでは維持 |
| 両側 | BLOB_READ_WRITE_TOKEN | 同じ環境のストアのトークンをサーバー側に設定。バックはBlob操作、フロントは管理者用講師画面でトークンの一部からストア識別子を導出。将来この依存を外せばフロントから削除可能。NEXT_PUBLIC_ は付けない |
| バック | BOOTSTRAP_ADMIN_EMAIL、BOOTSTRAP_ADMIN_NAME、BOOTSTRAP_ADMIN_PASSWORD | 初期管理者作成時のみ。メール省略で作成をスキップ、名前の既定値は Admin、新規作成時はパスワードが必要。ビルドが bootstrap を呼ぶので適用先DBとセットで確認 |
| ローカル・基盤 | PORT、NODE_ENV、VERCEL | PORT はローカルバックエンドの待受。NODE_ENV はCookieやビルド設定、VERCEL はサーバー起動分岐。Vercel上で開発用プロジェクトを区別するためにこれらを上書きしない |

### 廃止候補と時期

- KEY1、KEY2 は README とローカル設定に残る。アプリ内参照なし。FRONTEND_ORIGINS は監査資料に登場するが実装が読むのは単数形。
- フロントの AUTH_SALT はアプリから未参照。E2Eスクリプトがバックエンドに渡す設定は必要。NEXTAUTH_SECRET は AUTH_SECRET 設定済みの環境で削除可能。旧環境で前者だけを使っていれば、実効値を AUTH_SECRET に引き継ぐ。
- EMAIL_ENV と EMAIL_REPLY_TO は新コードで廃止。旧版へ戻す期間は旧設定を保持する。
- DATABASE_URL_UNPOOLED は Prisma CLI が POSTGRES_URL_NON_POOLING の次に読む別名。利用環境は先に正式キーへ移す。DATABASE_URL は Vitest の代替接続先。アプリ本体は POSTGRES_PRISMA_URL を読む。統合が自動生成するキーはアプリからの参照を外せばよい。
- テストDBの選択は TEST_DATABASE_URL → Testcontainers に整理する。現状はその間に POSTGRES_PRISMA_URL と DATABASE_URL も参照する。VitestのワーカーとE2Eでは子プロセスの直結URLもテストDBに固定する。現状は外部の直結URLが migrate deploy の接続先として優先され得る。

### Vercel のアプリ設定に追加する必要がないもの

| 利用箇所 | キー |
|---|---|
| Vitest、並行・性能テスト | TEST_DATABASE_URL、VITEST_WORKER_ID、VITEST_POOL_ID、TZ、CONCURRENCY_REPETITIONS、CONCURRENCY_SEED、PERF_CUSTOMERS、PERF_INSTRUCTORS、PERF_SLOTS_PER_INSTRUCTOR、PERF_START_DATE、PERF_END_DATE、PERF_CANCEL_PROBABILITY、PERF_SEED、PERF_OUTPUT |
| E2E実行側 | E2E_TARGET、E2E_BASE_URL、E2E_DATABASE_URL、E2E_ADMIN_EMAIL、E2E_ADMIN_PASSWORD、E2E_FIXTURE_ZIP |
| インポートコマンド | BETA_IMPORT_START_DATE、BETA_IMPORT_START_AT |
| CI・コンテナ | CI、CLAUDE_CODE_OAUTH_TOKEN（GitHub Secret）、POSTGRES_USER、POSTGRES_PASSWORD、POSTGRES_DB |
| プラットフォーム | VERCEL_ENV、VERCEL_GIT_COMMIT_REF はメール配信テストに登場。手入力で配信を切り替える用途はない |

## 実装後のローカル検証

1. 配信の単体テストで未設定・空文字・空白、有効・不正な送信元、テスト配信での Reply-To と CC/BCC の消去を確認する。実配信分岐はResendをモックし、管理者宛先の欠落・不正時にテスト宛先が使われることも検証する。
2. seed:preview は送信元が空かつループバックDBでのみ実行できる。拒否条件はテストで検証する。このコマンドはDBをリセットするので使い捨てDBを使う。
3. テストでは EMAIL_FROM を明示的に空にし、通常DBとテスト用DBの接続先を分ける。backend で npm test、frontend で npm run test:e2e を実行する。ワーカーのマイグレーション先がそのワーカーのDBであることも確認する。
4. ローカルの登録・認証メールをResendのテスト宛先で確認し、リンクからログインする。管理画面の講師画像のアップロード・表示、ダイジェストのテスト配信まで確認する。

## 認証復旧後の Vercel 作業順

1. 各プロジェクトの Root Directory、Build Command、Production Branch と、環境変数の Production / Preview / Development、共有変数、Previewのブランチ別上書きを照合する。特に開発用プロジェクトの Production を確認する。上書きや継承で非本番に EMAIL_FROM が残ると新コードは実配信する。
2. 自動デプロイされるブランチに新コードを入れる前に、新旧両方が動く設定を保存する。旧 EMAIL_ENV は本番のみ production、他は develop。確認時点で EMAIL_FROM の登録は本番バックの Production のみ。値が有効な送信元か確認し、同じ範囲に ADMIN_NOTIFICATION_EMAIL を追加する。本番で送信元が未設定・不正だと、登録やパスワード再設定が成功扱いでもユーザーにメールが届かない。
3. DB統合の割当を確認する。DB互換キーの廃止は別途、接続先を確認してから行う。backend/package.json の build は migrate deploy と bootstrap を実行する。Preview のビルド開始前に両方のDB URLを確認する。アプリのロールバックでも適用済みDB変更は戻らない。
4. 台帳に従って対応する両プロジェクトのURL、認証、Cron、Blobを合わせる。開発環境で新コードをビルド・再デプロイする。設定変更は既存デプロイには反映されず、NEXT_PUBLIC_* はビルド成果物に固定される。環境をまたぐ場合は対象環境で再ビルドする。[Vercelの設定反映](https://vercel.com/docs/environment-variables/managing-environment-variables) · [Next.jsの公開変数](https://nextjs.org/docs/app/guides/environment-variables)
5. 開発環境でログイン、ブラウザからのAPI、登録リンクのホスト、Resendの実際のTo、講師画像を確認する。Cronはフロントに定義され、バックへの通信も認証される。開発用フロントの Production でもスケジュールが動き得るので、呼び出し先と履歴を確認する。Previewだけでは定期実行を検証できない。[Vercel Cron](https://vercel.com/docs/cron-jobs/manage-cron-jobs)
6. 本番を対象設定でビルドし、管理下のテストアカウントでメール到達・問い合わせ窓口・リンク・ログインを確認する。クラス変更ダイジェストは管理者通知先で受信を確認する。旧版への切り戻し期間が終わってから廃止キーを片付ける。
