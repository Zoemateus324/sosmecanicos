# SOS Mecânicos

## Visão Geral

O **SOS Mecânicos** é um sistema desenvolvido para conectar motoristas a mecânicos de forma rápida e eficiente, facilitando o atendimento de emergências automotivas. O objetivo principal é agilizar o processo de solicitação de serviços mecânicos, proporcionando segurança e praticidade aos usuários.

---

## Objetivos do Sistema

- Facilitar a busca e contratação de mecânicos próximos.
- Permitir que mecânicos recebam solicitações em tempo real.
- Oferecer avaliações e feedbacks para melhorar a qualidade do serviço.
- Gerenciar histórico de atendimentos para usuários e mecânicos.

---

## Tecnologias Utilizadas

### Front-end

- **React.js**: Biblioteca principal para construção da interface.
- **Redux**: Gerenciamento de estado global.
- **Axios**: Consumo de APIs REST.
- **Styled-components**: Estilização dos componentes.
- **React Router**: Navegação entre páginas.

### Back-end

- **Node.js**: Ambiente de execução JavaScript.
- **Express.js**: Framework para criação de APIs REST.
- **SupabaseB**: Banco de dados SQL.
- **Mongoose**: ODM para MongoDB.
- **JWT**: Autenticação baseada em tokens.

---

## Como Trabalhar com o Sistema

### 1. Fork do Repositório

1. Acesse o repositório principal no GitHub.
2. Clique em **Fork** para criar uma cópia em sua conta.

### 2. Clonando o Projeto

```bash
git clone https://github.com/seu-usuario/sosmecanicos.git
cd sosmecanicos
```

### 3. Criando uma Branch

```bash
git checkout -b nome-da-sua-feature
```

### 4. Sincronizando com o Repositório Principal

```bash
git remote add upstream https://github.com/repositorio-principal/sosmecanicos.git
git fetch upstream
git merge upstream/main
```

### 5. Enviando Alterações

```bash
git add .
git commit -m "Descrição da alteração"
git push origin nome-da-sua-feature
```

### 6. Pull Request

- Acesse seu fork no GitHub e crie um **Pull Request** para o repositório principal.

---

## Como Rodar o Projeto Localmente

### Front-end

```bash
cd frontend
npm install
npm start
```

### Back-end

```bash
cd backend
npm install
npm run dev
```

- O front-end estará disponível em `http://localhost:3000`
- O back-end estará disponível em `http://localhost:5000`

---

## Testando o Sistema

### Front-end

```bash
cd frontend
npm test
```

### Back-end

```bash
cd backend
npm test
```

---

## Deploy

### Front-end

- Recomenda-se o uso do **Vercel** ou **Netlify**.
- Faça o build do projeto:
    ```bash
    npm run build
    ```
- Siga as instruções da plataforma escolhida para publicar a pasta `build`.

### Back-end

- Recomenda-se o uso do **Heroku** ou **Render**.
- Configure as variáveis de ambiente.
- Faça o deploy seguindo as instruções da plataforma.

---

## Contribuição

- Sempre crie branches para novas features ou correções.
- Descreva claramente suas alterações nos commits.
- Mantenha o repositório atualizado com o upstream.
- Siga o padrão de código definido no projeto.

---

## Contato

Dúvidas ou sugestões? Abra uma issue ou entre em contato com os mantenedores do projeto.
