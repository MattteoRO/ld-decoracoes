-- Run this in Supabase > SQL Editor

-- Products table
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  price numeric(10,2) not null default 0,
  image text not null default '',
  category text not null default '',
  description text not null default '',
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- Includes (subprodutos) table
create table if not exists includes (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  name text not null,
  sort_order integer not null default 0
);

-- Indexes
create index if not exists includes_product_id_idx on includes(product_id);
create index if not exists products_sort_order_idx on products(sort_order);

-- Seed initial products
insert into products (title, price, image, category, description, active, sort_order) values
('Decoração Romântica Luxo', 1250.00, 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&q=80&w=600&h=600', 'Locação', 'Decoração completa com painel em tecido premium, mobiliário clássico e arranjos em tons rosé.', true, 1),
('Kit Festa Básico', 350.00, 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=600&h=600', 'Kit Festa', 'Kit completo para festas simples e bonitas. Prático para montar em casa ou salão.', true, 2),
('Kit Premium Luxo', 2350.00, 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&q=80&w=600&h=600', 'Kit Premium', 'Nossa decoração mais luxuosa com painel em tecido premium, mobiliário clássico dourado e arranjos exuberantes.', true, 3),
('Arco de Balões Orgânicos', 280.00, 'https://images.unsplash.com/photo-1533294455009-a77b7557d2d1?auto=format&fit=crop&q=80&w=600&h=600', 'Balões', 'Arco orgânico desconstruído com balões em cores personalizadas. Volume e elegância para a sua festa.', true, 4),
('Pegue e Monte Safari', 180.00, 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&q=80&w=600&h=600', 'Pegue e Monte', 'Kit prático para festas em casa. Retire o kit montado na nossa loja e decore você mesmo!', true, 5),
('Tema Princesa Encantada', 1590.00, 'https://images.unsplash.com/photo-1502635385003-ee1e6a1a742d?auto=format&fit=crop&q=80&w=600&h=600', 'Temas Personalizados', 'Decoração temática completa com cenário de castelo, elementos em dourado e muito brilho para a sua princesa.', true, 6);

-- Seed includes
do $$
declare
  p1 uuid; p2 uuid; p3 uuid; p4 uuid; p5 uuid; p6 uuid;
begin
  select id into p1 from products where title = 'Decoração Romântica Luxo';
  select id into p2 from products where title = 'Kit Festa Básico';
  select id into p3 from products where title = 'Kit Premium Luxo';
  select id into p4 from products where title = 'Arco de Balões Orgânicos';
  select id into p5 from products where title = 'Pegue e Monte Safari';
  select id into p6 from products where title = 'Tema Princesa Encantada';

  insert into includes (product_id, name, sort_order) values
  (p1, 'Painel retangular 3x2m', 0), (p1, 'Mesa provençal branca', 1), (p1, '2 cilindros rosa', 2), (p1, 'Arranjo floral artificial premium', 3), (p1, 'Bolo fake 3 andares', 4), (p1, 'Tapete personalizado', 5),
  (p2, 'Painel redondo 1.5m sublimado', 0), (p2, 'Trio de cilindros MDF', 1), (p2, '2 bandejas para doces', 2), (p2, 'Display de chão temático', 3),
  (p3, 'Painel retangular 3x2m Dourado', 0), (p3, 'Mesa clássica branca com arabescos', 1), (p3, 'Coroa em MDF Dourada', 2), (p3, '4 vasos romanos com arranjos', 3), (p3, 'Bolo fake 4 andares', 4), (p3, 'Cortina de LED', 5), (p3, 'Tapete personalizado', 6),
  (p4, 'Mão de obra da montagem', 0), (p4, 'Até 300 balões sortidos (5 a 18 polegadas)', 1), (p4, 'Cores personalizadas à sua escolha', 2),
  (p5, 'Trio de cilindros decorados', 0), (p5, 'Painel romano dobrável', 1), (p5, 'Displays de chão Safari', 2), (p5, 'Bandejas para doces', 3), (p5, 'Topo de bolo personalizado', 4),
  (p6, 'Cenário de castelo em MDF', 0), (p6, 'Painel sublimado 3m', 1), (p6, 'Mesa provençal dourada', 2), (p6, '6 cilindros decorados', 3), (p6, 'Arranjos florais', 4), (p6, 'Cortina de LED', 5), (p6, 'Bolo fake temático', 6);
end $$;
