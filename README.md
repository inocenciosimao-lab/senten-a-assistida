# Sentença Assistida

Crie um sistema web profissional em português de Moçambique chamado “Sentença AI – Assistente de Sentenças Judiciais”. O objetivo é auxiliar magistrados/advogados na elaboração de minutas de sentenças criminais moçambicanas a partir do upload de: (1) acusação, (2) acta(s) da audiência de julgamento e (3) documentos/provas. A aplicação deve deixar claro que é uma ferramenta de apoio e que a decisão final, conferência jurídica e assinatura pertencem ao magistrado.

Base jurídica principal: Código de Processo Penal de Moçambique, Lei n.º 25/2019, com alterações relevantes da Lei n.º 18/2020; Código Penal, Lei n.º 24/2019, com alteração da Lei n.º 17/2020. Estruture a arquitetura para permitir actualização futura da legislação. Não invente artigos: quando a base legal não estiver confirmada, sinalize “CONFIRMAR BASE LEGAL”. O sistema deve também distinguir claramente CPP (processual) de CP (substantivo), corrigindo a intenção do requisito “CPP e subsidiariamente CPP” para CPP + CP, e permitir legislação especial aplicável ao caso.

Fluxo principal: Dashboard → Novo Processo → Upload dos documentos → extração/OCR e indexação → análise estruturada do processo → validação pelo utilizador → geração da minuta → revisão/editoração → exportação Word/PDF. Aceitar PDF, DOCX e imagens; mostrar progresso e permitir visualizar o texto extraído e a origem de cada facto.

A análise deve gerar, em campos editáveis e com rastreabilidade: cabeçalho/identificação do tribunal e processo; relatório; posições da acusação e defesa; factos provados; factos não provados; questão/questões a resolver; fundamentação de facto com apreciação crítica e individualizada da prova; fundamentação de direito; qualificação jurídica; análise dos elementos objectivos e subjectivos dos crimes; autoria/participação; causas de exclusão da ilicitude/culpa quando relevantes; circunstâncias agravantes e atenuantes com indicação da base legal e alerta para dupla valoração; medida concreta da pena e respectiva fundamentação; concurso de crimes quando aplicável; desconto de detenção/prisão preventiva quando legalmente aplicável; responsabilidade civil emergente do crime, quando pedida e provada; custas; destino de objectos/produtos/valores apreendidos quando aplicável; e dispositivo/decisão final.

Regras de segurança jurídica: nunca transformar alegações da acusação em factos provados automaticamente; separar alegação, prova e inferência; assinalar contradições entre acusação, acta e documentos; identificar lacunas probatórias; respeitar presunção de inocência e in dubio pro reo; considerar apenas prova legalmente utilizável; impedir citações de artigos sem validação na biblioteca jurídica; mostrar nível de confiança e alertas; permitir ao utilizador aceitar, rejeitar ou editar cada facto e fundamento antes da geração final. Incluir uma “Matriz de Prova” que ligue cada facto provado às provas/testemunhos/documentos que o sustentam e uma “Matriz de Elementos do Crime” que mostre cada elemento legal e a prova correspondente.

Interface: moderna, sóbria, profissional, adequada ao ambiente judicial, responsiva, com sidebar. Páginas: Dashboard, Processos, Novo Processo, Análise do Processo, Matriz de Prova, Minuta da Sentença, Biblioteca Jurídica, Configurações. Dashboard com processos recentes e estado. Novo Processo com dados básicos (n.º processo, tribunal, secção, juiz, arguido(s), ofendido(s), crimes imputados, data). Upload com drag-and-drop e cartões por tipo de documento. Análise em etapas com alertas. Editor de sentença com navegação por secções, autosave, comentários e histórico de versões. Botão “Gerar Minuta” e “Reanalisar”.

Biblioteca Jurídica inicial: registar Lei 25/2019/CPP, Lei 18/2020/alterações ao CPP, Lei 24/2019/CP e Lei 17/2020/alterações ao CP, com fonte, data e versão. Criar estrutura para carregar posteriormente textos integrais oficiais. Não apresentar a biblioteca como aconselhamento jurídico nem substituir a consulta do texto oficial.

Persistência: usar Supabase/PostgreSQL. Criar tabelas para processos, documentos, texto extraído, factos, provas, testemunhos, questões jurídicas, fundamentos, versões da sentença, referências legais e auditoria. Preparar autenticação. Privacidade: dados processuais são sensíveis; acesso por utilizador, logs de auditoria e nenhuma exposição pública por defeito.

Para a primeira versão, priorize uma experiência funcional de ponta a ponta com dados demonstrativos quando necessário: criar processo, upload/gestão de documentos, área de análise estruturada, matrizes, editor de sentença e exportação. Use componentes shadcn/ui e Tailwind, tipografia e espaçamento elegantes, sem excesso de elementos decorativos.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/8d3b70da-7017-4a6f-8c2e-8997f102f793).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
