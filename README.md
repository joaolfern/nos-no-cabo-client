# Nós no Cabo
"Nós no Cabo" é um webring dedicado a conectar e dar visibilidade a projetos de tecnologia independentes. Nosso objetivo é promover a troca de conhecimento técnico e experiências dentro da comunidade de desenvolvedores.

---

## Configurando

Crie o arquivo .env na raiz do projeto

Exemplo:
```bash
VITE_DEV_API_URL=http://localhost:3000
VITE_ENV=production
VITE_ENABLE_MOCKS=false
VITE_ADMIN_PASSWORD=fastpass
```

Lembre-se de utilizar a mesma senha da env do back-end (`VITE_ADMIN_PASSWORD`).

### 🐳 Executando com Docker

1. **Build da imagem:**
	```bash
	docker build -t my-app .
	```

2. **Execute o container:**
	```bash
	docker run -p 8080:80 my-app
	```

3. Acesse a aplicação em [http://localhost:8080](http://localhost:8080)

---

### 🚀 Ambiente de Desenvolvimento

1. **Clone o repositório:**
	```bash
	git clone https://github.com/joaolfern/nos-no-cabo-client.git
	cd nos-no-cabo-client
	```

2. **Instale as dependências:**
	```bash
	pnpm install
	# ou
	yarn install
	```

3. **Inicie o ambiente de desenvolvimento:**
	```bash
	pnpm dev
	# ou
	yarn dev
	```

---

### 📊 Arquitetura da Aplicação

Os diagramas da arquitetura atual (v1, Cloudflare Workers) e da primeira versão (v0) estão em
[`docs/architecture/`](docs/architecture/README.md) e, com um mapa interativo, em
[docs.nosnocabo.com.br](https://docs.nosnocabo.com.br).

---


### Back-end

https://github.com/joaolfern/nos-no-cabo-server
