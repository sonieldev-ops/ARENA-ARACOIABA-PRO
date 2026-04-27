# 🏟️ Arena Araçoiaba Pro

> **Sistema de Gestão Esportiva Premium para Ligas de Futebol de Pernambuco.**

O **Arena Araçoiaba Pro** é uma plataforma SaaS de alto valor desenvolvida para transformar a organização de campeonatos amadores e profissionais. Com foco em autoridade e controle operacional, o sistema oferece uma experiência "Premium Dark" que profissionaliza desde a escalação da arbitragem até o engajamento do torcedor.

---

## 🚀 Principais Módulos

### 📊 Dashboard Pro
Central de comando estratégica com KPIs em tempo real:
- Monitoramento de receita e crescimento mensal.
- Status operacional das partidas (Ao Vivo, Agendado, Finalizado).
- Ações rápidas para agilidade no dia a dia do administrador.

### ⚖️ Módulo de Arbitragem
Gestão profissional do corpo de oficiais:
- Cadastro completo de Juízes, Bandeirinhas, 4º Árbitros e Mesários.
- Painel de escalação oficial vinculado diretamente às partidas no Firestore.
- Histórico de jogos e controle de taxas por partida.

### 🏆 Gestão de Campeonatos (White Label)
Personalização total para cada competição:
- Ajuste de cores primárias e secundárias.
- Upload de logos e banners de capa exclusivos.
- Controle de status (Aberto/Encerrado) e visão detalhada de estatísticas.

### 👥 Atletas e Equipes
Organização simplificada de registros:
- Inscrição de atletas com foto e numeração oficial.
- **Importação em massa via CSV** com validação inteligente de dados.
- Vínculo direto com equipes e competições.

### 🛡️ Segurança e Operações
Controle total do ecossistema:
- **Backup Inteligente**: Exportação manual e automática dos dados da liga.
- **Modo Manutenção**: Bloqueio de acesso para torcedores durante ajustes.
- **Protocolo de Destruição**: Limpeza de dados históricos com autenticação em múltiplas etapas.

---

## 🛠️ Stack Tecnológica

- **Frontend**: Next.js 15 (App Router)
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS & Componentes Shadcn/UI
- **Backend**: Firebase (Firestore, Auth, Storage)
- **Relatórios**: jsPDF para súmulas e documentos oficiais
- **Ícones**: Lucide React

---

## 💻 Instalação e Desenvolvimento

1. **Clonar o repositório:**
   ```bash
   git clone https://github.com/seu-usuario/meu-projeto-web.git
   ```

2. **Instalar dependências:**
   ```bash
   npm install
   ```

3. **Configurar variáveis de ambiente:**
   Crie um arquivo `.env.local` com suas credenciais do Firebase:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
   # ... etc
   ```

4. **Rodar em ambiente de desenvolvimento:**
   ```bash
   npm run dev
   ```

5. **Build de produção:**
   ```bash
   npm run build
   ```

---

## 📂 Estrutura de Pastas

- `/app`: Rotas e páginas (Next.js App Router).
- `/src/modules`: Lógica de negócio, hooks e serviços divididos por domínio (admin, match, users, referees).
- `/components`: Componentes de UI reutilizáveis (seguindo padrão Shadcn).
- `/src/lib`: Configurações de bibliotecas externas (Firebase, Utils).
- `/public`: Ativos estáticos e logos.

---

## 🎯 Objetivo Comercial

Este sistema foi projetado para ser vendido como um produto SaaS de **alto valor (R$ 20.000+)**, oferecendo às ligas municipais de Pernambuco (Araçoiaba, Igarassu, Paulista, etc.) uma ferramenta de nível profissional que justifica o investimento através da organização e autoridade transmitida aos patrocinadores e atletas.

---

© 2024 **Arena Araçoiaba Pro** - Feito para quem vive o futebol.
