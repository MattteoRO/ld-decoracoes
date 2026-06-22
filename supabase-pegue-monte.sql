-- KITS PEGUE E MONTE - Cole no Supabase > SQL Editor > Run

do $$
declare
  p1 uuid; p2 uuid; p3 uuid; p4 uuid; p5 uuid;
  p6 uuid; p7 uuid; p8 uuid; p9 uuid; p10 uuid;
begin

insert into products(title,price,image,category,description,active,sort_order) values
('Kit Princesas Disney',100,'','Pegue e Monte',
'Painel redondo com as principais princesas Disney, trio de cilindros tematicos em tons de rosa e dourado, vasos com flores e bandejas. Voce e a decoradora! Retire o kit na nossa loja e decore do seu jeito.',
true,30) returning id into p1;

insert into products(title,price,image,category,description,active,sort_order) values
('Kit Patrulha Canina (Rosa)',130,'','Pegue e Monte',
'Painel redondo com as personagens Skye e Everest, trio de cilindros com estampas de ossinhos e coracoes, vasos decorativos e bandejas. Retire na loja e decore voce mesma!',
true,31) returning id into p2;

insert into products(title,price,image,category,description,active,sort_order) values
('Kit Masha e o Urso',130,'','Pegue e Monte',
'Painel redondo tematico, cerca decorativa branca, cilindros com estampas de madeira e floresta, vasos e suportes para doces. Kit completo para voce decorar!',
true,32) returning id into p3;

insert into products(title,price,image,category,description,active,sort_order) values
('Kit Boteco',130,'','Pegue e Monte',
'Painel redondo simulando barril de chopp, cilindros com estampas de tijolinho, madeira e espuma de cerveja, vasos azuis e bandejas. Perfeito para festas adultas!',
true,33) returning id into p4;

insert into products(title,price,image,category,description,active,sort_order) values
('Kit Stitch (Completo)',130,'','Pegue e Monte',
'Painel redondo com o personagem Stitch e folhagens tropicais, trio de cilindros com estampas tropicais, vasos rosas e suportes roxos. Lindo para festas infantis!',
true,34) returning id into p5;

insert into products(title,price,image,category,description,active,sort_order) values
('Kit Minnie Mouse (Rosa)',130,'','Pegue e Monte',
'Painel redondo classico da Minnie, cilindros com estampa de poa e lacos, vasos florais e bandejas rosas. Kit completo para a festa da sua princesa!',
true,35) returning id into p6;

insert into products(title,price,image,category,description,active,sort_order) values
('Kit Debutante (15 Anos)',150,'','Pegue e Monte',
'Kit sofisticado com painel duplo (redondo e retangular), trio de cilindros em branco e dourado, arranjos de flores luxuosos. Para uma festa de 15 anos inesquecivel!',
true,36) returning id into p7;

insert into products(title,price,image,category,description,active,sort_order) values
('Kit Carros (Relampago McQueen)',100,'','Pegue e Monte',
'Painel redondo com pista de corrida, cilindros com estampa quadriculada, pneus e o personagem McQueen. Para os fas de velocidade!',
true,37) returning id into p8;

insert into products(title,price,image,category,description,active,sort_order) values
('Kit Dragon Ball Z',100,'','Pegue e Monte',
'Painel redondo com o personagem Goku, cilindros tematicos em laranja e azul com as esferas do dragao. Para os fas do anime!',
true,38) returning id into p9;

insert into products(title,price,image,category,description,active,sort_order) values
('Kit Astronauta / Espaco',130,'','Pegue e Monte',
'Painel redondo com astronauta e planetas, cilindros com estampas de foguete, lua e galaxia, suportes coloridos. Para os exploradores do universo!',
true,39) returning id into p10;

-- Subprodutos
insert into includes(product_id,name,sort_order) values
(p1,'Painel redondo Princesas Disney',0),(p1,'Trio de cilindros rosa e dourado',1),(p1,'Vasos com flores decorativos',2),(p1,'Bandejas para doces',3);

insert into includes(product_id,name,sort_order) values
(p2,'Painel redondo Skye e Everest',0),(p2,'Trio de cilindros ossinhos e coracoes',1),(p2,'Vasos decorativos',2),(p2,'Bandejas para doces',3);

insert into includes(product_id,name,sort_order) values
(p3,'Painel redondo tematico Masha',0),(p3,'Cerca decorativa branca',1),(p3,'Cilindros floresta e madeira',2),(p3,'Vasos decorativos',3),(p3,'Suportes para doces',4);

insert into includes(product_id,name,sort_order) values
(p4,'Painel redondo estilo barril de chopp',0),(p4,'Cilindros tijolinho e madeira',1),(p4,'Vasos azuis decorativos',2),(p4,'Bandejas para doces',3);

insert into includes(product_id,name,sort_order) values
(p5,'Painel redondo Stitch tropical',0),(p5,'Trio de cilindros tropicais',1),(p5,'Vasos rosas',2),(p5,'Suportes roxos para doces',3);

insert into includes(product_id,name,sort_order) values
(p6,'Painel redondo classico Minnie',0),(p6,'Cilindros poa e lacos',1),(p6,'Vasos florais',2),(p6,'Bandejas rosas',3);

insert into includes(product_id,name,sort_order) values
(p7,'Painel redondo debutante',0),(p7,'Painel retangular branco e dourado',1),(p7,'Trio de cilindros branco e dourado',2),(p7,'Arranjos de flores luxuosos',3);

insert into includes(product_id,name,sort_order) values
(p8,'Painel redondo pista de corrida McQueen',0),(p8,'Cilindros quadriculados e pneus',1),(p8,'Suportes para doces',2);

insert into includes(product_id,name,sort_order) values
(p9,'Painel redondo Goku',0),(p9,'Cilindros laranja e azul com esferas do dragao',1),(p9,'Suportes para doces',2);

insert into includes(product_id,name,sort_order) values
(p10,'Painel redondo astronauta e planetas',0),(p10,'Cilindros foguete, lua e galaxia',1),(p10,'Suportes coloridos para doces',2);

end $$;
