import facebookIcon from '@/assets/icons/facebook.webp'
import googleIcon from '@/assets/icons/google.webp'
import { Button } from '@/components/ui/button'

// Login social está fora do escopo: os botões aparecem (fidelidade ao Figma),
// mas desabilitados, para nunca parecer que funcionaram (o motivo fica no title/leitor de tela).
export function SocialLogin() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3 text-sm">
        <span aria-hidden className="h-px flex-1 bg-border" />
        <span>Ou continue com</span>
        <span aria-hidden className="h-px flex-1 bg-border" />
      </div>
      <Button variant="outline" disabled title="Indisponível na demo" className="h-10 rounded-sm">
        {/* alt vazio: o texto do botão já diz qual é o serviço */}
        <img src={googleIcon} alt="" width={20} height={20} /> Continuar com Google
        <span className="sr-only">(indisponível na demo)</span>
      </Button>
      <Button variant="outline" disabled title="Indisponível na demo" className="h-10 rounded-sm">
        <img src={facebookIcon} alt="" width={20} height={20} /> Continuar com Facebook
        <span className="sr-only">(indisponível na demo)</span>
      </Button>
    </div>
  )
}
