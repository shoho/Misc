.DEFAULT_GOAL := help
SHELL := /bin/bash

PROJECT_NAME := city-merge
PORT := 8788

.PHONY: help
help: ## このヘルプを表示
	@echo "City Merge — Makefile targets"
	@echo ""
	@awk 'BEGIN {FS = ":.*##"} /^[a-zA-Z_-]+:.*##/ { printf "  \033[36m%-16s\033[0m %s\n", $$1, $$2 }' $(MAKEFILE_LIST)
	@echo ""

.PHONY: install
install: ## 依存（wrangler 等）をインストール
	npm install

.PHONY: setup
setup: install .dev.vars ## 初回セットアップ（install + .dev.vars 作成）
	@echo ""
	@echo "✅ セットアップ完了。"
	@echo "   .dev.vars を開いて OPENAI_API_KEY を編集してから 'make dev' を実行してください。"

.dev.vars:
	@if [ ! -f .dev.vars ]; then \
		cp .dev.vars.example .dev.vars; \
		echo "📝 .dev.vars を作成しました。OPENAI_API_KEY を編集してください。"; \
	fi

.PHONY: dev
dev: ## ローカル開発サーバーを起動（http://localhost:$(PORT)）
	@if [ ! -f .dev.vars ]; then \
		echo "❌ .dev.vars がありません。先に 'make setup' を実行してください。"; \
		exit 1; \
	fi
	npx wrangler pages dev . --port $(PORT)

.PHONY: login
login: ## Cloudflare に wrangler でログイン（初回のみ）
	npx wrangler login

.PHONY: project-create
project-create: ## Cloudflare Pages プロジェクトを作成
	npx wrangler pages project create $(PROJECT_NAME) --production-branch main

.PHONY: secret
secret: ## 本番の OPENAI_API_KEY を Cloudflare に登録（プロンプトで貼り付け）
	npx wrangler pages secret put OPENAI_API_KEY --project-name $(PROJECT_NAME)

.PHONY: access-code
access-code: ## 本番の APP_ACCESS_CODE を Cloudflare に登録（任意の合言葉）
	npx wrangler pages secret put APP_ACCESS_CODE --project-name $(PROJECT_NAME)

.PHONY: deploy-check
deploy-check: ## デプロイ前に Cloudflare 側の secret 登録を確認
	@echo "🔍 OPENAI_API_KEY の登録を確認..."
	@out=$$(npx wrangler pages secret list --project-name $(PROJECT_NAME) 2>&1 || true); \
	if echo "$$out" | grep -qE "project.*not.*found|404|does not exist"; then \
		echo "⚠️  Cloudflare Pages プロジェクト '$(PROJECT_NAME)' が見つかりません。"; \
		echo "   → 'make project-create' を先に実行してください。"; \
		exit 1; \
	fi; \
	if ! echo "$$out" | grep -q OPENAI_API_KEY; then \
		echo "❌ OPENAI_API_KEY が Cloudflare 側で未登録です。"; \
		echo "   このまま deploy するとサイトは 503 を返します。"; \
		echo "   → 'make secret' を実行してから 'make deploy' を再実行してください。"; \
		echo "   (チェックを無視して進めたい場合は 'make deploy-force')"; \
		exit 1; \
	fi
	@echo "✅ OPENAI_API_KEY 登録済み"

.PHONY: deploy
deploy: deploy-check ## Cloudflare Pages に本番デプロイ（secret 登録を事前検証）
	npx wrangler pages deploy . --project-name $(PROJECT_NAME)

.PHONY: deploy-force
deploy-force: ## deploy-check をスキップしてデプロイ
	npx wrangler pages deploy . --project-name $(PROJECT_NAME)

.PHONY: tail
tail: ## 本番のログをリアルタイムで見る
	npx wrangler pages deployment tail --project-name $(PROJECT_NAME)

.PHONY: bootstrap
bootstrap: install login project-create secret deploy ## 初回フルセットアップ（login → project 作成 → secret → deploy）
	@echo ""
	@echo "🚀 Cloudflare へのデプロイが完了しました。"

.PHONY: clean
clean: ## キャッシュと依存を削除
	rm -rf node_modules .wrangler

.PHONY: check
check: ## 設定の確認（ファイル有無 / wrangler バージョン）
	@echo "📁 Files:"
	@for f in index.html script.js style.css functions/api/generate.js package.json; do \
		if [ -f $$f ]; then echo "  ✅ $$f"; else echo "  ❌ $$f (missing)"; fi; \
	done
	@echo ""
	@echo "🔧 Local env:"
	@if [ -f .dev.vars ]; then echo "  ✅ .dev.vars exists"; else echo "  ⚠️  .dev.vars not found (run 'make setup')"; fi
	@if [ -d node_modules ]; then echo "  ✅ node_modules exists"; else echo "  ⚠️  node_modules not found (run 'make install')"; fi
	@echo ""
	@echo "📦 wrangler:"
	@npx wrangler --version 2>/dev/null || echo "  ⚠️  wrangler not installed (run 'make install')"
