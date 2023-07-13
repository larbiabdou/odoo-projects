# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.

from collections import defaultdict
from datetime import timedelta

from odoo import api, fields, models, _
from odoo.exceptions import AccessError, UserError, ValidationError
from odoo.tools import float_is_zero
import logging

_logger = logging.getLogger(__name__)


class AccountMove(models.Model):
    _inherit = 'account.move'

    pos_order_id = fields.Many2one(
        comodel_name='pos.order',
        string='Ordre',
        required=False)
    commande = fields.Char(
        string='Commande',
        required=False)

    @api.model
    def _prepare_from_pos(self, order_data):
        PosSession = self.env["pos.session"]
        session = PosSession.browse(order_data["pos_session_id"])
        journal_sale = self.env['account.journal'].search([('type', '=', 'sale')])
        _logger.info(order_data)
        return {
            'commande': order_data["name"],
            "partner_id": order_data["partner_id"],
            "invoice_origin": _("Point of Sale %s") % (session.name),
            'journal_id': journal_sale[0].id,
            "user_id": order_data["user_id"],
            "type": 'out_invoice',
        }

    @api.model
    def _prepare_line_from_pos(self, order_data):
        return {
            'product_id': order_data["product_id"],
            "quantity": order_data["qty"],
            #'account_id': self.env.ref('l10n_dz.1_dz_pcg_recv_pos').id,
            'price_unit': order_data["price_unit"],
        }

    @api.model
    def create_account_move_from_pos(self, order_data):
        AccountMoveLine = self.env["account.move.line"]

        # Create Draft Sale order
        order_vals = self._prepare_from_pos(order_data)
        move_id = self.create(order_vals)

        # create Sale order lines
        lines = []
        for order_line_data in order_data["lines"]:
            # Create Sale order lines
            _logger.info('order_line_data')
            _logger.info(order_line_data)
            order_line_vals = self._prepare_line_from_pos(order_line_data[2])
            lines.append([0, 0, order_line_vals])
            #order_line_vals['move_id'] = account_move.id
            #account_move_line = AccountMoveLine.create(order_line_vals)
        if lines:
            move_id.invoice_line_ids = lines
            move_id.action_post()
