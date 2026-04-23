const produtoModel = require('../model/eventoModel'); 

exports.getEventos = async (req, res) => { 
    try { 
        const eventos = await produtoModel.findAll(); 
        res.json(eventos);  
    } catch (err) { 
        console.error('Erro ao buscar eventos:', err); 
        res.status(500).json({ error: 'Erro interno ao buscar eventos' }); 
    } 
}; 

exports.createEvento = async (req, res) => { 
    const { nome, organizador, data_evento, capacidade, tipo, descricao } = req.body;  

    if (!nome || !organizador || !data_evento || capacidade === undefined || !tipo || !descricao) { 
        return res.status(400).json({ 
            error: 'Todos os campos (nome, organizador, data_evento, capacidade, tipo, descricao) são obrigatórios.' 
        }); 
    } 

    try { 
        const newEvento = await produtoModel.create(nome, organizador, data_evento, capacidade, tipo, descricao); 
        res.status(201).json(newEvento);  
    } catch (err) { 
        console.error('Erro ao criar evento:', err); 
        res.status(500).json({ error: 'Erro interno ao criar evento' }); 
    } 
}; 

exports.updateEvento = async (req, res) => { 
    const id = req.params.id;
    const { nome, organizador, data_evento, capacidade, tipo, descricao } = req.body; 

    if (!nome || !organizador || !data_evento || capacidade === undefined || !tipo || !descricao) { 
        return res.status(400).json({ error: 'Preencha todos os campos para atualizar o evento.' }); 
    } 

    try { 
        const updatedEvento = await produtoModel.update(id, nome, organizador, data_evento, capacidade, tipo, descricao); 
        if (!updatedEvento) { 
            return res.status(404).json({ error: 'Evento não encontrado.' }); 
        } 

        res.json(updatedEvento);  
    } catch (err) { 
        console.error('Erro ao atualizar evento:', err); 
        res.status(500).json({ error: 'Erro interno ao atualizar evento' }); 
    } 
}; 

exports.deleteEvento = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedEvento = await produtoModel.delete(id);
        
        if (!deletedEvento) {
            return res.status(404).json({ error: 'Evento não encontrado para exclusão.' });
        }
        
        res.json({ message: 'Evento removido com sucesso', evento: deletedEvento });
    } catch (err) {
        console.error('Erro ao deletar evento:', err);
        res.status(500).json({ error: 'Erro interno ao deletar evento' });
    }
};
