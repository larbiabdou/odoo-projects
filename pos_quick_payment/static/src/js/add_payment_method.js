odoo.define('pos_quick_payment.adding_payment_method', function (require) {
"use strict";
var screen = require('point_of_sale.screens');
var PosBaseWidget = require('point_of_sale.BaseWidget');
var gui = require('point_of_sale.gui');
var core = require("web.core");
    var framework = require("web.framework");
    var rpc = require("web.rpc");
    var _t = core._t;
var QuickPaymentScreenWidget = screen.PaymentScreenWidget.extend({
    show: function(){
        this._super();
        var payment_method = this.pos.config.default_payment_method;
        if(payment_method){
            this.click_paymentmethods(payment_method[0]);
            this.validate_order();
            this.pos.get_order().finalize();
        }
    }
});
var CreditPaymentScreenWidget = screen.PaymentScreenWidget.extend({
    show: function(){
        this._super();
        var self = this;
        var payment_method = this.pos.config.default_payment_method;
        if(payment_method){
            this.click_paymentmethods(payment_method[0]);
            this.validate_order();
            framework.blockUI();
                    rpc.query({
                        model: "account.move",
                        method: "create_account_move_from_pos",
                        args: [this.pos.get("selectedOrder").export_as_JSON()],
                    })
                    .then(function() {
                            self.hook_create_sale_order_success();
                        })
                        .catch(function(error, event) {
                            self.hook_create_sale_order_error(error, event);
                        });
            this.pos.get_order().finalize();
        }
    },
    hook_create_sale_order_success: function() {
            framework.unblockUI();
        },
        hook_create_sale_order_error: function(error, event) {
            framework.unblockUI();
            event.preventDefault();
            if (error.code === 200) {
                // Business Logic Error, not a connection problem
                this.gui.show_popup("error-traceback", {
                    title: error.data.message,
                    body: error.data.debug,
                });
            } else {
                // Connexion problem
                this.gui.show_popup("error", {
                    title: _t("The order could not be sent"),
                    body: _t("Check your internet connection and try again."),
                });
            }
        },
});
screen.PaymentScreenWidget.include({
    show: function(){
        this._super();
        var payment_method = this.pos.config.default_payment_method;
        if(payment_method){
            this.click_paymentmethods(payment_method[0]);
        }
    },
    /*validate_order: function(force_validation) {
            this.finalize_validation();
    },*/
});
gui.define_screen({name: 'quick_payment', widget: QuickPaymentScreenWidget});
gui.define_screen({name: 'quick_payment_credit', widget: CreditPaymentScreenWidget});
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
        this.$('.pay_quick_credit').click(function(){
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
                self.gui.show_screen('quick_payment_credit');
            }
        });
        },
//    init: function(parent, options) {
//        var self = this;
//        this._super(parent, options);
//         this.keyboard_handler = function(event){
//            if (event.type === "keypress") {
//                if (event.keyCode === 13) { // Enter
//                    this.$('.pay_quick').click()
//                }
//            }
//            }
//        }

});
});