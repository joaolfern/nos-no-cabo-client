import { TERMS_CONTACT_EMAIL } from '@/pages/Terms/utils/terms'
import styles from './TermsContent.module.scss'

const CONTACT_LINK = (
  <a href={`mailto:${TERMS_CONTACT_EMAIL}`}>{TERMS_CONTACT_EMAIL}</a>
)

export function TermsContent() {
  return (
    <div className={styles.terms}>
      <section>
        <h2>1. O que é o Nós no Cabo</h2>
        <p>
          Um webring gratuito e comunitário que reúne projetos brasileiros de
          tecnologia. Qualquer pessoa pode indicar um site, e quem cuida de um
          site pode instalar o selo da rede.
        </p>
      </section>

      <section>
        <h2>2. Aceite</h2>
        <p>
          Ao usar o Nós no Cabo, indicar um site ou instalar o selo, você
          concorda com estes termos. Se não concordar, não use o serviço.
        </p>
      </section>

      <section>
        <h2>3. Indicação de sites</h2>
        <p>
          Ao indicar um site, você declara que as informações enviadas são
          verdadeiras e que o site é público. Estar listado não significa
          parceria, patrocínio nem endosso do Nós no Cabo.
        </p>
      </section>

      <section>
        <h2>4. Curadoria automática</h2>
        <p>
          Todo site passa por uma verificação automática antes de aparecer na
          rede e é verificado de novo periodicamente. A rede não aceita:
        </p>
        <ul>
          <li>conteúdo ilegal;</li>
          <li>conteúdo sexual ou adulto (NSFW);</li>
          <li>
            discurso de ódio, discriminação ou preconceito de raça, cor, etnia,
            religião, procedência nacional, gênero, orientação sexual ou
            deficiência, nos termos da Lei nº 7.716/1989 e do entendimento do
            STF na ADO 26;
          </li>
          <li>incitação à violência;</li>
          <li>golpes, phishing ou software malicioso.</li>
        </ul>
        <p>
          A verificação é automatizada e pode falhar. Por isso, podemos remover
          ou ocultar qualquer site a qualquer momento, sem aviso prévio.
        </p>
      </section>

      <section>
        <h2>5. Conteúdo de terceiros</h2>
        <p>
          Cada site listado é de responsabilidade de quem o mantém. O Nós no
          Cabo não controla nem revisa manualmente esse conteúdo. Seguimos o
          Marco Civil da Internet (Lei nº 12.965/2014): removemos conteúdo
          indisponibilizado por ordem judicial e, quando houver notificação de
          divulgação não autorizada de imagens íntimas (art. 21), retiramos o
          site da rede assim que recebida.
        </p>
      </section>

      <section>
        <h2>6. O selo e os links de navegação</h2>
        <p>Ao instalar o selo, você:</p>
        <ul>
          <li>
            declara ter autorização para alterar o site onde ele será instalado;
          </li>
          <li>
            entende que os links Anterior, Próximo e Aleatório levam a sites de
            terceiros escolhidos pela rede, que mudam com o tempo;
          </li>
          <li>
            sabe que pode remover esses links a qualquer momento, mantendo
            apenas o link para o Nós no Cabo;
          </li>
          <li>
            mantém o atributo <code>data-nnc-widget</code> e o link para o Nós
            no Cabo, que são usados na verificação;
          </li>
          <li>
            não altera o selo de forma a sugerir endosso ou parceria que não
            existe.
          </li>
        </ul>
        <p>Remover o selo encerra a verificação do site.</p>
      </section>

      <section>
        <h2>7. Condutas proibidas</h2>
        <p>Não é permitido:</p>
        <ul>
          <li>indicar sites com o conteúdo descrito no item 4;</li>
          <li>se passar por outra pessoa ou projeto;</li>
          <li>automatizar indicações em massa;</li>
          <li>tentar burlar a verificação ou explorar falhas do serviço.</li>
        </ul>
      </section>

      <section>
        <h2>8. Denúncias</h2>
        <p>
          Para denunciar um site, use o botão “Notificar problema” na página
          dele ou escreva para {CONTACT_LINK}. Analisamos as denúncias e
          removemos o que violar estes termos. Conteúdo envolvendo crianças ou
          adolescentes (Lei nº 8.069/1990, ECA) é removido imediatamente e
          comunicado às autoridades.
        </p>
      </section>

      <section>
        <h2>9. Dados pessoais (LGPD, Lei nº 13.709/2018)</h2>
        <p>
          O Nós no Cabo não tem contas de usuário e não vende dados. Tratamos:
        </p>
        <ul>
          <li>as informações públicas dos sites indicados;</li>
          <li>contagens agregadas de visitas e redirecionamentos;</li>
          <li>
            dados técnicos usados para segurança e prevenção de abuso, como o
            endereço IP processado pela Cloudflare na verificação anti-robô.
          </li>
        </ul>
        <p>
          Preferências como tema, rascunhos e o aceite destes termos ficam
          apenas no seu navegador. Para exercer os direitos do art. 18 da LGPD
          (acesso, correção, exclusão, entre outros), escreva para{' '}
          {CONTACT_LINK}.
        </p>
      </section>

      <section>
        <h2>10. Sem garantias</h2>
        <p>
          O serviço é gratuito e oferecido “no estado em que se encontra”. Ele
          pode mudar, ficar fora do ar ou ser encerrado.
        </p>
      </section>

      <section>
        <h2>11. Alterações</h2>
        <p>
          Estes termos podem ser atualizados, e a data da versão fica no topo.
          Quem instala o selo verá o pedido de aceite de novo quando houver uma
          nova versão.
        </p>
      </section>

      <section>
        <h2>12. Lei e foro</h2>
        <p>
          Aplicam-se as leis brasileiras. Fica eleito o foro do domicílio do
          usuário, conforme o Código de Defesa do Consumidor.
        </p>
      </section>

      <p>Contato: {CONTACT_LINK}</p>
    </div>
  )
}
