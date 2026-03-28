import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Como funciona o QR Code?",
    answer:
      "Após a compra, você receberá um QR Code exclusivo por email. Seu amor poderá escanear este código e acessar o app personalizado criado especialmente para vocês.",
  },
  {
    question: "Por quanto tempo tenho acesso?",
    answer:
      "O plano Lembrança Especial oferece acesso por 1 ano. Já o plano Celebração Eterna garante acesso vitalício ao app personalizado.",
  },
  {
    question: "Posso trocar as fotos depois?",
    answer:
      "Sim! Você pode atualizar as fotos e informações a qualquer momento durante o período de acesso do seu plano, através do seu painel de controle.",
  },
  {
    question: "Como adiciono a música?",
    answer:
      "No plano Celebração Eterna, você pode escolher qualquer música. Basta colar o link ou pesquisar a música na hora de criar sua lembrança.",
  },
  {
    question: "Posso presentear alguém?",
    answer:
      "Com certeza! O My Love You é o presente perfeito. Após criar, você recebe o QR Code para imprimir ou enviar digitalmente.",
  },
];

const FAQSection = () => {
  return (
    <section className="py-20 px-4">
      <div className="container max-w-3xl">
        <h2 className="text-gradient text-3xl md:text-4xl font-bold font-display text-center mb-12">
          Dúvidas Frequentes
        </h2>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className="bg-card border border-border rounded-xl px-6 data-[state=open]:border-primary/30"
            >
              <AccordionTrigger className="text-foreground font-semibold text-left hover:no-underline py-5">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-5">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQSection;
