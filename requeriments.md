🛠️ **Regra de Desenvolvimento - SOS Mecânicos**  
**Versão 1.0**  

Essa regra define **padrões de desenvolvimento**, **boas práticas**, **estrutura de projeto**, **funcionamento das principais funcionalidades** e **fluxo de dados** para o sistema **SOS Mecânicos**.

---

## 🎯 **Objetivo do Sistema**
Plataforma para **conectar clientes a mecânicos próximos**, permitindo a **solicitação de serviços de emergência ou agendados**, com **pagamento seguro via plataforma**, repasse de **80% ao mecânico** e **20% de retenção da plataforma**.

---

## 📁 **Estrutura de Pastas do Projeto**

```
/src
  /components      → Componentes reutilizáveis
  /pages           → Páginas do Next.js
  /services        → Integrações com APIs externas / internas (fetch, axios)
  /hooks           → Hooks customizados
  /contexts        → Context API (autenticação, usuário, etc.)
  /utils           → Funções utilitárias
  /types           → Tipagens do TypeScript
  /assets          → Ícones, imagens, etc.
  /styles          → Arquivos globais de estilo (se houver)
```

---

## 🧑‍💻 **Padrões Gerais de Código**

1. **Linguagens e Frameworks**
   - **Next.js** + **ReactJS** (versão estável mais recente)
   - **TypeScript**
   - **TailwindCSS** para todo o styling

2. **Importação de Pacotes Obrigatórios**
   - `react-hook-form` + `zod` → Validação de formulários
   - `axios` → Requisições HTTP
   - `react-query` → Fetch e cache de dados (opcional, dependendo da complexidade)
   - `mapbox` ou `leaflet` → Geolocalização (localização de clientes e mecânicos)
   - `shadcn/ui` → Componentes de UI (botões, inputs, modais)
   - `radix-ui` (opcional) → Acessibilidade de componentes complexos

3. **Padronização de Código**
   - Use `const` sempre que possível. Só use `let` se necessário.
   - Funções devem ser arrow functions:
     ```tsx
     const handleClick = () => { }
     ```
   - Funções de eventos SEMPRE iniciam com `handle`, ex.:
     ```tsx
     const handleSubmitForm = () => { }
     ```
   - Nomes descritivos SEMPRE, tanto para variáveis quanto para funções e componentes:
     ```tsx
     const VehicleCard = () => { }
     const userVehicleList = []
     ```

---

## 🎨 **Estilo e UI/UX**

1. **TailwindCSS**
   - Todas as estilizações são feitas **exclusivamente com TailwindCSS**.
   - Não criar CSS customizado a menos que extremamente necessário.
   - Exemplo:
     ```tsx
     <button
       className="bg-primary text-white py-2 px-4 rounded-xl hover:bg-primary-dark transition"
     >
       Solicitar Mecânico
     </button>
     ```

2. **Classes Condicionais**
   - Utilize `class:` sempre que possível:
     ```tsx
     <div className="class:active:bg-red-500"></div>
     ```

3. **Acessibilidade**
   - Todo botão ou link deve ter:
     ```tsx
     <button
       tabIndex={0}
       aria-label="Solicitar Mecânico"
       onClick={handleClick}
       onKeyDown={handleKeyDown}
     >
       Solicitar Mecânico
     </button>
     ```

---

## 📝 **Fluxos do Sistema**

### 1. **Autenticação e Cadastro**
- Login via **email/senha** ou **social login (Google/Facebook)**.
- Criação de conta de **Cliente** , **Mecânico** , **Seguradora** , **Guinchos**.
- **Context API** para autenticação global.
- Tokens salvos no `localStorage` ou `cookies` (Next.js).

### 2. **Cadastro de Veículos (Cliente)**
- Campos obrigatórios:
  - Tipo de veículo (dropdown)
  - Placa
  - Modelo
  - Ano
- Envio via API `/vehicles`.
- Formulário com validação usando `react-hook-form` + `zod`.

### 3. **Solicitação de Serviço (Cliente)**
- Captura de **geolocalização** do cliente.
- Seleção de veículo já cadastrado.
- Campo **Descrição do problema**.
- Envio da solicitação via API `/requests/create`.
- Notificação (real-time opcional) para os **mecânicos próximos**.

### 4. **Propostas de Orçamento (Mecânico)**
- Recebimento da solicitação de cliente próximo (baseado em raio de distância, 5km por padrão).
- Mecânico propõe um valor com descrição do serviço.
- Envio via API `/quotes/create`.

### 5. **Aceitação do Orçamento e Pagamento (Cliente)**
- Cliente escolhe uma das propostas.
- Integração com **Gateway de Pagamento** (ex.: Stripe, MercadoPago).
- Pagamento **liberado para a plataforma**, **retenção** até confirmação de serviço.

### 6. **Execução do Serviço**
- O mecânico vai até o local.
- Cliente acompanha status via tela de **acompanhamento**.

### 7. **Confirmação do Serviço**
- Cliente confirma que o serviço foi concluído.
- API `/services/confirm`.
- Liberação de pagamento:
  - 80% para o mecânico
  - 20% de retenção da plataforma

---

## 💰 **Regras de Pagamento**
- **Pagamento Antecipado** via plataforma.
- **Liberação** apenas após confirmação do cliente.
- **Divisão Automática**:
  - Plataforma → 20%
  - Mecânico → 80%

---

## 🛡️ **Segurança**
- Senhas sempre **criptografadas** (bcrypt no back-end).
- Requisições protegidas via **JWT**.
- Verificação de permissão em todas as rotas protegidas.
- Validação de **input** (cliente/mecânico) no front e no back-end.

---

## 🚀 **Boas Práticas**
1. **DRY Principle (Don't Repeat Yourself)** → Reutilize componentes.
2. **SRP (Single Responsibility Principle)** → Cada função/componente deve ter uma única responsabilidade.
3. **Componentização Inteligente** → Componentes pequenos e reutilizáveis.
4. **Tipagem Estrita (TypeScript)** → Nunca `any`! Sempre tipar props e dados vindos da API.

---

## 🔗 **Exemplo de Componente**

```tsx
import { useState } from "react"

type VehicleProps = {
  id: string
  model: string
  plate: string
  type: string
}

const VehicleCard = ({ id, model, plate, type }: VehicleProps) => {
  const handleSelectVehicle = () => {
    console.log(`Veículo selecionado: ${model}`)
  }

  return (
    <div
      tabIndex={0}
      aria-label={`Selecionar veículo ${model}`}
      onClick={handleSelectVehicle}
      onKeyDown={(e) => e.key === "Enter" && handleSelectVehicle()}
      className="border border-gray-300 rounded-lg p-4 hover:shadow-md cursor-pointer transition"
    >
      <h2 className="text-lg font-bold">{model}</h2>
      <p className="text-sm text-gray-600">Placa: {plate}</p>
      <p className="text-sm text-gray-600">Tipo: {type}</p>
    </div>
  )
}

export default VehicleCard
```

---

## ✅ **Checklist Antes de Subir Código**
- [ ] Revisar lógica e estrutura.
- [ ] Confirmar tipagem e ausência de `any`.
- [ ] Testar eventos (`onClick`, `onKeyDown`).
- [ ] Garantir acessibilidade.
- [ ] Testar fluxos de autenticação, solicitação, pagamento.
- [ ] Conferir integração com API.
