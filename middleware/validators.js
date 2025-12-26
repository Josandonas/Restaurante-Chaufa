const { body, validationResult } = require('express-validator');

const pratoValidation = [
    body('nome_pt').trim().notEmpty().withMessage('Nome em português é obrigatório'),
    body('nome_es').trim().notEmpty().withMessage('Nome em espanhol é obrigatório'),
    body('preco_brl').isFloat({ min: 0 }).withMessage('Preço em BRL deve ser um número válido'),
    body('preco_bob').isFloat({ min: 0 }).withMessage('Preço em BOB deve ser um número válido'),
    body('destaque').optional().isIn(['0', '1', 'true', 'false']).withMessage('Destaque deve ser 0, 1, true ou false'),
    body('categoria_id').optional(),
    body('ativo').optional(),
    body('ordem').optional().isInt({ min: 0 }).withMessage('Ordem deve ser um número inteiro')
];

const loginValidation = [
    body('email').isEmail().withMessage('Email inválido'),
    body('senha').notEmpty().withMessage('Senha é obrigatória')
];

function handleValidationErrors(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
}

module.exports = {
    pratoValidation,
    loginValidation,
    handleValidationErrors
};
