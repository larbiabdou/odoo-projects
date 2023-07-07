from odoo import api, fields, models


class PosConfig(models.Model):
    _inherit = 'pos.config'

    default_payment_method = fields.Many2one(
        comodel_name='pos.payment.method',
        string='Default payment method',
        required=False)

    enable_quick_payment = fields.Boolean(
        string='Quick payment',
        required=False)

