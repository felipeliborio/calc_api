# calc_api

Projeto de API de calculadora. Pode executar as quatro operações básicas e suporta parêntesis. 
Um log das operações realizadas é armazenado e pode ser acessado por um usuário administrativo. 

Requisitos:
Node.js
Servidor Redis em execução (https://redis.io/)
Caso o ambiente definido no .env não seja "development" é preciso também adicionar as credenciais 
de um banco MySQL ao .env.

Para iniciar o projeto é preciso primeiro executar o comando yarn install, em seguida, com o pacote knex instalado globalmente, deve se fazer as migrações do banco (knex migrate:latest) 
e em seguida executar o projeto com yarn dev|start. Para executar o projeto com o comando yarn start 
é preciso primeiro executar o comando yarn build.


# Lista de endpoints

## Usuários
POST -> {{base}}/login
  - Retorna um token de sessão em caso de sucesso
  - É preciso passar esse token de usuário no header de todas as outras requisições pelo campo "x-access-token"
- BODY {
  username: string,
  password: string
}

POST -> {{base}}/user
  - Cria um novo usuário
  - Acessível apenas por usuários administradores
  - Usuários novos não são do tipo admin

- BODY {
  username: string,
  password: string
}

DELETE -> {{base}}/user/:id
  - Apaga um usuário
  - Apenas administradores têm acesso

GET -> {{base}}/users
  - Lista os usuários cadastrados
  - Apenas os administradores têm acesso

PUT {{base}}/user/changeType/:id
  - Altera o tipo de usuário

BODY {
  type: 'admin' | 'user'
}

## Operações
GET -> {{body}}/operations
  - Lista o log de operações
  - Acessível apenas a administradores
  
POST -> {{body}}/operation
  - Faz uma nova operação

BODY {
  operation: string
}

