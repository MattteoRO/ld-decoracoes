export type Product = {
  id: string;
  title: string;
  price: number;
  image: string;
  category: string;
  description: string;
  includes: string[];
};

export const products: Product[] = [
  { 
    id: "1", 
    title: "Decoração Romântica Luxo", 
    price: 1250.00, 
    image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&q=80&w=600&h=600",
    category: "Locação",
    description: "Decoração completa com painel em tecido premium, mobiliário clássico e arranjos em tons rosé.",
    includes: ["Painel retangular 3x2m", "Mesa provençal branca", "2 cilindros rosa", "Arranjo floral artificial premium", "Bolo fake 3 andares", "Tapete personalizado"]
  },
  { 
    id: "2", 
    title: "Kit Festa Básico", 
    price: 350.00, 
    image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=600&h=600",
    category: "Kit Festa",
    description: "Kit completo para festas simples e bonitas. Prático para montar em casa ou salão.",
    includes: ["Painel redondo 1.5m sublimado", "Trio de cilindros MDF", "2 bandejas para doces", "Display de chão temático"]
  },
  { 
    id: "3", 
    title: "Kit Premium Luxo", 
    price: 2350.00, 
    image: "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&q=80&w=600&h=600",
    category: "Kit Premium",
    description: "Nossa decoração mais luxuosa com painel em tecido premium, mobiliário clássico dourado e arranjos exuberantes.",
    includes: ["Painel retangular 3x2m Dourado", "Mesa clássica branca com arabescos", "Coroa em MDF Dourada", "4 vasos romanos com arranjos", "Bolo fake 4 andares", "Cortina de LED", "Tapete personalizado"]
  },
  { 
    id: "4", 
    title: "Arco de Balões Orgânicos", 
    price: 280.00, 
    image: "https://images.unsplash.com/photo-1533294455009-a77b7557d2d1?auto=format&fit=crop&q=80&w=600&h=600",
    category: "Balões",
    description: "Arco orgânico desconstruído com balões em cores personalizadas. Volume e elegância para a sua festa.",
    includes: ["Mão de obra da montagem", "Até 300 balões sortidos (5 a 18 polegadas)", "Cores personalizadas à sua escolha"]
  },
  { 
    id: "5", 
    title: "Pegue e Monte Safari", 
    price: 180.00, 
    image: "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&q=80&w=600&h=600",
    category: "Pegue e Monte",
    description: "Kit prático para festas em casa. Retire o kit montado na nossa loja e decore você mesmo!",
    includes: ["Trio de cilindros decorados", "Painel romano dobrável", "Displays de chão Safari", "Bandejas para doces", "Topo de bolo personalizado"]
  },
  { 
    id: "6", 
    title: "Tema Princesa Encantada", 
    price: 1590.00, 
    image: "https://images.unsplash.com/photo-1502635385003-ee1e6a1a742d?auto=format&fit=crop&q=80&w=600&h=600",
    category: "Temas Personalizados",
    description: "Decoração temática completa com cenário de castelo, elementos em dourado e muito brilho para a sua princesa.",
    includes: ["Cenário de castelo em MDF", "Painel sublimado 3m", "Mesa provençal dourada", "6 cilindros decorados", "Arranjos florais", "Cortina de LED", "Bolo fake temático"]
  },
];

export const getProductById = (id: string) => products.find(p => p.id === id);
