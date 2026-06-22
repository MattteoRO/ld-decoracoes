-- ============================================================
-- ATUALIZAÇÃO COMPLETA DOS PRODUTOS - LD DECORAÇÕES
-- Execute no Supabase > SQL Editor
-- ============================================================

-- 1. Limpar produtos antigos (includes apagados por cascade)
delete from products;

-- 2. Inserir novos produtos
do $$
declare
  base_url text := 'https://jpocfndinjomjdalpgpw.supabase.co/storage/v1/object/public/produtos/';
  p1 uuid; p2 uuid; p3 uuid; p4 uuid; p5 uuid;
  p6 uuid; p7 uuid; p8 uuid; p9 uuid; p10 uuid;
  p11 uuid; p12 uuid; p13 uuid; p14 uuid; p15 uuid;
  p16 uuid; p17 uuid; p18 uuid; p19 uuid; p20 uuid;
  p21 uuid; p22 uuid;
begin

insert into products (title, price, image, category, description, active, sort_order) values
('Chanel Style', 0, base_url || 'chanel-style.jpeg', 'Locação',
'Painel de fundo arredondado branco texturizado (estilo mármore sutil). Arco orgânico de balões brancos foscos e balões pretos metalizados com laços de fita pretos. Letreiro de neon branco quente "Happy Birthday" manuscrito. 3 Cilindros brancos texturizados. 1 Grande laço de tecido preto decorativo no topo do painel. 1 Vaso alto de cristal texturizado com arranjo floral misto (rosas brancas, pêssego e folhagem). 1 Tapete felpudo cinza escuro. 1 Suporte aramado de metal preto minimalista para doces. 3 Suportes/Pratos minimalistas brancos e pretos para doces.',
true, 1) returning id into p1;

insert into products (title, price, image, category, description, active, sort_order) values
('Classic Pink & Cristal', 0, base_url || 'classic-pink-cristal.png', 'Locação',
'Painel de fundo arredondado na cor rosa seco (dusty rose). Arco orgânico em tons de rosa chiclete e branco. Letreiro de neon branco quente "Happy Birthday". 3 Mesas cilíndricas com base aramada dourada e tampos dourados. 1 Suporte alto aramado dourado. 2 Vasos de cristal texturizado com arranjos de rosas rosa e lilás. Arranjo floral de chão (rosas brancas, rosas, lilás e folhagem). Kit de balões metalizados em ouro rosê formando o número. 1 Tapete felpudo rosa claro. 1 Suporte de bolo aramado dourado rosê.',
true, 2) returning id into p2;

insert into products (title, price, image, category, description, active, sort_order) values
('Decoração de 15 Anos Clássica Roxo e Prata', 0, base_url || '15-anos-classica-roxo-prata.jpeg', 'Temas Personalizados',
'Painel de balões em espiral roxo e prata, cortina metálica roxa. Mesa retangular com tampo preto, duas mesas cilíndricas com tampo roxo e branco. Dois vasos brancos com plantas artificiais, dois vasos com flores artificiais (rosas e mix de flores roxas/rosa), dois suportes pretos para bolo, três suportes para doces. Balões em formato de números 1 e 5 em prata.',
true, 3) returning id into p3;

insert into products (title, price, image, category, description, active, sort_order) values
('Decoração de 15 Anos Glamourosa Roxo e Ouro', 0, base_url || '15-anos-glamourosa-roxo-ouro.jpeg', 'Temas Personalizados',
'Painel de balões em espiral roxo e lavanda, painel de fundo roxo com nome e idade "15 Anos" em branco. Três mesas cilíndricas com tampos em tons de roxo e lavanda, duas mesas com bases douradas e tampos de vidro. Dois suportes para bolo lavanda, três vasos com flores artificiais, duas bandejas lavanda, uma cesta com plantas artificiais. Painel circular com borboleta azul. Neon numérico 15 no painel de fundo.',
true, 4) returning id into p4;

insert into products (title, price, image, category, description, active, sort_order) values
('Decoração de Aniversário Tropical e Colorida', 0, base_url || 'aniversario-tropical-colorida.png', 'Temas Personalizados',
'Painel de balões orgânicos em tons de rosa, laranja e creme, painel de fundo azul com texto "Happy Birthday" em dourado. Quatro mesas com bases de madeira ripada e tampos circulares em madeira clara, duas mesinhas com tampo dourado e bases geométricas douradas, duas bases para bolo em aramado dourado. Dois vasos de flores artificiais, três bandejas cor-de-rosa, um suporte para doces dourado, balões no chão em tons metálicos. Neon numérico 15 na frente da mesa principal.',
true, 5) returning id into p5;

insert into products (title, price, image, category, description, active, sort_order) values
('Decoração Elegância Verde Esmeralda e Dourado', 0, base_url || 'elegancia-verde-esmeralda-dourado.jpeg', 'Locação',
'Três cilindros vazados, um arco redondo vazado, 1 tapete cinza, 1 jarro de flor, 1 boleira, kit de balão desconstruído em verde limão, bandeira e dourado, painel quadrado com cortinas verde e voal branco.',
true, 6) returning id into p6;

insert into products (title, price, image, category, description, active, sort_order) values
('Decoração Natural Boho', 0, base_url || 'natural-boho.jpeg', 'Locação',
'Painel de fundo arredondado cinza-taupe suave e painel de fundo arredondado verde-oliva fosco. Arco orgânico em tons de verde-musgo, creme, pêssego pálido e balões metalizados dourados, com balões transparentes bubble. Letreiro de neon branco quente "Happy Birthday" manuscrito. 3 Mesas de madeira com base ripada rústica (P, M, G). Kit de balões metalizados dourados grandes formando o número. 1 Tapete felpudo bege claro.',
true, 7) returning id into p7;

insert into products (title, price, image, category, description, active, sort_order) values
('Deep Blue & Gold', 0, base_url || 'deep-blue-gold.jpeg', 'Locação',
'Painel de fundo arredondado azul royal texturizado (visual de veludo molhado). Arco orgânico em tons de azul royal e prata metalizado desconstruído. Letreiro de neon branco quente "Happy Birthday" manuscrito. 3 Mesas de base ripada de madeira com acabamento rústico e tampos de madeira clara (P, M, G). 2 Vasos de cerâmica/cristal altos e texturizados com arranjo floral rústico. 1 Tapete felpudo azul royal vibrante. 3 Suportes dourados redondos com pé minimalistas. 1 Boleira redonda aramada dourada minimalista.',
true, 8) returning id into p8;

insert into products (title, price, image, category, description, active, sort_order) values
('Earthly Gold', 0, base_url || 'earthly-gold.jpeg', 'Locação',
'Painel de fundo arredondado rosa terracota sutil. Arco orgânico em tons de terracota, creme, ouro cromado e balões transparentes bubble. Letreiro de neon branco quente "Happy Birthday" manuscrito. 3 Mesas de base geométrica aramada de metal preto e tampos de madeira clara (P, M, G). 2 Vasos altos de cristal texturizado com arranjos floral misto. 1 Tapete de tecido bege texturizado. 2 Suportes aramados de metal preto para doces. 2 Boleiras/Pratos de metal preto minimalistas.',
true, 9) returning id into p9;

insert into products (title, price, image, category, description, active, sort_order) values
('Elegância Black & Gold', 0, base_url || 'elegancia-black-gold.jpeg', 'Locação',
'Painel de fundo preto texturizado. Arco orgânico desconstruído misturando balões pretos foscos e balões dourados cromados. Letreiro de neon branco quente com a frase "Happy Birthday". 1 Mesa de cubo dourada com tampo de espelho. 1 Mesa de cubo dourada (estilo aramado) vazada. 1 Cilindro preto grande. 1 Boleira redonda aramada dourada. 2 Suportes dourados redondos para doces com pés elevados. 1 Bandeja de doces dourada texturizada. 1 Tapete felpudo cinza escuro. 1 Vaso aramado alto dourado com buxinho de folhagem verde artificial.',
true, 10) returning id into p10;

insert into products (title, price, image, category, description, active, sort_order) values
('Fortune Tiger', 0, base_url || 'fortune-tiger.jpeg', 'Temas Personalizados',
'1 Painel de fundo retangular laranja vibrante com texto personalizado sublimado. 1 Painel redondo sublimado grande com a imagem do Fortune Tiger e texto temático. Arco orgânico misturando balões laranjas, amarelos e dourados metalizados. 3 Cilindros sublimados com arte temática do Fortune Tiger e padrões chineses (P, M, G). 1 Mesa de cubo pequena laranja vazada. 2 Vasos de cerâmica brancos com arranjos floral rústico (vermelho e verde). 1 Suporte de bolo laranja minimalista. 1 Boleira/Prato dourado minimalista. 1 Suporte branco minimalista para doces. 1 Tapete de grama sintética verde.',
true, 11) returning id into p11;

insert into products (title, price, image, category, description, active, sort_order) values
('Golden & Sunflower', 0, base_url || 'golden-sunflower.jpeg', 'Locação',
'Painel de fundo arredondado branco texturizado. Arco orgânico misturando balões dourados cromados e brancos foscos. Letreiro de neon branco quente "Happy Birthday". 3 Mesas de base geométrica aramada dourada com tampos de madeira clara. 2 Suportes altos aramados dourados (estilo taça) para vasos. 1 Vaso alto texturizado dourado com arranjo de flores amarelas e brancas. 1 Vaso alto texturizado branco com arranjo de flores mistas. Arranjo floral de chão (girassóis e rosas mistas). Kit de balões metalizados dourados. 1 Tapete de tecido texturizado bege/ouro. 1 Cachepô de madeira rústico com buxinho verde. 1 Suporte de bolo aramado dourado.',
true, 12) returning id into p12;

insert into products (title, price, image, category, description, active, sort_order) values
('Kit Festa Sonic Luxo azul e dourado', 0, base_url || 'sonic-luxo-azul-dourado.jpeg', 'Kit Festa',
'Led com a idade (se disponível). 3 Cilindros grande, médio e pequeno. 1 Painel redondo. 1 Arco lateral Sonic. 1 Boleira. 9 Bandejas para doces. 1 Suporte para sacolinhas. 1 Mesa principal branca. 1 Tapete vermelho ou azul. 1 Vaso com bola de grama. 2 Arcos orgânicos de balões.',
true, 13) returning id into p13;

insert into products (title, price, image, category, description, active, sort_order) values
('Nature Green & Gold', 0, base_url || 'nature-green-gold.jpeg', 'Locação',
'Painel de fundo retangular verde musgo. Cortinas laterais de cetim dourado e branco com abraçadeiras douradas. Arco orgânico em tons de verde folha, verde limão e dourado cromado. Letreiro de neon branco quente "Happy Birthday" em suporte redondo dourado. 3 Mesas cilíndricas de base aramada dourada com tampos de madeira clara. 1 Vaso alto branco (cristal) com buxinho verde. 1 Vaso de cerâmica branco com arranjo de folhagem verde. Decoração com folha de palmeira seca (leque) dourada. 1 Tapete felpudo cinza escuro. 1 Suporte de bolo aramado dourado. 2 Bandejas redondas douradas com espelho.',
true, 14) returning id into p14;

insert into products (title, price, image, category, description, active, sort_order) values
('Passion Red & Gold', 0, base_url || 'passion-red-gold.jpeg', 'Locação',
'Painel de fundo arredondado vermelho texturizado. Arco orgânico em tons de vermelho fosco e dourado cromado. Letreiro de neon branco quente formando o número desejado. 3 Mesas cilíndricas aramadas douradas com tampos vermelhos texturizados. 2 Vasos altos de cristal texturizado com arranjos de rosas vermelhas e folhas de palmeira seca douradas. 1 Tapete felpudo vermelho vibrante. 1 Suporte de bolo aramado dourado. 4 Bandejas douradas redondas com pé (boleira).',
true, 15) returning id into p15;

insert into products (title, price, image, category, description, active, sort_order) values
('Purple & Silver', 0, base_url || 'purple-silver.jpeg', 'Locação',
'Painel de fundo arredondado lilás texturizado. Arco orgânico em tons de roxo fosco, lilás e prata cromado. Placa manuscrita em relevo (mdf/acrílico) com o nome personalizado. 3 Mesas cilíndricas aramadas douradas com tampos roxos. 1 Suporte alto aramado dourado. 1 Vaso alto texturizado lilás com arranjo de rosas rosa e lilás. Arranjo floral de chão (rosas brancas, rosa choque e lilás com folhagem). 1 Tapete de tecido texturizado bege/ouro. 1 Suporte de bolo aramado dourado com tampo roxo.',
true, 16) returning id into p16;

insert into products (title, price, image, category, description, active, sort_order) values
('Royal Blue & Gold', 0, base_url || 'royal-blue-gold.jpeg', 'Locação',
'Painel de fundo arredondado azul royal texturizado. Arco orgânico misturando balões azul royal, azul claro e dourado cromado. Placa dourada texturizada com a frase "Happy Birthday" manuscrita. 3 Cilindros azuis royal (P, M, G). 2 Vasos de metal dourado alto com buxinhos verdes artificiais. Placa manuscrita em madeira/ouro com palavra personalizada. 1 Tapete felpudo bege claro/creme. 1 Suporte de bolo dourado com pé. 2 Bandejas retangulares douradas com espelho.',
true, 17) returning id into p17;

insert into products (title, price, image, category, description, active, sort_order) values
('Soft Rose & Gold', 0, base_url || 'soft-rose-gold.jpeg', 'Locação',
'Painel de fundo arredondado na cor rosa seco (dusty rose). Arco orgânico em tons de rosa chiclete e branco. Letreiro de neon branco quente "Happy Birthday". 3 Mesas cilíndricas com base aramada dourada (P, M, G) e tampos dourados. 1 Suporte alto aramado dourado. 1 Vaso de metal dourado rosê com arranjo de flores brancas. 1 Vaso de cerâmica canelado rosa com arranjo de flores rosas. Arranjo floral de chão (rosas brancas, rosas e folhagem). Kit de balões metalizados em ouro rosê formando o número. 1 Tapete felpudo rosa claro. 1 Suporte de bolo aramado dourado rosê.',
true, 18) returning id into p18;

insert into products (title, price, image, category, description, active, sort_order) values
('Sonic Delux', 0, base_url || 'sonic-delux.jpeg', 'Kit Festa',
'1 Arco romano Sonic. 1 Painel redondo. 3 Cilindros. 1 Mesa central tamanho médio. 1 Escadinha. Tapete azul. 9 Bandejas para doces. 1 Boleira.',
true, 19) returning id into p19;

insert into products (title, price, image, category, description, active, sort_order) values
('Vibrant Pink & Gold', 0, base_url || 'vibrant-pink-gold.jpeg', 'Locação',
'Painel de fundo rosa vibrante. Grande arco orgânico nas cores rosa choque e dourado cromado. Placa com a frase "Happy Birthday" em fonte branca manuscrita. 1 Mesa de cubo dourada com tampo de espelho. 1 Cilindro rosa vibrante grande. 1 Boleira redonda aramada dourada. 1 Suporte dourado redondo para doces com pés elevados. 1 Bandeja de doces dourada texturizada. Kit de balões metalizados rosa pink formando o número. 1 Tapete felpudo rosa claro. 1 Vaso aramado alto dourado com buxinho de folhagem verde artificial.',
true, 20) returning id into p20;

insert into products (title, price, image, category, description, active, sort_order) values
('Vibrant Purple', 0, base_url || 'vibrant-purple.png', 'Locação',
'Painel de fundo arredondado lilás suave texturizado. 1 Arco orgânico grande em tons de roxo fosco e roxo metalizado, e 1 coluna de balões lilás menor. Letreiro de neon branco quente "Happy Birthday" manuscrito. 3 Mesas de base geométrica aramada dourada (P, M, G). 3 Suportes aramados dourados (estilo gaiola minimalista) para doces. 3 Bandejas redondas douradas com espelho. Vasos altos de cristal texturizado com arranjos floral misto (rosas brancas, rosa choque, lilás e roxo). 1 Tapete de tecido bege texturizado.',
true, 21) returning id into p21;

insert into products (title, price, image, category, description, active, sort_order) values
('White & Crystal Black Bow', 0, base_url || 'white-crystal-black-bow.jpeg', 'Locação',
'Painel de fundo arredondado branco texturizado (estilo mármore sutil). Arco orgânico de balões brancos foscos decorados com pequenos laços de fita pretos. Letreiro de neon branco quente "Happy Birthday". 1 Grande laço de tecido preto decorativo no topo do painel. 3 Cilindros brancos texturizados (estilo canelado/ripado). 2 Vasos de cristal texturizado com arranjos floral (flores brancas, rosa chá e folhagem). 1 Tapete felpudo cinza escuro. 2 Suportes de bolo/doces brancos (estilo taça minimalista). 2 Pratos/bandejas pretos e transparentes para doces.',
true, 22) returning id into p22;

-- ============================================================
-- SUBPRODUTOS
-- ============================================================

insert into includes (product_id, name, sort_order) values
(p1,'Painel de fundo arredondado branco texturizado',0),(p1,'Arco orgânico balões brancos foscos e pretos metalizados',1),(p1,'Letreiro de neon "Happy Birthday"',2),(p1,'3 Cilindros brancos texturizados',3),(p1,'Laço de tecido preto decorativo no topo',4),(p1,'Vaso alto de cristal com arranjo floral misto',5),(p1,'Tapete felpudo cinza escuro',6),(p1,'Suporte aramado de metal preto para doces',7),(p1,'3 Suportes/Pratos minimalistas brancos e pretos',8);

insert into includes (product_id, name, sort_order) values
(p2,'Painel de fundo arredondado rosa seco',0),(p2,'Arco orgânico rosa chiclete e branco',1),(p2,'Letreiro de neon "Happy Birthday"',2),(p2,'3 Mesas cilíndricas com base aramada dourada',3),(p2,'1 Suporte alto aramado dourado',4),(p2,'2 Vasos de cristal com arranjos de rosas rosa e lilás',5),(p2,'Arranjo floral de chão',6),(p2,'Kit de balões metalizados em ouro rosê',7),(p2,'Tapete felpudo rosa claro',8),(p2,'Suporte de bolo aramado dourado rosê',9);

insert into includes (product_id, name, sort_order) values
(p3,'Painel de balões em espiral roxo e prata',0),(p3,'Cortina metálica roxa',1),(p3,'Mesa retangular com tampo preto',2),(p3,'2 Mesas cilíndricas tampo roxo e branco',3),(p3,'2 Vasos brancos com plantas artificiais',4),(p3,'2 Vasos com flores artificiais roxas/rosa',5),(p3,'2 Suportes pretos para bolo',6),(p3,'3 Suportes para doces',7),(p3,'Balões números 1 e 5 em prata',8);

insert into includes (product_id, name, sort_order) values
(p4,'Painel de balões em espiral roxo e lavanda',0),(p4,'Painel de fundo roxo com nome e idade em branco',1),(p4,'3 Mesas cilíndricas roxo e lavanda',2),(p4,'2 Mesas com bases douradas e tampos de vidro',3),(p4,'2 Suportes para bolo lavanda',4),(p4,'3 Vasos com flores artificiais',5),(p4,'2 Bandejas lavanda',6),(p4,'Cesta com plantas artificiais',7),(p4,'Painel circular com borboleta azul',8),(p4,'Neon numérico 15 no painel',9);

insert into includes (product_id, name, sort_order) values
(p5,'Painel de balões orgânicos rosa, laranja e creme',0),(p5,'Painel de fundo azul com "Happy Birthday" dourado',1),(p5,'4 Mesas com base de madeira ripada',2),(p5,'2 Mesinhas com tampo dourado',3),(p5,'2 Bases para bolo aramadas douradas',4),(p5,'2 Vasos de flores artificiais',5),(p5,'3 Bandejas cor-de-rosa',6),(p5,'Suporte para doces dourado',7),(p5,'Balões no chão metálicos',8),(p5,'Neon numérico 15',9);

insert into includes (product_id, name, sort_order) values
(p6,'3 Cilindros vazados',0),(p6,'1 Arco redondo vazado',1),(p6,'1 Tapete cinza',2),(p6,'1 Jarro de flor',3),(p6,'1 Boleira',4),(p6,'Kit de balão desconstruído verde limão, bandeira e dourado',5),(p6,'Painel quadrado com cortinas verde e voal branco',6);

insert into includes (product_id, name, sort_order) values
(p7,'Painel de fundo arredondado cinza-taupe',0),(p7,'Painel de fundo arredondado verde-oliva fosco',1),(p7,'Arco orgânico verde-musgo, creme, pêssego e dourado',2),(p7,'Balões transparentes bubble',3),(p7,'Letreiro de neon "Happy Birthday"',4),(p7,'3 Mesas de madeira com base ripada rústica (P, M, G)',5),(p7,'Kit de balões metalizados dourados com número',6),(p7,'Tapete felpudo bege claro',7);

insert into includes (product_id, name, sort_order) values
(p8,'Painel de fundo arredondado azul royal texturizado',0),(p8,'Arco orgânico azul royal e prata metalizado',1),(p8,'Letreiro de neon "Happy Birthday"',2),(p8,'3 Mesas de base ripada de madeira (P, M, G)',3),(p8,'2 Vasos altos com arranjo floral rústico',4),(p8,'Tapete felpudo azul royal vibrante',5),(p8,'3 Suportes dourados redondos com pé',6),(p8,'Boleira redonda aramada dourada',7);

insert into includes (product_id, name, sort_order) values
(p9,'Painel de fundo arredondado rosa terracota',0),(p9,'Arco orgânico terracota, creme, ouro cromado e bubble',1),(p9,'Letreiro de neon "Happy Birthday"',2),(p9,'3 Mesas de base geométrica aramada preta (P, M, G)',3),(p9,'2 Vasos altos de cristal com arranjo floral misto',4),(p9,'Tapete de tecido bege texturizado',5),(p9,'2 Suportes aramados de metal preto para doces',6),(p9,'2 Boleiras/Pratos de metal preto minimalistas',7);

insert into includes (product_id, name, sort_order) values
(p10,'Painel de fundo preto texturizado',0),(p10,'Arco orgânico balões pretos foscos e dourados cromados',1),(p10,'Letreiro de neon "Happy Birthday"',2),(p10,'1 Mesa de cubo dourada com tampo de espelho',3),(p10,'1 Mesa de cubo dourada aramada vazada',4),(p10,'1 Cilindro preto grande',5),(p10,'Boleira redonda aramada dourada',6),(p10,'2 Suportes dourados redondos para doces',7),(p10,'1 Bandeja de doces dourada texturizada',8),(p10,'Tapete felpudo cinza escuro',9),(p10,'Vaso aramado alto dourado com buxinho verde',10);

insert into includes (product_id, name, sort_order) values
(p11,'Painel de fundo retangular laranja vibrante sublimado',0),(p11,'Painel redondo sublimado com Fortune Tiger',1),(p11,'Arco orgânico laranja, amarelo e dourado metalizado',2),(p11,'3 Cilindros sublimados temáticos (P, M, G)',3),(p11,'1 Mesa de cubo pequena laranja vazada',4),(p11,'2 Vasos de cerâmica brancos com arranjo floral',5),(p11,'Suporte de bolo laranja minimalista',6),(p11,'Boleira/Prato dourado minimalista',7),(p11,'Suporte branco minimalista para doces',8),(p11,'Tapete de grama sintética verde',9);

insert into includes (product_id, name, sort_order) values
(p12,'Painel de fundo arredondado branco texturizado',0),(p12,'Arco orgânico dourado cromado e branco fosco',1),(p12,'Letreiro de neon "Happy Birthday"',2),(p12,'3 Mesas base geométrica aramada dourada (P, M, G)',3),(p12,'2 Suportes altos aramados dourados para vasos',4),(p12,'Vaso alto texturizado dourado com flores amarelas e brancas',5),(p12,'Vaso alto texturizado branco com flores mistas',6),(p12,'Arranjo floral de chão (girassóis e rosas mistas)',7),(p12,'Kit de balões metalizados dourados',8),(p12,'Tapete de tecido texturizado bege/ouro',9),(p12,'Cachepô de madeira rústico com buxinho verde',10),(p12,'Suporte de bolo aramado dourado',11);

insert into includes (product_id, name, sort_order) values
(p13,'Led com a idade (se disponível)',0),(p13,'3 Cilindros (grande, médio e pequeno)',1),(p13,'1 Painel redondo',2),(p13,'1 Arco lateral Sonic',3),(p13,'1 Boleira',4),(p13,'9 Bandejas para doces',5),(p13,'1 Suporte para sacolinhas',6),(p13,'1 Mesa principal branca',7),(p13,'1 Tapete vermelho ou azul',8),(p13,'1 Vaso com bola de grama',9),(p13,'2 Arcos orgânicos de balões',10);

insert into includes (product_id, name, sort_order) values
(p14,'Painel de fundo retangular verde musgo',0),(p14,'Cortinas laterais de cetim dourado e branco',1),(p14,'Arco orgânico verde folha, verde limão e dourado cromado',2),(p14,'Letreiro de neon "Happy Birthday" em suporte dourado',3),(p14,'3 Mesas cilíndricas base aramada dourada (P, M, G)',4),(p14,'Vaso alto branco (cristal) com buxinho verde',5),(p14,'Vaso de cerâmica branco com folhagem verde',6),(p14,'Folha de palmeira seca (leque) dourada',7),(p14,'Tapete felpudo cinza escuro',8),(p14,'Suporte de bolo aramado dourado',9),(p14,'2 Bandejas redondas douradas com espelho',10);

insert into includes (product_id, name, sort_order) values
(p15,'Painel de fundo arredondado vermelho texturizado',0),(p15,'Arco orgânico vermelho fosco e dourado cromado',1),(p15,'Letreiro de neon com o número desejado',2),(p15,'3 Mesas cilíndricas aramadas douradas com tampos vermelhos',3),(p15,'2 Vasos altos de cristal com rosas vermelhas e palmeira dourada',4),(p15,'Tapete felpudo vermelho vibrante',5),(p15,'Suporte de bolo aramado dourado',6),(p15,'4 Bandejas douradas redondas com pé (boleira)',7);

insert into includes (product_id, name, sort_order) values
(p16,'Painel de fundo arredondado lilás texturizado',0),(p16,'Arco orgânico roxo fosco, lilás e prata cromado',1),(p16,'Placa manuscrita em relevo com nome personalizado',2),(p16,'3 Mesas cilíndricas aramadas douradas com tampos roxos',3),(p16,'1 Suporte alto aramado dourado',4),(p16,'Vaso alto texturizado lilás com arranjo de rosas',5),(p16,'Arranjo floral de chão (rosas brancas, rosa choque e lilás)',6),(p16,'Tapete de tecido texturizado bege/ouro',7),(p16,'Suporte de bolo aramado dourado com tampo roxo',8);

insert into includes (product_id, name, sort_order) values
(p17,'Painel de fundo arredondado azul royal texturizado',0),(p17,'Arco orgânico azul royal, azul claro e dourado cromado',1),(p17,'Placa dourada com "Happy Birthday" manuscrita',2),(p17,'3 Cilindros azuis royal (P, M, G)',3),(p17,'2 Vasos de metal dourado alto com buxinhos verdes',4),(p17,'Placa manuscrita em madeira/ouro personalizada',5),(p17,'Tapete felpudo bege claro/creme',6),(p17,'Suporte de bolo dourado com pé',7),(p17,'2 Bandejas retangulares douradas com espelho',8);

insert into includes (product_id, name, sort_order) values
(p18,'Painel de fundo arredondado rosa seco (dusty rose)',0),(p18,'Arco orgânico rosa chiclete e branco',1),(p18,'Letreiro de neon "Happy Birthday"',2),(p18,'3 Mesas cilíndricas base aramada dourada (P, M, G)',3),(p18,'1 Suporte alto aramado dourado',4),(p18,'Vaso de metal dourado rosê com flores brancas',5),(p18,'Vaso de cerâmica canelado rosa com flores rosas',6),(p18,'Arranjo floral de chão (rosas brancas, rosas e folhagem)',7),(p18,'Kit de balões metalizados ouro rosê formando o número',8),(p18,'Tapete felpudo rosa claro',9),(p18,'Suporte de bolo aramado dourado rosê',10);

insert into includes (product_id, name, sort_order) values
(p19,'1 Arco romano Sonic',0),(p19,'1 Painel redondo',1),(p19,'3 Cilindros',2),(p19,'1 Mesa central tamanho médio',3),(p19,'1 Escadinha',4),(p19,'Tapete azul',5),(p19,'9 Bandejas para doces',6),(p19,'1 Boleira',7);

insert into includes (product_id, name, sort_order) values
(p20,'Painel de fundo rosa vibrante',0),(p20,'Grande arco orgânico rosa choque e dourado cromado',1),(p20,'Placa "Happy Birthday" em fonte branca manuscrita',2),(p20,'1 Mesa de cubo dourada com tampo de espelho',3),(p20,'1 Cilindro rosa vibrante grande',4),(p20,'Boleira redonda aramada dourada',5),(p20,'Suporte dourado redondo para doces',6),(p20,'Bandeja de doces dourada texturizada',7),(p20,'Kit de balões metalizados rosa pink formando o número',8),(p20,'Tapete felpudo rosa claro',9),(p20,'Vaso aramado alto dourado com buxinho verde',10);

insert into includes (product_id, name, sort_order) values
(p21,'Painel de fundo arredondado lilás suave texturizado',0),(p21,'Arco orgânico grande roxo fosco e roxo metalizado',1),(p21,'1 Coluna de balões lilás menor',2),(p21,'Letreiro de neon "Happy Birthday"',3),(p21,'3 Mesas de base geométrica aramada dourada (P, M, G)',4),(p21,'3 Suportes aramados dourados para doces',5),(p21,'3 Bandejas redondas douradas com espelho',6),(p21,'Vasos altos de cristal com arranjo floral misto roxo',7),(p21,'Tapete de tecido bege texturizado',8);

insert into includes (product_id, name, sort_order) values
(p22,'Painel de fundo arredondado branco texturizado',0),(p22,'Arco orgânico de balões brancos foscos com laços pretos',1),(p22,'Letreiro de neon "Happy Birthday"',2),(p22,'Grande laço de tecido preto decorativo no topo',3),(p22,'3 Cilindros brancos texturizados (canelado/ripado)',4),(p22,'2 Vasos de cristal com arranjo floral branco e rosa chá',5),(p22,'Tapete felpudo cinza escuro',6),(p22,'2 Suportes de bolo/doces brancos (taça minimalista)',7),(p22,'2 Pratos/bandejas pretos e transparentes para doces',8);

end $$;
