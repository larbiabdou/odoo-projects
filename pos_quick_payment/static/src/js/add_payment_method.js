odoo.define('pos_quick_payment.adding_payment_method', function (require) {
"use strict";
var screen = require('point_of_sale.screens');
var PosBaseWidget = require('point_of_sale.BaseWidget');
var gui = require('point_of_sale.gui');
var QuickPaymentScreenWidget = screen.PaymentScreenWidget.extend({
    show: function(){
        this._super();
        var payment_method = this.pos.config.default_payment_method;
        if(payment_method){
            this.click_paymentmethods(payment_method[0]);
            this.validate_order();
            this.pos.get_order().finalize();
           // gui.define_screen({name: 'main', widget: screen.ScreenWidget});
            //this.gui.show_screen('main');
        }
    }
});
gui.define_screen({name: 'quick_payment', widget: QuickPaymentScreenWidget});
screen.ActionpadWidget.include({
    renderElement: function() {
        var self = this;
        this._super();
          this.$('.pay_quick').click(function(){
            var order = self.pos.get_order();
            var has_valid_product_lot = _.every(order.orderlines.models, function(line){
                return line.has_valid_product_lot();
            });
            if(!has_valid_product_lot){
                self.gui.show_popup('confirm',{
                    'title': _t('Empty Serial/Lot Number'),
                    'body':  _t('One or more product(s) required serial/lot number.'),
                    confirm: function(){
                        self.gui.show_screen('payment');
                    },
                });
            }else{
                self.gui.show_screen('quick_payment');
            }
        });
        }

});
});