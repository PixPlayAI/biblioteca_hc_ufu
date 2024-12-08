import { Html, Head, Main, NextScript } from 'next/document';

export default function MyDocument() {
  return (
    <Html lang="pt-BR">
      <Head>
        {/* Configurações básicas */}
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        {/* Meta Description para SEO */}
        <meta
          name="description"
          content="Plataforma inteligente desenvolvida pela Biblioteca e UGITS do HC-UFU/Ebserh que auxilia pesquisadores a estruturar metodologicamente suas perguntas de pesquisa usando formatos PICO, PICOT, PICOTE, PICOS e SPIDER. Ferramenta gratuita com suporte especializado."
        />

        {/* Título do Site */}
        <title>
          Assistente Digital para Estruturação de Perguntas de Pesquisa em Saúde | HC-UFU/Ebserh
        </title>

        {/* Favicon e ícones */}
        <link rel="icon" type="image/x-icon" href="/icons/favicon.ico" />
        <link rel="icon" type="image/png" href="/icons/favicon-16x16.png" sizes="16x16" />
        <link rel="icon" type="image/png" href="/icons/favicon-32x32.png" sizes="32x32" />
        <link rel="icon" type="image/png" href="/icons/favicon-96x96.png" sizes="96x96" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-icon-180x180.png" />
        <link rel="manifest" href="/icons/manifest.json" />
        <meta name="theme-color" content="#ffffff" />

        {/* Meta Tags Open Graph (Facebook, WhatsApp, LinkedIn) */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://biblioteca-hc-ufu.vercel.app/" />
        <meta
          property="og:title"
          content="Assistente Digital para Estruturação de Perguntas de Pesquisa em Saúde | HC-UFU/Ebserh"
        />
        <meta
          property="og:description"
          content="Ferramenta gratuita desenvolvida pela Biblioteca e UGITS do HC-UFU/Ebserh que guia pesquisadores na estruturação metodológica de suas questões de pesquisa. Suporte para PICO, PICOT, PICOTE, PICOS e SPIDER com análise em tempo real e feedback personalizado."
        />
        {/* Imagem para Open Graph */}
        <meta
          property="og:image"
          content="https://biblioteca-hc-ufu.vercel.app/biblioteca_hc_ufu_1200X630.png"
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta
          property="og:image:alt"
          content="Assistente Digital para Estruturação de Perguntas de Pesquisa em Saúde - Uma ferramenta do HC-UFU/Ebserh"
        />

        {/* Meta Tags Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Assistente Digital para Estruturação de Perguntas de Pesquisa em Saúde | HC-UFU/Ebserh"
        />
        <meta
          name="twitter:description"
          content="Plataforma interativa do HC-UFU/Ebserh que auxilia pesquisadores a estruturar metodologicamente suas questões usando PICO, PICOT e outros formatos. Desenvolvida pela Biblioteca e UGITS com suporte especializado gratuito."
        />
        <meta
          name="twitter:image"
          content="https://biblioteca-hc-ufu.vercel.app/biblioteca_hc_ufu_1200X600.png"
        />
        <meta
          name="twitter:image:alt"
          content="Assistente Digital para Estruturação de Perguntas de Pesquisa em Saúde - HC-UFU/Ebserh"
        />

        {/* Meta Tags Adicionais para WhatsApp (Imagem quadrada) */}
        <meta
          property="og:image"
          content="https://biblioteca-hc-ufu.vercel.app/biblioteca_hc_ufu_800X800.png"
        />
        <meta property="og:image:width" content="800" />
        <meta property="og:image:height" content="800" />

        {/* Meta Tags para Instagram (Opcional, Imagem 1080x1080) */}
        <meta
          property="og:image"
          content="https://biblioteca-hc-ufu.vercel.app/biblioteca_hc_ufu_1080X1080.png"
        />
        <meta property="og:image:width" content="1080" />
        <meta property="og:image:height" content="1080" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
