# Categorias

Nós no Cabo reúne projetos de tecnologia que resolvem problemas reais da sociedade. Por isso, as categorias descrevem **a área que o projeto beneficia**, não a tecnologia usada nem o tipo de artefato (repositório, documentação, etc.). A exceção é **IA e IoT**, mantida de propósito como o único eixo tecnológico (equivalente às verticais de tecnologia do OASIS).

A referência foi o programa OASIS (FIT), com os segmentos Agro, Saúde, Mobilidade, Energia e Cidades Inteligentes. Traduzimos esses segmentos de mercados para áreas de benefício público.

| Slug (`keyword.name`) | Rótulo | Abrange |
| --- | --- | --- |
| `ia-e-iot` | IA e IoT | IA aplicada ao bem comum, modelos e dados abertos em português, sensores, hardware aberto, automação |
| `educacao` | Educação | escolas, gestão escolar, materiais abertos, alfabetização |
| `saude` | Saúde | saúde pública, SUS, saúde mental, bem-estar |
| `meio-ambiente` | Meio ambiente | clima, água, florestas, energia limpa, reciclagem |
| `cidades` | Cidades | mobilidade, moradia, saneamento, espaços públicos, transparência, dados abertos |
| `comunidades` | Comunidades | voluntariado, ajuda mútua, participação, comunidades de periferia, rurais, indígenas e quilombolas |
| `inclusao` | Inclusão | acessibilidade, gênero, raça, LGBTQIA+, Libras, inclusão digital |
| `trabalho` | Trabalho | economia solidária, cooperativas, pequenos negócios, mercado de trabalho |
| `arte-e-cultura` | Arte e Cultura | artes, acervos, patrimônio, línguas indígenas e regionais |
| `alimentacao` | Alimentação | agricultura familiar, segurança alimentar, desperdício |
| `outros` | Outros | fallback |

A ordem da tabela é a ordem de exibição. Rótulos, ícones e descrições ficam no front-end, em `src/pages/Feed/constants/categories.ts`. O backend só precisa guardar o slug.

## Migração no backend

1. Criar as 11 keywords acima, com `name` igual ao slug.
2. Remover as antigas (`code`, `repository`, `collaboration`, `questions`, `answers`, `programming`, `documentation`, `web`, `mozilla`, `education`, `other`).
3. Não existe mapeamento 1:1 das tags técnicas para as novas áreas, então os sites existentes precisam ser reclassificados à mão. A única correspondência direta é `education` → `educacao`. Um site que ficar sem categoria recebe `outros`.
4. O cadastro (`POST /website`, campo `keywords: string[]`) agora envia slugs dessa lista, escolhidos por checkbox em vez de texto livre.

Enquanto a migração não acontece, o front-end continua funcionando: um slug desconhecido é exibido com o próprio nome e vai para o fim da lista.

## Filtro na URL

A categoria selecionada no feed fica em `?categoria=<slug>`. Assim, o link pode ser compartilhado e a seleção sobrevive a recarregar a página e à navegação voltar/avançar.
