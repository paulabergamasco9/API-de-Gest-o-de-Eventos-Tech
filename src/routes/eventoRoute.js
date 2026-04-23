const express = require('express'); 
const router = express.Router(); 
const eventoController = require('../controller/eventoController'); 

router.get('/', eventoController.getEventos); 

// Cria um novo usuário (espera nome, cpf, email, telefone no body)
router.post('/', eventoController.createEvento); 

// Atualiza um usuário pelo ID (espera nome, cpf, email, telefone no body)
router.put('/:id', eventoController.updateEvento); 

// Remove um usuário pelo ID
router.delete('/:id', eventoController.deleteEvento); 

module.exports = router;