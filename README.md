Sistema de Pedidos com Controle de Estoque

Este projeto é uma API REST desenvolvida em Node.js que simula o backend de um sistema simples de e-commerce. A aplicação permite cadastro e autenticação de usuários, criação de produtos e criação de pedidos com múltiplos itens, incluindo validação de estoque e cálculo automático do valor da compra.

A API foi construída utilizando Node.js com Express, PostgreSQL como banco de dados, JWT para autenticação, Swagger para documentação dos endpoints e Docker com Docker Compose para execução do ambiente. O sistema também integra com a API pública ViaCEP para validar o CEP informado no pedido e obter dados de localização.

Entre as funcionalidades principais estão cadastro e login de usuários com geração de token JWT, criação e listagem de produtos, criação de pedidos com múltiplos itens e listagem dos pedidos do usuário autenticado. Durante a criação do pedido o sistema valida o CEP utilizando a ViaCEP, verifica se existe estoque suficiente para cada produto solicitado, reduz automaticamente o estoque dos itens vendidos e calcula o valor total da compra com base no subtotal dos produtos e em um frete estimado definido pela região do estado.

Algumas regras de negócio foram implementadas para garantir consistência do sistema. Não é possível criar pedidos com estoque insuficiente, o estoque é atualizado automaticamente após a venda e cada pedido é associado ao usuário autenticado. O CEP informado precisa ser válido e existir na base da ViaCEP para que o pedido seja processado.

Para executar o projeto localmente basta ter Docker e Docker Compose instalados e executar o comando docker compose up -d --build. Após iniciar, a API estará disponível em http://localhost:3000
 e a documentação interativa da API pode ser acessada em http://localhost:3000/docs
 através do Swagger.
